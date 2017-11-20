const jiraParser = require("../../chrome-extension/jira-parser");

test("string should return a meaningful log object", done => {
    const testDataList = [
        {
            logText: "CMS-1234; 30m-working on stuff",
            expectedObject: {
                timeSpent: "30m",
                jira: "CMS-1234",
                comment: "working on stuff"
            }
        },
        {
            logText: "CMS-123 1h 30m ,testing - working on stuff",
            expectedObject: {
                timeSpent: "1h 30m",
                jira: "CMS-123",
                comment: "testing - working on stuff"
            }
        },
        {
            logText:
            "1h - [grooming] align with SM about grooming pending tasks and blocks / align with Devs the grooming tasks and story overview",
            expectedObject: {
                timeSpent: "1h",
                jira: "",
                comment:
                "[grooming] align with SM about grooming pending tasks and blocks / align with Devs the grooming tasks and story overview"
            }
        },
        {
            logText:
            "ms-12345 1h 30m [grooming] align with SM about grooming pending tasks and blocks / align with Devs the grooming tasks and story overview",
            expectedObject: {
                timeSpent: "1h 30m",
                jira: "ms-12345",
                comment:
                "[grooming] align with SM about grooming pending tasks and blocks / align with Devs the grooming tasks and story overview"
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

test("timeSpent in text format should return numeric hour", done => {
    //arrange
    const testDataList = [{
        '2h': 2.0
    },
    {
        '1h 30m': 1.5
    }, 
    {
        '15m': 0.25
    }, {
        '1h 45m': 1.75
    }, {
        '50m': 0.83
    },
    ];
    //act
    testDataList.forEach(testData => {
        let text = Object.keys(testData)[0];
        let expected = testData[text];
        let result = jiraParser.timeSpentToHours(text);
        //assert
        expect(result.toFixed(2)).toEqual(expected.toFixed(2));
        done();
    });
});

test("isValidTimeSpentFormat should validate timeSpent in text format", done => {
    //arrange
    const testDataList = [{
        '2h': true
    },
    {
        '1h 30m': true
    }, 
    {
        '15min': false
    }, {
        '1h4m': false
    }, {
        '50m': true
    },
    ];
    //act
    testDataList.forEach(testData => {
        let text = Object.keys(testData)[0];
        let expected = testData[text];
        let result = jiraParser.isValidTimeSpentFormat(text);
        //assert
        expect(result).toEqual(expected);
        done();
    });
});