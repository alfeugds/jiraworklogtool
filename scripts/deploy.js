require('dotenv').config();

const fs = require('fs');
const path = require('path');

/* In order for the deploy script to work, a .env file must be created. 
1- acces OAuth client console and get cliend id and secret
2- access https://accounts.google.com/o/oauth2/auth?response_type=code&scope=https://www.googleapis.com/auth/chromewebstore&client_id=113688225649-ttrnqlh7f18d9cngcsu4e4erp0226jpp.apps.googleusercontent.com&redirect_uri=urn:ietf:wg:oauth:2.0:oob
3- get token
4- run command below in a browser console(ref: https://github.com/DrewML/chrome-webstore-upload/blob/master/How%20to%20generate%20Google%20API%20keys.md):
 copy(`curl "https://accounts.google.com/o/oauth2/token" -d "client_id=${encodeURIComponent(prompt('Enter your clientId'))}&client_secret=${encodeURIComponent(prompt('Enter your clientSecret'))}&code=${encodeURIComponent(prompt('Enter your authcode'))}&grant_type=authorization_code&redirect_uri=urn:ietf:wg:oauth:2.0:oob"`);alert('The curl has been copied. Paste it into your terminal.')
5- run copied curl
6- update .env file
*/

const webStore = require('chrome-webstore-upload')({
    extensionId: 'pekbjnkonfmgjfnbpmindidammhgmjji',
    clientId: process.env.CHROME_CLIENT_ID,
    clientSecret: process.env.CHROME_CLIENT_SECRET,
    refreshToken: process.env.CHROME_REFRESH_TOKEN 
});

console.log('Deploying to Chrome Web Store...');
console.log(`CHROME_CLIENT_ID: ${process.env.CHROME_CLIENT_ID}`);
console.log(`CHROME_CLIENT_SECRET: ${process.env.CHROME_CLIENT_SECRET}`);
console.log(`CHROME_REFRESH_TOKEN: ${process.env.CHROME_REFRESH_TOKEN}`);

function getToken(){
    const token = process.env.CHROME_ACCESS_TOKEN;
    if(token)
        return Promise.resolve(token);
    else {
        console.log('fetching token...');
        return webStore.fetchToken();
    }
}
(async () => {
    try{
        const token = await getToken();
        //upload
        const zipPath = path.join(__dirname, '../chrome-extension.zip');
        const myZipFile = fs.createReadStream(zipPath);
        try{
            console.log('uploading...');
            let res = await webStore.uploadExisting(myZipFile, token);

            console.log('publishing...');
            const target = 'default';
            res = await webStore.publish(target, token);
            console.log('Chrome publish complete!', res);
            
        } catch (err) {
            console.error('Chrome upload failed: ', err);
            process.exitCode = 1;
        }
    }catch(err) {
        console.error('fetching token failed: ', err);
        process.exitCode = 1;
    };
})();