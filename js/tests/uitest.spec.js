const puppeteer = require('puppeteer');

describe('UI Test', () => {
    describe('popup.js', () => {
        test.only('Loads successfully with no worklogs', async () => {

            const browser = await getBrowser();
            const popup = await getPopupPage(browser);
            const errorMessage = await popup.getErrorMessage();
            expect(errorMessage).toEqual('Please go to Options and make sure you are logged in Jira, and the Jira Hostname is correct.');
            await popup.clickOptionsPage();

            const optionsPage = await getOptionsPage(browser);
            await optionsPage.setValidJiraUrl();
            await optionsPage.clickOnTestconnection();

            await browser.close();
        });
        test('Loads successfully with some worklogs');
        test('Adds some worklogs from text');
        test('POSTs some worklogs');
        test('PUTs some worklogs');
        test('DELETEs some worklogs');
    });
});

async function getBrowser(){
    const CRX_PATH = '../../../../../chrome-extension/';

    return await puppeteer.launch({
        headless: false, // extensions only supported in full chrome.
        args: [
            `--disable-extensions-except=${CRX_PATH}`,
            `--load-extension=${CRX_PATH}`,
            '--user-agent=PuppeteerAgent'
        ]
    });
}

async function getPopupPage(browser){
    let self = this;
    self.page = await browser.newPage();

    //ignore error dialog
    page.on('dialog', async dialog => {
        await dialog.accept();
    });
    
    await page.goto('chrome-extension://ehkgicpgemphledafbkdenjjekkogbmk/popup.html');

    return {
        getErrorMessage: async () => {
            const errorMessage = await page.evaluate(() => document.querySelector('.error_status h2').textContent);
            return errorMessage;
        },
        clickOptionsPage: async () => {
            return page.click('h2>a');
        }
    }
}

async function getOptionsPage(browser){
    let self = this;
    let pages = await browser.pages()
    self.optionsPage = pages[2];

    self.optionsPage.on('dialog', async dialog => {
        console.log(dialog.message());
        await dialog.accept();
    });

    return {
        setValidJiraUrl: async () => {
            return optionsPage.type('#jiraUrl', 'https://jira.com');
        },
        clickOnTestconnection: async () => {
            return optionsPage.click('#testConnection');
        }
    }
}