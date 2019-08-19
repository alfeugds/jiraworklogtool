/* global updateScript */
var Mediator = window.Mediator || {}
var View = window.View || {}

document.addEventListener('DOMContentLoaded', () => {
  // TODO: refactor debug log
  var DEBUG = true
  if (!DEBUG) {
    if (!window.console) window.console = {}
    var methods = ['log', 'debug', 'warn', 'info']
    for (var i = 0; i < methods.length; i++) {
      console[methods[i]] = function () {}
    }
  }

  window.mediator = new Mediator()

  // palliative solution for storage sync issue
  updateScript.run().then(() => {
    View.Main.init()
  })
})
