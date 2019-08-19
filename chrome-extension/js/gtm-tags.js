(function (dataLayer) {
  var xhrOpen = window.XMLHttpRequest.prototype.open
  var xhrSend = window.XMLHttpRequest.prototype.send
  window.XMLHttpRequest.prototype.open = function () {
    this.method = arguments[0]
    this.url = arguments[1]
    return xhrOpen.apply(this, [].slice.call(arguments))
  }
  window.XMLHttpRequest.prototype.send = function () {
    var xhr = this
    var intervalId = window.setInterval(function () {
      if (xhr.readyState !== 4) {
        return
      }
      try {
        var u = new URL(xhr.responseURL)
        var pathname = u.pathname
        var origin = u.origin
        var data = {
          event: 'ajaxSuccess',
          eventCategory: 'AJAX',
          eventAction: origin,
          eventLabel: xhr.method + ' - ' + pathname
        }
        dataLayer.push(data)
      } catch (e) {
        console.debug('GTM error', e)
      } finally {
        clearInterval(intervalId)
      }
    }, 10)
    return xhrSend.apply(this, [].slice.call(arguments))
  }
})(window.dataLayer)
