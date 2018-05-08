var axios = require('axios');
var mockAxios = axios.create();
var MockAdapter = require('axios-mock-adapter');
// This sets the mock adapter on the default instance
var mock = new MockAdapter(mockAxios, { delayResponse: 10 });

global.axios = mockAxios;

global.options = {
    jiraOptions: {
        jiraUrl: 'https://whatever.com',
        user: 'someuser@gmail.com',
        password: 'pwd',
        token: 'tkn'
    }
};

global.chrome = {
    storage: {
        sync: {
            set: jest.fn((options, callback) => {
                options = options;
                callback();
            }),
            get: jest.fn((jiraOptions, callback) => {
                callback(options)
            })
        }
    }
};

//module to test
const jiraHelper = require("../../chrome-extension/js/jira-helper");

describe('Jira API Helper', () => {

    beforeEach(() => {

    });

    afterEach(() => {

    });

    describe('testConnection', () => {
        test('testConnection works successfully with valid options', done => {
            //arrange
            const options = {
                jiraUrl: 'https://whatever.com',
                user: 'someuser@gmail.com',
                password: 'pwd',
                token: 'tkn'
            };
            mock.onGet(/rest\/api\/2\/search/)
            .replyOnce(200,
                {
                    issues: [{
                        'key': 'cms-123'
                    }]
                },
                {
                    'x-ausername': 'hue@br.com'
                }
            );
    
            //act
            jiraHelper.testConnection(options).then(result => {
                //assert
                expect(result).not.toBeNull();
                expect(result[0]).toEqual('cms-123');
                done();
            }).catch((e) => {
                fail(e);
                done();
            })
        });

        test('testConnection fails with invalid options', done => {
            //arrange
            const options = {
                jiraUrl: 'https://whatever.com',
                user: 'wrong@gmail.com',
                password: 'pwd',
                token: 'tkn'
            };

            mock.onGet(/rest\/api\/2\/search/)
            .replyOnce(401,
                {
                    status: 401,
                    statusText: 'invalid jira hostname',
                    errorMessages: ['hue']
                }
            );

            jiraHelper.testConnection(options).then(result => {
                fail();
                done();
            })
            .catch(error => {
                expect(error).toEqual('Server response: 401(undefined): hue');
                done()
            });
        })

    });
    describe('init', () =>{
        test("module is initiated successfully", done => {
            //arrange
            mock.onGet(/rest\/api\/2\/search/)
                .replyOnce(200,
                    {
                        issues: [{
                            'key': 'cms-123'
                        }]
                    },
                    {
                        'x-ausername': 'hue@br.com'
                    }
                );
            //act
            jiraHelper.init().then((result) => {
                //assert
                expect(result).toEqual(['cms-123'])
                done();
            }).catch(error =>{
                fail(error);
                done();
            });
        });
        test('module fails with invalid options')
    })
    describe('getWorklog', () => {
        beforeEach(done => {
            //arrange
            mock.onGet(/rest\/api\/2\/search/)
                .replyOnce(200,
                    {
                        issues: [{
                            'key': 'cms-123'
                        }]
                    },
                    {
                        'x-ausername': 'hue@br.com'
                    }
                );
            global.options.jiraOptions.user = 'hue@br.com'
            //act
            jiraHelper.init().then((result) => {
                //assert
                expect(result).toEqual(['cms-123'])
                done();
            }).catch(error =>{
                fail(error);
                done();
            });
        });
        test('returns 2 worklogs successfully', done => {
            mock.onGet(/rest\/api\/2\/search/)
            .replyOnce(config => {
                return [200,
                    {
                        issues: [{
                            'key': 'cms-123'
                        }]
                    },
                    {
                        'x-ausername': 'hue@br.com'
                    }]                
            });
            mock.onGet(/rest\/api\/2\/issue\/cms-123\/worklog/)
            .replyOnce(config => {
                return [200,
                    {
                        "worklogs":[  
                            {  
                                "author":{
                                    "key":"hue@br.com"
                                },
                                "comment":"tech onboarding",
                                "started":"2018-03-26T06:00:00.000+0000",
                                "timeSpent":"1h 50m",
                                "id":"55829"
                            }
                        ]
                    },
                    {
                        'x-ausername': 'hue@br.com'
                    }]                
            });
            jiraHelper.getWorklog('2018-03-26').then(result => {
                const worklog = result[0];
                expect(worklog.jira).toEqual('cms-123');
                expect(worklog.timeSpent).toEqual('1h 50m');
                expect(worklog.comment).toEqual('tech onboarding');
                expect(worklog.status).toEqual('saved');
                expect(worklog.started).toEqual('2018-03-26T06:00:00.000+0000');
                expect(worklog.logId).toEqual('55829');
                done();
            }).catch(e => {
                fail(e);
                done();
            });
        })
        test('returns zero worklogs')
        test('returns error')
    });
    describe('logWork', () => {
        test('adds worklog successfully')
        test('fails to add worklog due to wrong input')
        test('fails to add worklog due to jira instance error')
    });
    describe('updateWorklog', () => {
        test('updates worklog successfully')
        test('fails to update worklog due to wrong input')
        test('fails to update worklog due to jira instance error')
    });
    describe('deleteWorklog', () => {
        test('deletes worklog successfully')
        test('fails to delete worklog due to wrong input')
        test('fails to delete worklog due to jira instance error')
    });
});