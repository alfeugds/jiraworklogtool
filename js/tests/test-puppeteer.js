const puppeteer = require('puppeteer');

const CRX_PATH = '../../../../../chrome-extension/';

(async () => {
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

    const page = await browser.newPage();
    page.on('dialog', async dialog => {
        console.log(dialog.message());
        await dialog.accept();
    });
    await page.goto('chrome-extension://ehkgicpgemphledafbkdenjjekkogbmk/popup.html');
    // click buttons, test UI elements, etc.
    await page.click('h2>a');
    await page.waitFor(1000);

    let pages = await browser.pages()
    optionsPage = pages[2];

    await optionsPage.setRequestInterception(true);
    optionsPage.on('request', request => {
        console.log(request);
        request.respond({
            status: 200,
            contentType: 'application/json;charset=UTF-8',
            headers: {
                'x-ausername': 'hue@br.com'
            },
            body: JSON.stringify({
                issues: [{
                    'key': 'cms-123'
                }]
            })
        });
    });

    await optionsPage.type('#jiraUrl', 'https://jira.com');
    await optionsPage.click('#testConnection');

    await browser.close();
})();
