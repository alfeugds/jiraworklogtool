const puppeteer = require('puppeteer');
const jiraMock = require('./jira-mock');

const CRX_PATH = `${process.cwd()}/chrome-extension/`;
const CHROME_EXTENSION_URL = 'chrome-extension://fdlngnncmegpefbfmdjbjepgobgkengh/'

describe('UI Test', () => {
    describe('popup.js', () => {
        test('Loads successfully with no worklogs', async (done) => {
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
        test('Loads successfully with some worklogs', async done => {
            try{
                //browser must be initialized
                const browser = await getBrowser();
                await makeSureJiraUrlIsConfigured(browser);
                const popupPage = await getPopupPage(browser);
                await popupPage.setWorklogDate('01/01/2018');
                const savedJiraArray = await popupPage.getJiraArray();
                const commentArray = await popupPage.getCommentArray();
                const timeSpentArray = await popupPage.getTimeSpentArray();
                expect(savedJiraArray).toEqual(['CMS-123', 'CMS-456']);
                expect(timeSpentArray).toEqual(['1h 50m', '2h 50m']);
                expect(commentArray).toEqual(['tech onboarding', 'tech onboarding 2']);

                //browser must be closed.
                //TODO: add it in tear down
                await browser.close();
                done();

            }catch(e){ 
                fail(e);
                done();
            }
        });
        test('Adds some worklogs from text');
        test('POSTs some worklogs');
        test('PUTs some worklogs');
        test('DELETEs some worklogs');
    });
});

async function getBrowser(){

    return puppeteer.launch({
        headless: false, // extensions only supported in full chrome.
        args: [
            `--disable-extensions-except=${CRX_PATH}`,
            `--load-extension=${CRX_PATH}`,
            '--user-agent=PuppeteerAgent'
        ]
    });
}

async function makeSureJiraUrlIsConfigured(browser){
    await openOptionsPage(browser);
    const optionsPage = await getOptionsPage(browser);
    await optionsPage.setValidJiraUrl();
    await optionsPage.clickOnTestconnection();
    await optionsPage.waitForTestConnectionResult();
    await optionsPage.clickOnSave();
}

async function openOptionsPage(browser){
    const page = await browser.newPage();    
    return await page.goto(`${CHROME_EXTENSION_URL}options.html`);
}

async function getPopupPage(browser){
    let self = this;

    async function getValueArrayFromInputs(page, selector) {
        return page.evaluate((selector) =>
        Array.from(document.querySelectorAll(selector))
            .map((i) => i.value), selector)
    }

    self.page = await browser.newPage();

    //ignore error dialog
    page.on('dialog', async dialog => {
        await dialog.accept();
    });

    await page.setRequestInterception(true);
    page.on('request', request => {
        if (request.url().includes('chrome-extension://'))
            request.continue();
        else
            request.respond(jiraMock.getResponse(request));
    });
    
    await page.goto(`${CHROME_EXTENSION_URL}popup.html`);

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
        },
        setWorklogDate: async (date) => {
            await page.type('#worklogDate', date || '01/01/2018');
            return await page.waitFor(100);
        },
        getJiraArray: async () => {
            return await getValueArrayFromInputs(page, 'input[name=jira]')
        },
        getTimeSpentArray: async () => {
            return await getValueArrayFromInputs(page, 'input[name=timeSpent]');
        },
        getCommentArray: async () => {
            return await getValueArrayFromInputs(page,'input[name=comment]');
            console.log(commentArray);
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
        clickOnSave: async () => {
            await self.page.click('#save');
            return await page.waitFor(100);
        },
        waitForTestConnectionResult: async () => {
            return dialogPromise;
        }
    }
}