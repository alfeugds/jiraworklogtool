/* global chrome */
var updateScript = (function(){
    function saveOptions(options) {
        chrome.storage.sync.set(
            {
                jiraOptions: options
            },
            function () {
                Promise.resolve();
            }
        );
    }
    function getOptions() {
        chrome.storage.sync.get(
            {
                jiraOptions: {}
            },
            function (items) {
                Promise.resolve(items.jiraOptions);
            }
        );
    }
    function removePassword() {

    }
    return {
        run: () => {
            // Check whether new version is installed
            chrome.runtime.onInstalled.addListener(function(details){
                console.log('details', details);
                if(details.reason == "install"){
                    console.log("This is a first install!");
                }else if(details.reason == "update"){
                    var thisVersion = chrome.runtime.getManifest().version;
                    console.log("Updated from " + details.previousVersion + " to " + thisVersion + "!");
                    removePassword();
                }
            });
            return Promise.resolve();
        }
    }
})();

if (typeof module !== 'undefined')
    module.exports = updateScript;