const puppeteer = require('puppeteer');
const jiraMock = require('./jira-mock');

describe('UI Test', () => {
    describe('popup.js', () => {
        test.only('Loads successfully with no worklogs', async (done) => {
            try{
                const browser = await getBrowser();
                const popup = await getPopupPage(browser);
                const errorMessage = await popup.getErrorMessage();
                expect(errorMessage).toEqual('Please go to Options and make sure you are logged in Jira, and the Jira Hostname is correct.');
                await popup.clickOptionsPage();
                await popup.wait();
    
                const optionsPage = await getOptionsPage(browser);
                await optionsPage.setValidJiraUrl();
                await optionsPage.clickOnTestconnection();
                const connectionResultMessage = await optionsPage.waitForTestConnectionResult();
                expect(connectionResultMessage).toEqual('Connection [OK]');
    
                await browser.close();
                done();
            }catch(e){
                fail(e);
                done();
            }
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
        },
        wait: async () => {
            return page.waitFor(100);
        }
    }
}

async function getOptionsPage(browser){
    let self = this;
    let pages = await browser.pages()
    let dialogDeferred = null;
    let dialogPromise = null;
    this.page = pages.filter( p => p.url().includes('options.html'))[0];
    
    //intercept all requests
    await page.setRequestInterception(true);
    page.on('request', request => {
        if(request.url().includes('chrome-extension://'))
            request.continue();
        else
            request.respond(jiraMock.getResponse(request));
    });

    self.page.on('dialog', async dialog => {
        let dialogMessage = dialog.message();
        console.log(dialogMessage);
        await dialog.accept();
        dialogDeferred.resolve(dialogMessage);
    });

    return {
        setValidJiraUrl: async () => {
            return self.page.type('#jiraUrl', 'https://jira.com');
        },
        clickOnTestconnection: async () => {
            dialogPromise = new Promise((resolve, reject) => {
                dialogDeferred = {
                    resolve: resolve,
                    reject: reject
                };
            });
            return self.page.click('#testConnection');
        },
        waitForTestConnectionResult: async () => {
            return dialogPromise;
        }
    }
}