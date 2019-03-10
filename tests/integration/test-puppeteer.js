const puppeteer = require('puppeteer');

const CRX_PATH = `${process.cwd()}/chrome-extension/`;
const jiraMock = require('./jira-mock');
const CHROME_EXTENSION_URL = 'chrome-extension://ehkgicpgemphledafbkdenjjekkogbmk/'

console.log(jiraMock);

(async () => {
    
    const POPUP_PAGE = `${CHROME_EXTENSION_URL}popup.html`;
    const browser = await puppeteer.launch({
        headless: false, // extensions only supported in full chrome.
        args: [
            `--disable-extensions-except=${CRX_PATH}`,
            `--load-extension=${CRX_PATH}`,
            '--user-agent=PuppeteerAgent'
        ],
        //executablePath: 'C:/Users/Alfeu/Documents/dev/tools/chromedriver.exe'
    });
    // ... do some testing ...

    // const extensionPage = await browser.newPage();
    // await extensionPage.goto('chrome://extensions/')
    

    const page = await browser.newPage();
    page.on('dialog', async dialog => {
        console.log(dialog.message());
        await dialog.accept();
    });

    await page.setRequestInterception(true);
    page.on('request', request => {
        if (request.url().includes('chrome-extension://'))
            request.continue();
        else
            request.respond(jiraMock.getResponse(request));
    });

    await page.goto(POPUP_PAGE);
    // click buttons, test UI elements, etc.
    const errorMessage = await page.evaluate(() => document.querySelector('.error_status h2').textContent);
    console.log(errorMessage)
    await page.click('h2>a');
    await page.waitFor(1000);

    let pages = await browser.pages()
    optionsPage = pages.filter(p => p.url().includes('options.html'))[0];
    optionsPage.on('dialog', async dialog => {
        console.log(dialog.message());
        await dialog.accept();
    });

    await optionsPage.setRequestInterception(true);
    optionsPage.on('request', request => {
        console.log(request);
        request.respond(jiraMock.getResponse(request));
    });

    await optionsPage.type('#jiraUrl', 'https://jira.com');
    await optionsPage.click('#testConnection');
    await optionsPage.click('#save');
    //await optionsPage.reload();
    //await page.click('h2>a');
    await page.bringToFront();
    await page.waitFor(100);
    await page.reload();
    await page.type('#worklogDate', '01/01/2018');
    await page.waitFor(100);
    async function getValueArrayFromInputs(page, selector) {
        return page.evaluate((selector) =>
        Array.from(document.querySelectorAll(selector))
            .map((i) => i.value), selector)
    }
    const jiraNumberArray = await getValueArrayFromInputs(page, 'input[name=jira]');
    console.log(jiraNumberArray);
    const timeSpentArray = await getValueArrayFromInputs(page, 'input[name=timeSpent]');
    console.log(timeSpentArray);
    const commentArray = await getValueArrayFromInputs(page,'input[name=comment]');
    console.log(commentArray);


    //await browser.close();
})();