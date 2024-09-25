var chrome = window.chrome || {}
var JiraHelper = window.JiraHelper || {}

// Saves options to chrome.storage
function saveOptions (jiraOptions, outlookOptions) {
  // make sure to not save user password, as chrome storage is not encrypted (https://developer.chrome.com/apps/storage#using-sync).
  // The JESSIONID authentication cookie will be remembered by the browser once User clicks 'Test Connection' anyway,
  // and Jira will consider the JESSIONID cookie and ignore the basic auth settings for the requests.
  jiraOptions.password = ''

  chrome.storage.sync.set(
    {
      jiraOptions: jiraOptions,
      outlookOptions: outlookOptions
    },
    function () {
      // Update status to let user know options were saved.
      var status = document.getElementById('status')
      status.textContent = 'Options saved.'
      setTimeout(function () {
        status.textContent = ''
      }, 1500)
    }
  )
}

// Restores options state using the preferences
// stored in chrome.storage.
function restoreOptions () {
  chrome.storage.sync.get(
    {
      jiraOptions: {},
      outlookOptions: {}
    },
    function (items) {
      restoreJiraOptionsToInput(items.jiraOptions)
      restoreOutlookOptionsToInput(items.outlookOptions)
    }
  )
}

var jiraUrlInput, userInput, passwordInput, tokenInput, outlookSyncEnabledInput, tenantIDInput, clientIDInput

function restoreJiraOptionsToInput (options) {
  jiraUrlInput.value = options.jiraUrl || ''
  userInput.value = options.user || ''
  passwordInput.value = options.password || ''
  tokenInput.value = options.token || ''
}

function restoreOutlookOptionsToInput (options) {
  outlookSyncEnabledInput.checked = options.outlookSyncEnabled || false
  tenantIDInput.value = options.tenantID || ''
  clientIDInput.value = options.clientID || ''
}

function getJiraOptionsFromInput () {
  return {
    jiraUrl: jiraUrlInput.value,
    user: userInput.value,
    password: passwordInput.value,
    token: tokenInput.value
  }
}

function getOutlookOptionsFromInput () {
  return {
    outlookSyncEnabled: outlookSyncEnabledInput.checked,
    tenantID: tenantIDInput.value,
    clientID: clientIDInput.value
  }
}

document.addEventListener('DOMContentLoaded', () => {
  restoreOptions()
  jiraUrlInput = document.getElementById('jiraUrl')
  userInput = document.getElementById('user')
  passwordInput = document.getElementById('password')
  tokenInput = document.getElementById('token')

  outlookSyncEnabledInput = document.getElementById('outlookSyncEnabled')
  tenantIDInput = document.getElementById('tenantID')
  clientIDInput = document.getElementById('clientID')

  document.getElementById('save').addEventListener('click', () => {
    saveOptions(getJiraOptionsFromInput(), getOutlookOptionsFromInput())
  })
  document.getElementById('testConnectionJira').addEventListener('click', () => {
    var jiraOptions = getJiraOptionsFromInput()
    console.log(jiraOptions)
    JiraHelper.testConnection(jiraOptions)
      .then(result => {
        console.info('connection successful')
        saveOptions(getJiraOptionsFromInput(), getOutlookOptionsFromInput())
        alert('Jira Connection [OK]')
      })
      .catch(error => {
        console.error('connection failed', error)
        alert('Jira Connection [FAILED]. Please double-check the options. Error: ' + error)
      })
  })
  document.getElementById('testConnectionOutlook').addEventListener('click', () => {
    var outlookOptions = getOutlookOptionsFromInput()
    console.log(outlookOptions)
    OutlookHelper.testConnection(outlookOptions)
      .then(result => {
        console.info('connection successful')
        saveOptions(getJiraOptionsFromInput(), getOutlookOptionsFromInput())
        alert('Outlook Connection [OK]')
      })
      .catch(error => {
        console.error('connection failed', error)
        alert('Outlook Connection [FAILED]. Please double-check the options. Error: ' + error)
      })
  })
})
