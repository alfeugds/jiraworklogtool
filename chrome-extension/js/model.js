/* global mediator chrome */
window.Model = {}
window.Model.WorklogModel = (function (JiraParser) {
  var items = []
  var totalHours = 0.0

  function addAll (newItems) {
    newItems.forEach(function (item) {
      item.status = 'new'
    }, this)

    items = items.concat(newItems)
    mediator.trigger('model.workloglist.updated', items)
    updateTotalHours()
  }

  function getItems () {
    return items
  }

  function updateItemsFromJira (newItems) {
    items = items.filter(item => {
      return item.status !== 'saved' && item.status !== 'edited' && item.status !== 'deleted'
    })

    items = items.concat(newItems)
    mediator.trigger('model.workloglist.updated', items)
    updateTotalHours()
  }

  function updateItemsWithLocalData (persistedItems) {
    items = items.filter(item => {
      return item.status !== 'new'
    })

    items = items.concat(persistedItems)
    updateTotalHours()
  }

  function updateTotalHours () {
    var total = 0.0
    for (var i = 0; i < items.length; i++) {
      var worklog = items[i]
      total += JiraParser.timeSpentToHours(worklog.timeSpent)
    }
    totalHours = total
    mediator.trigger('modal.totalHours.update', totalHours)
  }

  function clearItems () {
    items = []
  }

  function getTotalHours () {
    updateTotalHours()
    return totalHours
  }

  function persistUnsavedWorklogToLocal (date, worklogs) {
    return new Promise((resolve) => {
      getUnsavedWorklogFromLocal().then(persistedWorklogs => {
        // save only new items
        worklogs = worklogs.filter(item => {
          return item.status === 'new'
        })

        worklogs.forEach(function (item) {
          item.started = date
        }, this)

        persistedWorklogs = persistedWorklogs.filter(function (item) {
          return item.started !== date
        }, this)

        persistedWorklogs = persistedWorklogs.concat(worklogs)
        // ...
        chrome.storage.local.set({
          worklogs: persistedWorklogs
        }, () => {
          resolve()
        })
      })
    })
  }

  function getUnsavedWorklogFromLocal (date) {
    return new Promise((resolve) => {
      chrome.storage.local.get({
        worklogs: []
      }, result => {
        var worklogs = result.worklogs
        if (date) {
          worklogs = worklogs.filter(item => {
            return item.started === date
          })
        }
        console.log('getUnsavedWorklogFromLocal() result:', worklogs)
        resolve(worklogs)
      })
    })
  }

  return {
    addAll: addAll,
    getItems: getItems,
    getTotalHours: getTotalHours,
    updateItemsFromJira: updateItemsFromJira,
    getUnsavedWorklogFromLocal: getUnsavedWorklogFromLocal,
    persistUnsavedWorklogToLocal: persistUnsavedWorklogToLocal,
    updateItemsWithLocalData: updateItemsWithLocalData,
    clearItems: clearItems
  }
})(window.JiraParser)
