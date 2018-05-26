describe('UI Test', () => {
    describe('popup.js', () => {
        test.only('Loads successfully with no worklogs', () => {
            const puppeteer = require('puppeteer');

            const CRX_PATH = '../../chrome-extension/';

            puppeteer.launch({
                headless: false, // extensions only supported in full chrome.
                args: [
                    `--disable-extensions-except=${CRX_PATH}`,
                    `--load-extension=${CRX_PATH}`,
                    '--user-agent=PuppeteerAgent'
                ],
                executablePath: 'C:\\Users\\Alfeu\\Documents\\dev\\tools\\chromedriver'
            }).then(async browser => {
                // ... do some testing ...
                await browser.close();
            });
        });
        test('Loads successfully with some worklogs');
        test('Adds some worklogs from text');
        test('POSTs some worklogs');
        test('PUTs some worklogs');
        test('DELETEs some worklogs');
    });
});