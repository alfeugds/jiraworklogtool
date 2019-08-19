var JiraParser = (function () {
  const hoursAndMinutesRegex = /^(\d+[m]|\d+[h](?:\s\d+[m])?)$/
  const jiraNumberRegex = /^([a-zA-Z0-9]{1,30}-\d+)$/
  const worklogTextLineRegex = /\b([a-zA-Z0-9]{1,30}-\d+)?\b.*?\b(\d+[m]|\d+[h](?:\s\d+[m])?)\b[\s\-_;,]*(.+)$/

  function timeSpentToHours (timeSpent) {
    let result = 0
    let match
    if (timeSpent.indexOf('h') > -1) {
      match = /\b(\d+)h\b/.exec(timeSpent)
      if (match) {
        var h = match[1]
        result = parseFloat(h.replace('h', ''))
      }
    }
    if (timeSpent.indexOf('m') > -1) {
      match = /\b(\d+)m\b/.exec(timeSpent)
      if (match) {
        var m = match[1]
        result += parseFloat(m.replace('m', '')) / 60
      }
    }
    return result
  }

  function isValidTimeSpentFormat (timeSpent) {
    if (hoursAndMinutesRegex.exec(timeSpent)) { return true } else { return false }
  }

  function parse (text) {
    let hoursAndMinutes = ''
    let jiraNumber = ''
    let worklog = text

    const matches = worklogTextLineRegex.exec(text)

    if (matches) {
      jiraNumber = matches[1] || ''
      hoursAndMinutes = matches[2] || ''
      worklog = matches[3] || worklog
    }

    const result = {
      timeSpent: hoursAndMinutes,
      jira: jiraNumber,
      comment: worklog
    }
    return result
  }

  function getInvalidFields (item) {
    var result = []
    if (!jiraNumberRegex.exec(item.jira)) {
      result.push('jira')
    }
    if (!isValidTimeSpentFormat(item.timeSpent)) {
      result.push('timeSpent')
    }
    if (!item.comment.trim()) {
      result.push('comment')
    }
    return result
  }

  return {
    parse: parse,
    timeSpentToHours: timeSpentToHours,
    isValidTimeSpentFormat: isValidTimeSpentFormat,
    getInvalidFields: getInvalidFields
  }
})()

if (typeof module !== 'undefined') { module.exports = JiraParser }
