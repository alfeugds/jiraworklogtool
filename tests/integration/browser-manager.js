const puppeteer = require('puppeteer')
const CRX_PATH = `${process.cwd()}/dist/ui-test/chrome-extension/`

module.exports = (() => {
  return {
    getBrowser: async () => {
      return puppeteer.launch({
        headless: false, // extensions only supported in full chrome.
        args: [
          `--disable-extensions-except=${CRX_PATH}`,
          `--load-extension=${CRX_PATH}`,
          '--user-agent=PuppeteerAgent'
        ]
      })
    },
    getExtensionInfo: async (browser) => {
      const page = await browser.newPage()

      // go to any page, so that the content.js can inject the extension id in a new element
      await page.goto('https://www.google.com/')
      const extensionId = await page.evaluate(() => document.getElementById('jiraworklog_id').value)
      const popupUrl = `chrome-extension://${extensionId}/popup.html?new-window`
      const optionsUrl = `chrome-extension://${extensionId}/options.html`

      console.log({ popupUrl })
      return {
        extensionId,
        popupUrl,
        optionsUrl
      }
    }
  }
})()
