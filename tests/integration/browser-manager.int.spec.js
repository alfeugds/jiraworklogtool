const browserManager = require('./browser-manager')

describe('Browser Manager', () => {
  test('Get browser instance with extension installed', async () => {
    try {
      const chrome = await browserManager.getBrowser()
      expect(chrome.newPage).not.toBeNull()
      await chrome.close()
    } catch (e) {
      fail(e)
    }
  })
})
