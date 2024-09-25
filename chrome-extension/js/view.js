/* global Controller View mediator JiraHelper OutlookHelper */
window.View = window.View || {}

window.View.Main = (function () {
  var worklogDateInput,
    getWorklogButton,
    getOutlookEventsButton,
    worklogInput,
    addWorklogsButton,
    saveButton,
    totalHoursSpan

  function init () {
    setLoadingStatus(true)

    Controller.LogController.init().then(() => {
      View.Table.init()

      getWorklogButton = document.getElementById('getWorklogButton')
      getOutlookEventsButton = document.getElementById('getOutlookEventsButton')
      worklogInput = document.getElementById('worklog')
      addWorklogsButton = document.getElementById('addWorklogs')
      saveButton = document.getElementById('save')
      totalHoursSpan = document.getElementById('totalHours')

      worklogDateInput = document.getElementById('worklogDate')
      // initialize date with today's date
      worklogDateInput.value = formatDate(new Date())

      mediator.on('modal.totalHours.update', totalHours => {
        totalHoursSpan.innerText =
                    parseFloat(totalHours).toFixed(2) + 'h'
      })

      mediator.on('view.table.new-worklog.changed', () => {
        persistUnsavedData()
          .then(() => {
            console.log('persisted data locally.')
          })
      })

      mediator.on('view.table.worklog.changed', () => {
        persistUnsavedData()
          .then(() => {
            console.log('persisted data locally.')
          })
      })

      mediator.on('view.table.new-worklog.deleted', () => {
        persistUnsavedData()
          .then(() => {
            console.log('persisted data locally (deletion).')
          })
      })

      getWorklogButton.addEventListener('click', () => {
        setLoadingStatus(true)
        persistUnsavedData()
          .then(getWorklogItemsFromDate)
          .then(() => {

          }).catch(error => {
            console.warn(error)
          }).then(() => {
            setLoadingStatus(false)
          })
      })

      getOutlookEventsButton.addEventListener('click', () => {
        setLoadingStatus(true)
        OutlookHelper.getToken().then(accessToken => {
          return OutlookHelper.fetchCalendarEntries(accessToken)
        }).then(() => {
          setLoadingStatus(false)
        }).catch(error => {
          console.error(error)
          alert('Error fetching calendar entries: ' + error)
          setLoadingStatus(false)
        })
      })

      addWorklogsButton.addEventListener('click', () => {
        setLoadingStatus(true)
        Controller.LogController.bulkInsert(worklogInput.value).then(
          () => {
            worklogInput.value = ''
            mediator.trigger('view.table.new-worklog.changed', {})
            setLoadingStatus(false)
          }
        )
      })

      saveButton.addEventListener('click', () => {
        setLoadingStatus(true)
        var items = View.Table.getWorklogItems()
        Controller.LogController.save(items, worklogDateInput.value)
          .then(getWorklogItemsFromDate)
          .then(() => {
            alert('Worklog saved.')
          }).catch(error => {
            alert('Some items were not saved. Make sure the Jira numbers exist, and you are logged in Jira.')
            console.warn(error)
          }).then(() => {
            setLoadingStatus(false)
          })
      })

      worklogDateInput.addEventListener(
        'input',
        () => {
          console.log('date changed: ' + worklogDateInput.value)
          setLoadingStatus(true)
          getWorklogItemsFromDate().then(() => {

          }).catch(error => {
            console.warn(error)
          }).then(() => {
            setLoadingStatus(false)
          })
        },
        true
      )

      getWorklogItemsFromDate().then(() => {

      }).catch(error => {
        console.warn(error)
      }).then(() => {
        setLoadingStatus(false)
      })
    })
      .catch(() => {
        document.getElementsByClassName('container')[0].classList.add('hidden')
        document.getElementsByClassName('error_status')[0].classList.remove('hidden')
        alert('Something went wrong. Please go to \'Options\' and make sure you are logged in Jira, and the Jira URL is correct. If you have enabled Outlook sync, make sure you have provided valid credentials.')
        setLoadingStatus(false)
      })
  }

  function persistUnsavedData () {
    var items = View.Table.getWorklogItems()
    return Controller.LogController.persistUnsavedData(worklogDateInput.value, items)
  }

  function getWorklogItemsFromDate () {
    var promise = Controller.LogController.getWorklogsByDay(
      worklogDateInput.value
    )
    promise
      .then(() => { })
      .catch(error => {
        alert(`Something went wrong.\n\n${error}`)
      })
    return promise
  }

  function formatDate (date) {
    var d = date
    var month = '' + (d.getMonth() + 1)
    var day = '' + d.getDate()
    var year = d.getFullYear()

    if (month.length < 2) month = '0' + month
    if (day.length < 2) day = '0' + day

    return [year, month, day].join('-')
  }

  function setLoadingStatus (isLoading) {
    if (isLoading) {
      document.getElementById('loading').classList.remove('hidden')
    } else {
      document.getElementById('loading').classList.add('hidden')
    }
  }

  return {
    init: init,
    setLoadingStatus: setLoadingStatus
  }
})()

window.View.Table = (function () {
  var table, tbody
  var originalWorklogItems = []

  var worklogTableRowTemplate = `
    <tr class="worklog {{status-class}}" data-status="{{status}}" data-id="{{logId}}">
        <td class="table-line jira-number-column-item">
            <input aria-label="jira number" name="jira" type="text" value="{{jiraNumber}}" class="jira-number-input" />
        </td>
        <td class="table-line time-spent-column-item">
            <input aria-label="time spent" name="timeSpent" type="text" value="{{timeSpent}}" pattern="(\d+[m]|\d+[h](?:\s\d+[m])?)" class="time-spent-input" />
        </td>
        <td class="table-line comment-column-item">
            <input aria-label="worklog comment" name="comment" type="text" value="{{comment}}" class="comment-input" />
        </td>
        <td class="table-line action-column-item">
            <a aria-label="delete" href="#" class='delete-button'></a>
            <a aria-label="open link" target="_blank" href="{{jiraUrl}}" class='open-link-button {{link-disabled}}'></a>
        </td>
    </tr>`

  var statusClassList = {
    saved: 'worklog--saved',
    invalid: 'worklog--invalid',
    edited: 'worklog--edited',
    deleted: 'worklog--deleted'
  }

  function getStatusClass (status) {
    return statusClassList[status]
  }

  function addRow (worklogItem) {
    var row = worklogTableRowTemplate
      .replace('{{jiraNumber}}', worklogItem.jira)
      .replace('{{timeSpent}}', worklogItem.timeSpent)
      .replace('{{comment}}', worklogItem.comment)
      .replace('{{status}}', worklogItem.status)
      .replace('{{logId}}', worklogItem.logId)
      .replace('{{status-class}}', getStatusClass(worklogItem.status))
      .replace('{{jiraUrl}}', worklogItem.jiraUrl)
      .replace('{{link-disabled}}', worklogItem.jiraUrl ? '' : 'link-disabled')
    tbody.innerHTML += row
  }

  function clearRows () {
    var newTbody = document.createElement('tbody')
    tbody.parentNode.replaceChild(newTbody, tbody)
    tbody = newTbody
  }

  function populateWorklogTable (worklogItems) {
    clearRows()

    for (var i = 0; i < worklogItems.length; i++) {
      var worklogItem = worklogItems[i]
      updateJiraUrl(worklogItem)
      addRow(worklogItem)
    }
  }

  function getWorklogFromRow (row) {
    var status = row.getAttribute('data-status')
    var logId = row.getAttribute('data-id')
    var jira = row.querySelector('[name=jira]').value
    var timeSpent = row.querySelector('[name=timeSpent]').value
    var comment = row.querySelector('[name=comment]').value
    // var jira = row.get
    // ...
    return {
      status: status,
      jira: jira,
      timeSpent: timeSpent,
      comment: comment,
      logId: logId
    }
  }

  function validateInput (worklog, row) {
    var invalidFields = Controller.LogController.getInvalidFields(worklog)
    updateWorklogRowInputStatus(row, invalidFields)
  }

  function updateWorklogRowInputStatus (row, invalidFields) {
    var inputs = row.querySelectorAll('input[type=text]')
    inputs.forEach(input => {
      input.classList.remove('input--invalid')
    })
    if (invalidFields && invalidFields.length) {
      invalidFields.forEach(invalidFieldName => {
        row.querySelector(`[name=${invalidFieldName}]`).classList.add('input--invalid')
      })
    }
  }

  function getWorklogItems () {
    var items = []

    for (var i = 0, row; (row = tbody.rows[i]); i++) {
      items.push(getWorklogFromRow(row))
    }
    return items
  }

  function updateWorklogRowStatus (row, newStatus) {
    var newStatusClass = getStatusClass(newStatus)
    row.classList.remove('worklog--saved')
    row.classList.remove('worklog--edited')
    row.classList.remove('worklog--deleted')
    row.classList.add(newStatusClass)
    row.setAttribute('data-status', newStatus)
  }

  function isEqual (worklog1, worklog2) {
    return worklog1.jira === worklog2.jira &&
            worklog1.comment === worklog2.comment &&
            worklog1.timeSpent === worklog2.timeSpent
  }

  function updateJiraUrl (worklog) {
    worklog.jiraUrl = JiraHelper.getJiraUrl(worklog.jira)
  }

  function updateJiraUrlLink (url, row) {
    var link = row.querySelector('a.open-link-button')
    if (url) {
      link.href = url
      link.classList.remove('link-disabled')
    } else {
      link.classList.add('link-disabled')
    }
  }

  function worklogChanged (e) {
    var row = e.srcElement.parentElement.parentElement
    var worklog = getWorklogFromRow(row)
    console.log('worklog changed', worklog)
    validateInput(worklog, row)
    updateJiraUrl(worklog)
    updateJiraUrlLink(worklog.jiraUrl, row)
    if (worklog.status !== 'new') {
      changeStatusForUpdate(row, worklog)
      mediator.trigger('view.table.worklog.changed', worklog)
    } else {
      mediator.trigger('view.table.new-worklog.changed', worklog)
    }
  }

  function changeStatusForUpdate (row, worklog) {
    var originalWorklog = originalWorklogItems.filter(item => {
      return item.logId === worklog.logId
    })[0]
    if (isEqual(originalWorklog, worklog)) {
      updateWorklogRowStatus(row, 'saved')
    } else {
      updateWorklogRowStatus(row, 'edited')
    }
  }

  function deleteRow (row) {
    tbody.removeChild(row)
  }

  function worklogDeleted (e) {
    var row = e.srcElement.parentElement.parentElement
    var worklog = getWorklogFromRow(row)

    if (worklog.status === 'new') {
      // just delete the row
      deleteRow(row)
      mediator.trigger('view.table.new-worklog.deleted', worklog)
    } else {
      // mark existing item for deletion
      changeStatusForDeletion(row, worklog)
    }
  }

  function changeStatusForDeletion (row, worklog) {
    if (worklog.status === 'deleted') {
      updateWorklogRowStatus(row, 'saved')
      changeStatusForUpdate(row, worklog)
    } else {
      updateWorklogRowStatus(row, 'deleted')
    }
  }

  function configureInputListeners () {
    var inputs = tbody.querySelectorAll('input[type=text]')

    inputs.forEach(input => {
      input.removeEventListener('input', worklogChanged)
      input.addEventListener('input', worklogChanged)
    })

    var deleteButtons = tbody.querySelectorAll('a.delete-button')

    deleteButtons.forEach(deleteButton => {
      deleteButton.removeEventListener('click', worklogDeleted)
      deleteButton.addEventListener('click', worklogDeleted)
    })
  }

  function init () {
    table = document.getElementById('worklog-items')
    tbody = table.getElementsByTagName('tbody')[0]

    mediator.on('model.workloglist.updated', worklogItems => {
      originalWorklogItems = worklogItems
      populateWorklogTable(worklogItems)
      configureInputListeners()
    })
  }

  return {
    init: init,
    addRow: addRow,
    deleteRow: deleteRow,
    clearRows: clearRows,
    populateWorklogTable: populateWorklogTable,
    getWorklogItems: getWorklogItems
  }
})()
