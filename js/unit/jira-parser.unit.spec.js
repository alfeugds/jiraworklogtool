const jiraParser = require("../../chrome-extension/js/jira-parser");

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
            "PLANNING-2 1h 30m [grooming] align with SM about grooming pending tasks and blocks / align with Devs the grooming tasks and story overview",
            expectedObject: {
                timeSpent: "1h 30m",
                jira: "PLANNING-2",
                comment:
                "[grooming] align with SM about grooming pending tasks and blocks / align with Devs the grooming tasks and story overview"
            }
        },
        {
            logText:
            "working on dev stuff",
            expectedObject: {
                timeSpent: "",
                jira: "",
                comment:
                "working on dev stuff"
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
    }, {
        '50e': 0
    },{
        '50mk': 0
    },{
        'huebr': 0
    }
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
    {
        '1h 50ma': false
    }
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

test("object fields must be validated", done => {
    const testDataList = [
        {
            item: {
                timeSpent: "30",
                jira: "CMS-1234",
                comment: "working on stuff"
            },
            invalidFields: ['timeSpent']
        },
        {
            item: {
                timeSpent: "30",
                jira: "CMS",
                comment: "working on stuff"
            },
            invalidFields: ['jira', 'timeSpent']
        },
        {
            item: {
                timeSpent: "1h 30m",
                jira: "CMS-123",
                comment: ""
            },
            invalidFields: ['comment']
        },
        {
            item: {
                jira: "CMS-123a",
                timeSpent: "1h am",
                comment: "  "
            },
            invalidFields: ['jira', 'timeSpent', 'comment']
        },
        {
            item: {
                jira: "MANAGEMENT-4",
                timeSpent: "1h",
                comment: "test"
            },
            invalidFields: []
        },
        {
            item: {
                jira: "KIMOFR-24",
                timeSpent: "1h",
                comment: "test"
            },
            invalidFields: []
        },
        {
            item: {
                jira: "PLANNING-2",
                timeSpent: "1h",
                comment: "test"
            },
            invalidFields: []
        },
        {
            item: {
                jira: "P-2",
                timeSpent: "1h",
                comment: "test"
            },
            invalidFields: []
        },
        {
            item: {
                jira: "-2",
                timeSpent: "1h",
                comment: "test"
            },
            invalidFields: ['jira']
        },
        {
            item: {
                jira: "TESTINGLONGERJIRAKEY-123",
                timeSpent: "1h",
                comment: "test"
            },
            invalidFields: []
        }

    ];

    testDataList.forEach(testData => {
        let expected = testData.invalidFields;
        let result = jiraParser.getInvalidFields(testData.item);
        expect(result).toMatchObject(expected);
        done();
    });
});