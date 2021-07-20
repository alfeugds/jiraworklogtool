/* global chrome */
const { id } = chrome.runtime
console.log('content script!', { id })

const idElem = document.createElement('input')
idElem.setAttribute('id', 'jiraworklog_id')
idElem.setAttribute('value', id)
idElem.setAttribute('type', 'hidden')

document.body.appendChild(idElem)
