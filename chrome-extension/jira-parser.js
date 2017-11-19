var JiraParser = (function () {

    function parse(text) {
        const hoursAndMinutesRegex = /\b(\d+[hm](?:\s\d+[m])?)\b/,
            jiraNumberRegex = /\b([A-Z]{3,4}-\d{3,4})\b/,
            worklogRegex = /\s?-\s(.+)/;

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
        parse: parse
    };

})();

function sum(a, b) {
    return a + b
}

if (module)
    module.exports = JiraParser;