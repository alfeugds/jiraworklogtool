/* global chrome */
var popupWindow = window.open(
  chrome.runtime.getURL('popup.html'),
  'Jira Worklog Tool',
  'width=610,height=500'
)
popupWindow.focus()
window.close()
