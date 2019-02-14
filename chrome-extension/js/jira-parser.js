var JiraParser = (function () {
    const hoursAndMinutesRegex = /^(\d+[m]|\d+[h](?:\s\d+[m])?)$/,
        jiraNumberRegex = /^([a-zA-Z]{1,30}-\d+)$/,
        worklogTextLineRegex = /\b([a-zA-Z]{1,30}-\d+)?\b.*?\b(\d+[m]|\d+[h](?:\s\d+[m])?)\b[\s\-_;,]*(.+)$/;

    function timeSpentToHours(timeSpent) {
        var result = 0;
        if (timeSpent.indexOf('h') > -1) {
            var match = /\b(\d+)h\b/.exec(timeSpent);
            if (match) {
                var h = match[1];
                result = parseFloat(h.replace('h', ''));                
            }
        }
        if (timeSpent.indexOf('m') > -1) {
            var match = /\b(\d+)m\b/.exec(timeSpent);
            if (match) {
                var m = match[1];
                result += parseFloat(m.replace('m', '')) / 60;                
            }
        }
        return result;
    }

    function isValidTimeSpentFormat(timeSpent) {
        if (hoursAndMinutesRegex.exec(timeSpent))
            return true;
        else
            return false;
    }

    function parse(text) {

        let hoursAndMinutes = '',
            jiraNumber = '';
        let worklog = text;
                
        let matches = worklogTextLineRegex.exec(text);

        if (matches) {
            jiraNumber = matches[1] || '';
            hoursAndMinutes = matches[2] || '';
            worklog = matches[3] || worklog;
        }

        let result = {
            'timeSpent': hoursAndMinutes,
            'jira': jiraNumber,
            'comment': worklog
        }
        return result
    }

    function getInvalidFields(item){
        var result = [];
        if (!jiraNumberRegex.exec(item.jira)) {
            result.push('jira');            
        }
        if (!isValidTimeSpentFormat(item.timeSpent)) {
            result.push('timeSpent');            
        }
        if (!item.comment.trim()) {
            result.push('comment');            
        }
        return result;
    }

    return {
        parse: parse,
        timeSpentToHours: timeSpentToHours,
        isValidTimeSpentFormat: isValidTimeSpentFormat,
        getInvalidFields: getInvalidFields
    };

})();

if (typeof module !== 'undefined')
    module.exports = JiraParser;
