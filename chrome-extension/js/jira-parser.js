var JiraParser = (function () {
    const hoursAndMinutesRegex = /\b(\d+[hm](?:\s\d+[m])?)\b/,
        jiraNumberRegex = /\b([A-Z]{3,4}-\d{3,4})\b/,
        worklogRegex = /\s*-*\s+(.+)/,
        worklogTextLineRegex = /\b([a-zA-Z]{2,5}-\d{2,5})?\b.*?\b(\d+[m]|\d+[h](?:\s\d+[m])?)\b[\s\-_;,]*(.+)$/;

    function timeSpentToHours(timeSpent) {
        var result = 0;
        if (timeSpent.indexOf('h') > -1) {
            var h = /\b(\d+)h\b/.exec(timeSpent)[1];
            result = parseFloat(h.replace('h', ''));
        }
        if (timeSpent.indexOf('m') > -1) {
            var m = /\b(\d+)m\b/.exec(timeSpent)[1];
            result += parseFloat(m.replace('m', '')) / 60;
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

        let hoursAndMinutes = jiraNumber = worklog = '';
                
        let matches = worklogTextLineRegex.exec(text);

        if (matches) {
            jiraNumber = matches[1] || '';
            hoursAndMinutes = matches[2] || '';
            worklog = matches[3] || '';
        }    
       
        let result = {
            'timeSpent': hoursAndMinutes,
            'jira': jiraNumber,
            'comment': worklog
        }
        return result
    }

    return {
        parse: parse,
        timeSpentToHours: timeSpentToHours,
        isValidTimeSpentFormat: isValidTimeSpentFormat
    };

})();

if (typeof module !== 'undefined')
    module.exports = JiraParser;