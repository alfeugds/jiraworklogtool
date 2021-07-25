/* eslint-disable import/no-webpack-loader-syntax */
import Mediator from 'mediator-js'
import './styles.scss'
import './js/jira-helper'
import './js/jira-parser'
import './js/model'
import './js/view'
import './js/controller'
import updateScript from './js/update-script'
// require('file-loader?name=[name].[ext]!./popup.html')
// require('./manifest.json')

// var Mediator = window.Mediator || {}
console.log({ Mediator })
var View = window.View || {}

const isInNewWindow = () => {
  return window.location.href.includes('new-window')
}

const openInNewWindow = () => {
  const popupUrl = window.location.href + '?new-window'

  var popupWindow = window.open(
    popupUrl,
    'Jira Worklog Tool',
    'width=610,height=500'
  )
  setTimeout(() => {
    popupWindow.focus()
    window.close()
  })
}

const disableLogs = () => {
  // TODO: refactor debug log, get from env variable
  var DEBUG = true
  if (!DEBUG) {
    if (!window.console) window.console = {}
    var methods = ['log', 'debug', 'warn', 'info']
    for (var i = 0; i < methods.length; i++) {
      console[methods[i]] = function () {}
    }
  }
}

if (!isInNewWindow()) {
  openInNewWindow()
}

document.addEventListener('DOMContentLoaded', async () => {
  disableLogs()
  window.mediator = new Mediator()
  await updateScript.run()
  View.Main.init()
})
