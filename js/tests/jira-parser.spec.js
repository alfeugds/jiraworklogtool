const jiraParser = require("../../chrome-extension/jira-parser");

test("string should return a meaningful log object", done => {
    const testDataList = [
        {
            logText: "30m CMS-1234 - working on stuff",
            expectedObject: {
                timeSpent: "30m",
                jira: "CMS-1234",
                comment: "working on stuff"
            }
        },
        {
            logText: "1h 30m CMS-123 - testing - working on stuff",
            expectedObject: {
                timeSpent: "1h 30m",
                jira: "CMS-123",
                comment: "testing - working on stuff"
            }
        },
        {
            logText:
                "1h - [grooming] align with shira about grooming pending tasks and blocks / align with Dorte the grooming tasks and story overview",
            expectedObject: {
                timeSpent: "1h",
                jira: "",
                comment:
                    "[grooming] align with shira about grooming pending tasks and blocks / align with Dorte the grooming tasks and story overview"
            }
        }
    ];

    testDataList.forEach(testData => {
        let text = testData.logText;
        let expected = testData.expectedObject;
        let result = jiraParser.parse(text);
        expect(result).toMatchObject(expected);
        done();
    });
});
