/* global chrome */
var updateScript = (function () {
  function saveOptions (jiraOptions, outlookOptions) {
    return new Promise(resolve => {
      chrome.storage.sync.set(
        {
          jiraOptions: jiraOptions,
          outlookOptions: outlookOptions
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
          jiraOptions: {},
          outlookOptions: {}
        },
        function (options) {
          resolve(options.jiraOptions, options.outlookOptions)
        }
      )
    })
  }
  function removePassword () {
    var getPromise = getOptions()
    var savePromise = getPromise.then((jiraOptions, outlookOptions) => {
      jiraOptions.password = ''
      return saveOptions(jiraOptions, outlookOptions)
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
