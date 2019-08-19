/* global chrome */
var updateScript = (function () {
  function saveOptions (jiraOptions) {
    return new Promise(resolve => {
      chrome.storage.sync.set(
        {
          jiraOptions: jiraOptions
        },
        function () {
          resolve()
        }
      )
    })
  }
  function getOptions () {
    return new Promise(resolve => {
      chrome.storage.sync.get(
        {
          jiraOptions: {}
        },
        function (options) {
          resolve(options.jiraOptions)
        }
      )
    })
  }
  function removePassword () {
    var getPromise = getOptions()
    var savePromise = getPromise.then((jiraOptions) => {
      jiraOptions.password = ''
      return saveOptions(jiraOptions)
    })
    return savePromise
  }
  return {
    run: () => {
      // Check whether new version is installed
      var thisVersion = chrome.runtime.getManifest().version
      console.log(`app version: ${thisVersion}`)
      return removePassword().then(() => {
        return Promise.resolve()
      })
    }
  }
})()

if (typeof module !== 'undefined') { module.exports = updateScript }
