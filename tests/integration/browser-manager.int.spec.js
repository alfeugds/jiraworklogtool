const browserManager = require('./browser-manager')

describe('Browser Manager', () => {
  test('Get browser instance with extension installed', async () => {
    try {
      const browser = await browserManager.getBrowser()
      const { popupUrl } = await browserManager.getExtensionInfo(browser)

      expect(browser.newPage).not.toBeNull()
      expect(popupUrl).toMatch(/chrome-extension:\/\/\w{32}\/popup.html/)

      await browser.close()
    } catch (e) {
      fail(e)
    }
  })
})
