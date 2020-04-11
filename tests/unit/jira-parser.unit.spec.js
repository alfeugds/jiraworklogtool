const jiraParser = require('../../chrome-extension/js/jira-parser')

describe('convert worklog text to jira log object', () => {
  test('worklog contains semicolon and dash', () => {
    const text = 'CMS-1234; 30m-working on stuff'
    const expected = {
      timeSpent: '30m',
      jira: 'CMS-1234',
      comment: 'working on stuff'
    }
    const result = jiraParser.parse(text)
    expect(result).toMatchObject(expected)
  })

  test('worklog contains space and comma', () => {
    const text = 'CMS-123 1h 30m ,testing - working on stuff'
    const expected = {
      timeSpent: '1h 30m',
      jira: 'CMS-123',
      comment: 'testing - working on stuff'
    }
    const result = jiraParser.parse(text)
    expect(result).toMatchObject(expected)
  })

  test('worklog contains only time spent and comment', () => {
    const text = '1h - [grooming] align with SM about grooming pending tasks and blocks / align with Devs the grooming tasks and story overview'
    const expected = {
      timeSpent: '1h',
      jira: '',
      comment: '[grooming] align with SM about grooming pending tasks and blocks / align with Devs the grooming tasks and story overview'
    }
    const result = jiraParser.parse(text)
    expect(result).toMatchObject(expected)
  })

  test('worklog contains long comment', () => {
    const text = 'PLANNING-2 1h 30m [grooming] align with SM about grooming pending tasks and blocks / align with Devs the grooming tasks and story overview'
    const expected = {
      timeSpent: '1h 30m',
      jira: 'PLANNING-2',
      comment: '[grooming] align with SM about grooming pending tasks and blocks / align with Devs the grooming tasks and story overview'
    }
    const result = jiraParser.parse(text)
    expect(result).toMatchObject(expected)
  })

  test('worklog contains only comment', () => {
    const text = 'working on dev stuff'
    const expected = {
      timeSpent: '',
      jira: '',
      comment: 'working on dev stuff'
    }
    const result = jiraParser.parse(text)
    expect(result).toMatchObject(expected)
  })

  test('worklog contains 1d as time spent, space and comma', () => {
    const text = 'CMS-123 1d 2h 30m ,testing - working on stuff'
    const expected = {
      timeSpent: '1d 2h 30m',
      jira: 'CMS-123',
      comment: 'testing - working on stuff'
    }
    const result = jiraParser.parse(text)
    expect(result).toMatchObject(expected)
  })

  test('worklog contains 1d and 30m without hour as time spent, space and comma', () => {
    const text = 'CMS-123 1d 30m ,testing - working on stuff'
    const expected = {
      timeSpent: '1d 30m',
      jira: 'CMS-123',
      comment: 'testing - working on stuff'
    }
    const result = jiraParser.parse(text)
    expect(result).toMatchObject(expected)
  })
})

describe('timeSpent in text format should return numeric hour', () => {
  describe('valid times', () => {
    test('2h', () => {
      const text = '2h'
      const expected = 2.0
      const result = jiraParser.timeSpentToHours(text)
      // assert
      expect(result.toFixed(2)).toEqual(expected.toFixed(2))
    })

    test('2h', () => {
      const text = '2h'
      const expected = 2.0
      const result = jiraParser.timeSpentToHours(text)
      expect(result.toFixed(2)).toEqual(expected.toFixed(2))
    })

    test('1h 30m', () => {
      const text = '1h 30m'
      const expected = 1.5
      const result = jiraParser.timeSpentToHours(text)
      expect(result.toFixed(2)).toEqual(expected.toFixed(2))
    })

    test('15m', () => {
      const text = '15m'
      const expected = 0.25
      const result = jiraParser.timeSpentToHours(text)
      expect(result.toFixed(2)).toEqual(expected.toFixed(2))
    })

    test('1h 45m', () => {
      const text = '1h 45m'
      const expected = 1.75
      const result = jiraParser.timeSpentToHours(text)
      expect(result.toFixed(2)).toEqual(expected.toFixed(2))
    })

    test('50m', () => {
      const text = '50m'
      const expected = 0.83
      const result = jiraParser.timeSpentToHours(text)
      expect(result.toFixed(2)).toEqual(expected.toFixed(2))
    })

    test('1d', () => {
      const text = '1d'
      const expected = 8.0
      const result = jiraParser.timeSpentToHours(text)
      // assert
      expect(result.toFixed(2)).toEqual(expected.toFixed(2))
    })

    test('1d 1h 30m', () => {
      const text = '1d 1h 30m'
      const expected = 9.5
      const result = jiraParser.timeSpentToHours(text)
      // assert
      expect(result.toFixed(2)).toEqual(expected.toFixed(2))
    })

    test('1d 30m', () => {
      const text = '1d 30m'
      const expected = 8.5
      const result = jiraParser.timeSpentToHours(text)
      // assert
      expect(result.toFixed(2)).toEqual(expected.toFixed(2))
    })
  })

  describe('invalid times', () => {
    test('50e', () => {
      const text = '50e'
      const expected = 0
      const result = jiraParser.timeSpentToHours(text)
      expect(result.toFixed(2)).toEqual(expected.toFixed(2))
    })

    test('50mk', () => {
      const text = '50mk'
      const expected = 0
      const result = jiraParser.timeSpentToHours(text)
      expect(result.toFixed(2)).toEqual(expected.toFixed(2))
    })

    test('huebr', () => {
      const text = 'huebr'
      const expected = 0
      const result = jiraParser.timeSpentToHours(text)
      expect(result.toFixed(2)).toEqual(expected.toFixed(2))
    })
  })
})

test('isValidTimeSpentFormat should validate timeSpent in text format', done => {
  // arrange
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
  ]
  // act
  testDataList.forEach(testData => {
    const text = Object.keys(testData)[0]
    const expected = testData[text]
    const result = jiraParser.isValidTimeSpentFormat(text)
    // assert
    expect(result).toEqual(expected)
    done()
  })
})

describe('validate fields', () => {
  describe('fields are incorrect', () => {
    test('timeSpent is invalid', () => {
      const item = {
        timeSpent: '30',
        jira: 'CMS-1234',
        comment: 'working on stuff'
      }
      const invalidFields = ['timeSpent']

      const result = jiraParser.getInvalidFields(item)
      expect(result).toMatchObject(invalidFields)
    })

    test('jira and timeSpent are invalid', () => {
      const item = {
        timeSpent: '30',
        jira: 'CMS',
        comment: 'working on stuff'
      }
      const invalidFields = ['jira', 'timeSpent']

      const result = jiraParser.getInvalidFields(item)
      expect(result).toMatchObject(invalidFields)
    })

    test('comment is invalid', () => {
      const item = {
        timeSpent: '1h 30m',
        jira: 'CMS-123',
        comment: ''
      }
      const invalidFields = ['comment']

      const result = jiraParser.getInvalidFields(item)
      expect(result).toMatchObject(invalidFields)
    })

    test('all fields are invalid', () => {
      const item = {
        jira: 'CMS-123a',
        timeSpent: '1h am',
        comment: '  '
      }
      const invalidFields = ['jira', 'timeSpent', 'comment']

      const result = jiraParser.getInvalidFields(item)
      expect(result).toMatchObject(invalidFields)
    })

    test('jira is invalid', () => {
      const item = {
        jira: '-2',
        timeSpent: '1h',
        comment: 'test'
      }
      const invalidFields = ['jira']

      const result = jiraParser.getInvalidFields(item)
      expect(result).toMatchObject(invalidFields)
    })
  })

  describe('fields are correct', () => {
    test('long jira number', () => {
      const item = {
        jira: 'MANAGEMENT-4',
        timeSpent: '1h',
        comment: 'test'
      }
      const invalidFields = []

      const result = jiraParser.getInvalidFields(item)
      expect(result).toMatchObject(invalidFields)
    })

    test('short comment', () => {
      const item = {
        jira: 'KIMOFR-24',
        timeSpent: '1h',
        comment: 'test'
      }
      const invalidFields = []

      const result = jiraParser.getInvalidFields(item)
      expect(result).toMatchObject(invalidFields)
    })

    test('jira number', () => {
      const item = {
        jira: 'PLANNING-2',
        timeSpent: '1h',
        comment: 'test'
      }
      const invalidFields = []

      const result = jiraParser.getInvalidFields(item)
      expect(result).toMatchObject(invalidFields)
    })

    test('short jira number', () => {
      const item = {
        jira: 'P-2',
        timeSpent: '1h',
        comment: 'test'
      }
      const invalidFields = []

      const result = jiraParser.getInvalidFields(item)
      expect(result).toMatchObject(invalidFields)
    })

    test('very long jira number', () => {
      const item = {
        jira: 'TESTINGLONGERJIRAKEY-123',
        timeSpent: '1h 45m',
        comment: 'test'
      }
      const invalidFields = []

      const result = jiraParser.getInvalidFields(item)
      expect(result).toMatchObject(invalidFields)
    })

    test('Testing Jirakey Name with Number', () => {
      const item = {
        jira: 'JIRA2020-123',
        timeSpent: '1h 45m',
        comment: 'test'
      }
      const invalidFields = []

      const result = jiraParser.getInvalidFields(item)
      expect(result).toMatchObject(invalidFields)
    })
  })
})
