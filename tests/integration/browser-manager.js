const puppeteer = require('puppeteer')
const CRX_PATH = `${process.cwd()}/chrome-extension/`

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
    }
  }
})()
