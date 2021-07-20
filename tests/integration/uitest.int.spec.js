const browserManager = require('./browser-manager')
const {
  getOptionsPage,
  getPopupPage,
  makeSureJiraUrlIsConfigured
} = require('./jira-extension-functions')

describe('UI Test', () => {
  describe('popup', () => {
    let browser
    let extensionInfo
    beforeEach(async () => {
      // browser must be initialized
      browser = await browserManager.getBrowser()
      extensionInfo = extensionInfo || await browserManager.getExtensionInfo(browser)
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
