const puppeteer = require('puppeteer')
const jiraMock = require('./jira-mock')

const CRX_PATH = `${process.cwd()}/chrome-extension/`

describe('UI Test', () => {
  describe('popup', () => {
    let browser
    let extensionInfo
    beforeEach(async () => {
      // browser must be initialized
      browser = await getBrowser()
      extensionInfo = extensionInfo || await getExtensionInfo(browser)
    })
    afterEach(async () => {
      await browser.close()
    })
    test('Loads successfully with no worklogs', async (done) => {
      try {
        const popup = await getPopupPage(browser, extensionInfo)
        const errorMessage = await popup.getErrorMessage()
        expect(errorMessage).toEqual('Please go to Options and make sure you are logged in Jira, and the Jira Hostname is correct.')
        await popup.clickOptionsPage()
        await popup.wait()

        const optionsPage = await getOptionsPage(browser)
        await optionsPage.setValidJiraUrl()
        await optionsPage.clickOnTestconnection()
        const connectionResultMessage = await optionsPage.waitForTestConnectionResult()
        expect(connectionResultMessage).toEqual('Connection [OK]')
        done()
      } catch (e) {
        fail(e)
        done()
      }
    })
    test('Loads successfully with some worklogs', async done => {
      try {
        await makeSureJiraUrlIsConfigured(browser, extensionInfo)
        const popupPage = await getPopupPage(browser, extensionInfo)
        await popupPage.wait()
        await popupPage.setWorklogDate('01/01/2018')
        const savedJiraArray = await popupPage.getJiraArray()
        const commentArray = await popupPage.getCommentArray()
        const timeSpentArray = await popupPage.getTimeSpentArray()
        expect(savedJiraArray).toEqual(['CMS-123', 'CMS-456'])
        expect(timeSpentArray).toEqual(['1h 50m', '2h 50m'])
        expect(commentArray).toEqual(['tech onboarding', 'tech onboarding 2'])

        done()
      } catch (e) {
        fail(e)
        done()
      }
    })
    test('Adds some worklogs from text', async done => {
      // given I have the extension opened and with jira configured
      await makeSureJiraUrlIsConfigured(browser, extensionInfo)
      const popup = await getPopupPage(browser, extensionInfo)
      await popup.wait()
      // and I select the worklog date as 01/01/2018
      await popup.setWorklogDate('01/01/2018')
      // then I see the total worklog as 4.67h
      let totalWorklog = await popup.getTotalWorklog()
      expect(totalWorklog).toEqual('4.67h')
      // when I write down the following worklog
      const worklogText = '30m some worklog'
      await popup.setWorklogText(worklogText)
      // then I should see the worklogs in the worklog table
      const commentArray = await popup.getCommentArray()
      expect(commentArray.sort()).toEqual(['tech onboarding', 'tech onboarding 2', 'some worklog'].sort())
      // and I should see the total worklog time updated to 5.17h
      totalWorklog = await popup.getTotalWorklog()
      expect(totalWorklog).toEqual('5.17h')

      done()
    })
    test.todo('POSTs some worklogs')
    test.todo('PUTs some worklogs')
    test.todo('DELETEs some worklogs')
  })
})

async function getBrowser () {
  return puppeteer.launch({
    headless: false, // extensions only supported in full chrome.
    args: [
      `--disable-extensions-except=${CRX_PATH}`,
      `--load-extension=${CRX_PATH}`,
      '--user-agent=PuppeteerAgent',
      '--no-sandbox',
      '--disable-setuid-sandbox'
    ]
  })
}

async function getExtensionInfo (browser) {
  const page = await browser.newPage()

  // test get id
  await page.goto('https://www.google.com/')
  const extensionId = await page.evaluate(() => document.getElementById('jiraworklog_id').value)
  const popupUrl = `chrome-extension://${extensionId}/popup.html`
  const optionsUrl = `chrome-extension://${extensionId}/options.html`

  console.log({ popupUrl })
  return {
    extensionId,
    popupUrl,
    optionsUrl
  }
}

async function makeSureJiraUrlIsConfigured (browser, extensionInfo) {
  await openOptionsPage(browser, extensionInfo)
  const optionsPage = await getOptionsPage(browser)
  await optionsPage.setValidJiraUrl()
  await optionsPage.clickOnTestconnection()
  await optionsPage.waitForTestConnectionResult()
  await optionsPage.clickOnSave()
}

async function openOptionsPage (browser, extensionInfo) {
  const page = await browser.newPage()
  await page.waitFor(200)
  return page.goto(extensionInfo.optionsUrl)
}

async function getPopupPage (browser, extensionInfo) {
  async function getValueArrayFromInputs (page, selector) {
    return page.evaluate((selector) =>
      Array.from(document.querySelectorAll(selector))
        .map((i) => i.value), selector)
  }

  const page = await browser.newPage()

  // ignore error dialog
  await page.on('dialog', async dialog => {
    await dialog.accept()
  })

  await page.setRequestInterception(true)
  await page.on('request', request => {
    if (request.url().includes('chrome-extension://')) { request.continue() } else { request.respond(jiraMock.getResponse(request)) }
  })

  await page.goto(extensionInfo.popupUrl)

  await page.waitFor(300)

  return {
    getErrorMessage: async () => {
      const errorMessage = await page.evaluate(() => document.querySelector('.error_status h2').textContent)
      return errorMessage
    },
    clickOptionsPage: async () => {
      await page.click('h2>a')
      return page.waitFor(100)
    },
    wait: async () => {
      return page.waitFor(100)
    },
    setWorklogDate: async (date) => {
      await page.type('#worklogDate', date || '01/01/2018')
      await page.waitFor(100)
      await page.click('#getWorklogButton')
      return page.waitFor(300)
    },
    getJiraArray: async () => {
      return getValueArrayFromInputs(page, 'input[name=jira]')
    },
    getTimeSpentArray: async () => {
      return getValueArrayFromInputs(page, 'input[name=timeSpent]')
    },
    getCommentArray: async () => {
      return getValueArrayFromInputs(page, 'input[name=comment]')
    },
    getWorklogText: async () => {
      return page.evaluate(() => document.querySelector('#worklog').value)
    },
    setWorklogText: async worklogText => {
      await page.waitFor(100)
      await page.type('#worklog', worklogText)
      await page.waitFor(100)
      await page.click('#addWorklogs')
      return page.waitFor(100)
    },
    getTotalWorklog: async () => {
      await page.waitFor(200)
      return page.evaluate(() => document.querySelector('#totalHours').textContent)
    }
  }
}

async function getOptionsPage (browser) {
  const pages = await browser.pages()
  let dialogDeferred = null
  let dialogPromise = null
  const page = pages.filter(p => p.url().includes('options.html'))[0]

  // intercept all requests
  await page.setRequestInterception(true)
  page.on('request', request => {
    if (request.url().includes('chrome-extension://')) { request.continue() } else { request.respond(jiraMock.getResponse(request)) }
  })

  page.on('dialog', async dialog => {
    const dialogMessage = dialog.message()
    await dialog.accept()
    dialogDeferred.resolve(dialogMessage)
  })

  return {
    setValidJiraUrl: async () => {
      await page.waitFor(100)
      await page.type('#jiraUrl', 'https://jira.com')
      return page.waitFor(300)
    },
    clickOnTestconnection: async () => {
      dialogPromise = new Promise((resolve, reject) => {
        dialogDeferred = {
          resolve: resolve,
          reject: reject
        }
      })
      await page.click('#testConnection')
      return page.waitFor(100)
    },
    clickOnSave: async () => {
      await page.click('#save')
      return page.waitFor(300)
    },
    waitForTestConnectionResult: async () => {
      await page.waitFor(100)
      return dialogPromise
    }
  }
}
