var JiraParser = (function () {
    const hoursAndMinutesRegex = /\b(\d+[hm](?:\s\d+[m])?)\b/,
        jiraNumberRegex = /\b([A-Z]{3,4}-\d{3,4})\b/,
        worklogRegex = /\s?-\s(.+)/;

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
        try {
            hoursAndMinutes = hoursAndMinutesRegex.exec(text)[1]
        } catch (e) {
        }

        try {
            jiraNumber = jiraNumberRegex.exec(text)[1]
        } catch (e) {

        }
        try {
            worklog = worklogRegex.exec(text)[1]
        } catch (e) {

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