require('dotenv').config();

const fs = require('fs');
const path = require('path');
const chromeDeploy = require('chrome-extension-deploy');

console.log('Deploying to Chrome Web Store...');
console.log(`CHROME_CLIENT_ID: ${process.env.CHROME_CLIENT_ID}`);

const zipPath = path.join(__dirname, '../chrome-extension.zip');

chromeDeploy({
    clientId: process.env.CHROME_CLIENT_ID,
    clientSecret: process.env.CHROME_CLIENT_SECRET,
    refreshToken: process.env.CHROME_REFRESH_TOKEN,
    id: 'pekbjnkonfmgjfnbpmindidammhgmjji',
    zip: fs.readFileSync(zipPath)
}).then(
    () => {
        console.log('Chrome deployment complete!');
    },
    err => {
        console.error('Chrome deployment failed: ', err);
        process.exitCode = 1;
    }
);