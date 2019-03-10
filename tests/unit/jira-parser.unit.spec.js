const jiraParser = require("../../chrome-extension/js/jira-parser");

describe("convert worklog text to jira log object", () => {

    test('worklog contains semicolon and dash', () => {
        let text = "CMS-1234; 30m-working on stuff",
        expected = {
            timeSpent: "30m",
            jira: "CMS-1234",
            comment: "working on stuff"
        }
        let result = jiraParser.parse(text);
        expect(result).toMatchObject(expected);
    })
    
    test('worklog contains space and comma', () => {
        let text = "CMS-123 1h 30m ,testing - working on stuff",
        expected = {
            timeSpent: "1h 30m",
            jira: "CMS-123",
            comment: "testing - working on stuff"
        }
        let result = jiraParser.parse(text);
        expect(result).toMatchObject(expected);
    })
    
    test('worklog contains only time spent and comment', () => {
        let text = "1h - [grooming] align with SM about grooming pending tasks and blocks / align with Devs the grooming tasks and story overview",
        expected = {
            timeSpent: "1h",
            jira: "",
            comment: "[grooming] align with SM about grooming pending tasks and blocks / align with Devs the grooming tasks and story overview"
        }
        let result = jiraParser.parse(text);
        expect(result).toMatchObject(expected);
    })
    
    test('worklog contains long comment', () => {
        let text = "PLANNING-2 1h 30m [grooming] align with SM about grooming pending tasks and blocks / align with Devs the grooming tasks and story overview",
        expected = {
            timeSpent: "1h 30m",
            jira: "PLANNING-2",
            comment: "[grooming] align with SM about grooming pending tasks and blocks / align with Devs the grooming tasks and story overview"
        }
        let result = jiraParser.parse(text);
        expect(result).toMatchObject(expected);
    })
    
    test('worklog contains only comment', () => {
        let text = "working on dev stuff",
        expected = {
            timeSpent: "",
            jira: "",
            comment: "working on dev stuff"
        }
        let result = jiraParser.parse(text);
        expect(result).toMatchObject(expected);
    })
})

describe('timeSpent in text format should return numeric hour', () => {
    describe('valid times', () => {
        test('2h', () => {
            let text = '2h'
            let expected = 2.0
            let result = jiraParser.timeSpentToHours(text);
            //assert
            expect(result.toFixed(2)).toEqual(expected.toFixed(2));
        })
    
        test('2h', () => {
            let text = '2h',
                expected = 2.0
            let result = jiraParser.timeSpentToHours(text);
            expect(result.toFixed(2)).toEqual(expected.toFixed(2));
        })
        
        test('1h 30m', () => {
            let text = '1h 30m',
                expected = 1.5
            let result = jiraParser.timeSpentToHours(text);
            expect(result.toFixed(2)).toEqual(expected.toFixed(2));
        })
        
        test('15m', () => {
            let text = '15m',
                expected = 0.25
            let result = jiraParser.timeSpentToHours(text);
            expect(result.toFixed(2)).toEqual(expected.toFixed(2));
        })
        
        test('1h 45m', () => {
            let text = '1h 45m',
                expected = 1.75
            let result = jiraParser.timeSpentToHours(text);
            expect(result.toFixed(2)).toEqual(expected.toFixed(2));
        })
        
        test('50m', () => {
            let text = '50m',
                expected = 0.83
            let result = jiraParser.timeSpentToHours(text);
            expect(result.toFixed(2)).toEqual(expected.toFixed(2));
        })
    })
    
    describe('invalid times', () => {
        test('50e', () => {
            let text = '50e',
                expected = 0
            let result = jiraParser.timeSpentToHours(text);
            expect(result.toFixed(2)).toEqual(expected.toFixed(2));
        })
        
        test('50mk', () => {
            let text = '50mk',
                expected = 0
            let result = jiraParser.timeSpentToHours(text);
            expect(result.toFixed(2)).toEqual(expected.toFixed(2));
        })
        
        test('huebr', () => {
            let text = 'huebr',
                expected = 0
            let result = jiraParser.timeSpentToHours(text);
            expect(result.toFixed(2)).toEqual(expected.toFixed(2));
        })
    })
    
    
})


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
        },
        {
            '1h4m': false
        },
        {
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

describe('validate fields', () => {
    describe('fields are incorrect', () => {
        test('timeSpent is invalid', () => {
            let item = {
                timeSpent: "30",
                jira: "CMS-1234",
                comment: "working on stuff"
            },
            invalidFields = ['timeSpent'];
    
            let result = jiraParser.getInvalidFields(item);
            expect(result).toMatchObject(invalidFields);
        })
        
        test('jira and timeSpent are invalid', () => {
            let item = {
                timeSpent: "30",
                jira: "CMS",
                comment: "working on stuff"
            },
            invalidFields = ['jira', 'timeSpent']
            
            let result = jiraParser.getInvalidFields(item);
            expect(result).toMatchObject(invalidFields);
        })
        
        test('comment is invalid', () => {
            let item = {
                timeSpent: "1h 30m",
                jira: "CMS-123",
                comment: ""
            },
            invalidFields = ['comment']
            
            let result = jiraParser.getInvalidFields(item);
            expect(result).toMatchObject(invalidFields);
        })
        
        test('all fields are invalid', () => {
            let item = {
                jira: "CMS-123a",
                timeSpent: "1h am",
                comment: "  "
            },
            invalidFields = ['jira', 'timeSpent', 'comment']
            
            let result = jiraParser.getInvalidFields(item);
            expect(result).toMatchObject(invalidFields);
        })
    
        test('jira is invalid', () => {
            let item = {
                jira: "-2",
                timeSpent: "1h",
                comment: "test"
            },
            invalidFields = ['jira']
            
            let result = jiraParser.getInvalidFields(item);
            expect(result).toMatchObject(invalidFields);
        })
    })

    describe('fields are correct', () => {
        test('long jira number', () => {
            let item = {
                jira: "MANAGEMENT-4",
                timeSpent: "1h",
                comment: "test"
            },
            invalidFields = []
            
            let result = jiraParser.getInvalidFields(item);
            expect(result).toMatchObject(invalidFields);
        })
        
        test('short comment', () => {
            let item = {
                jira: "KIMOFR-24",
                timeSpent: "1h",
                comment: "test"
            },
            invalidFields = []
            
            let result = jiraParser.getInvalidFields(item);
            expect(result).toMatchObject(invalidFields);
        })
        
        test('jira number', () => {
            let item = {
                jira: "PLANNING-2",
                timeSpent: "1h",
                comment: "test"
            },
            invalidFields = []
            
            let result = jiraParser.getInvalidFields(item);
            expect(result).toMatchObject(invalidFields);
        })
        
        test('short jira number', () => {
            let item = {
                jira: "P-2",
                timeSpent: "1h",
                comment: "test"
            },
            invalidFields = []
            
            let result = jiraParser.getInvalidFields(item);
            expect(result).toMatchObject(invalidFields);
        })

        test('very long jira number', () => {
            let item = {
                jira: "TESTINGLONGERJIRAKEY-123",
                timeSpent: "1h 45m",
                comment: "test"
            },
            invalidFields = []
            
            let result = jiraParser.getInvalidFields(item);
            expect(result).toMatchObject(invalidFields);
        })
    })
})