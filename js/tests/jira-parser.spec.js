const jiraParser = require("../jira-parser");

test("adds 1 + 2 to equal 3", () => {
    expect(jiraParser.sum(1, 2)).toBe(3);
    expect(jiraParser.sum(1, 3)).toBe(4);
});

test("string should return a meaningful log object", done => {
    const testDataList = [
        {
            logText: "30m CMS-1234 - working on stuff",
            expectedObject: {
                time: "30m",
                jiraNumber: "CMS-1234",
                worklog: "working on stuff"
            }
        },
        {
            logText: "1h 30m CMS-123 - testing - working on stuff",
            expectedObject: {
                time: "1h 30m",
                jiraNumber: "CMS-123",
                worklog: "testing - working on stuff"
            }
        },
        {
            logText:
                "1h - [grooming] align with shira about grooming pending tasks and blocks / align with Dorte the grooming tasks and story overview",
            expectedObject: {
                time: "1h",
                jiraNumber: "",
                worklog:
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
