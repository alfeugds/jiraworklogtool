const jiraMock = require('./jira-mock')

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

module.exports = {
  makeSureJiraUrlIsConfigured,
  openOptionsPage,
  getPopupPage,
  getOptionsPage,
}