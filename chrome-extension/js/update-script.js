/* global chrome */
var updateScript = (function(){
    return {
        run: () => {
            //console.log('update script start');
            // Check whether new version is installed
            chrome.runtime.onInstalled.addListener(function(details){
                console.log('details', details);
                if(details.reason == "install"){
                    console.log("This is a first install!");
                }else if(details.reason == "update"){
                    var thisVersion = chrome.runtime.getManifest().version;
                    console.log("Updated from " + details.previousVersion + " to " + thisVersion + "!");
                }
            });
            return Promise.resolve();
        }
    }
})();

if (typeof module !== 'undefined')
module.exports = updateScript;