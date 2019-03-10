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

function initJiraHelper(){
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
    return jiraHelper.init();
}

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
            initJiraHelper().then(() => done());
        });
        test('returns 2 worklogs successfully', done => {
            mock.onGet(/rest\/api\/2\/search/)
            .replyOnce(config => {
                return [200,
                    {
                        issues: [
                            {
                                'key': 'cms-123'
                            },
                            {
                                'key': 'cms-456'
                            }
                        ]
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
            mock.onGet(/rest\/api\/2\/issue\/cms-456\/worklog/)
            .replyOnce(config => {
                return [200,
                    {
                        "worklogs":[  
                            {  
                                "author":{
                                    "key":"hue@br.com"
                                },
                                "comment":"tech onboarding 2",
                                "started":"2018-03-26T06:00:00.000+0000",
                                "timeSpent":"2h 50m",
                                "id":"45645"
                            }
                        ]
                    },
                    {
                        'x-ausername': 'hue@br.com'
                    }]                
            });
            jiraHelper.getWorklog('2018-03-26').then(result => {
                const firstWorklog = result[0];
                expect(firstWorklog.jira).toEqual('cms-123');
                expect(firstWorklog.timeSpent).toEqual('1h 50m');
                expect(firstWorklog.comment).toEqual('tech onboarding');
                expect(firstWorklog.status).toEqual('saved');
                expect(firstWorklog.started).toEqual('2018-03-26T06:00:00.000+0000');
                expect(firstWorklog.logId).toEqual('55829');

                const secondWorklog = result[1];
                expect(secondWorklog.timeSpent).toEqual('2h 50m');
                done();
            }).catch(e => {
                fail(e);
                done();
            });
        })
        test('returns zero worklogs', done => {
            //arrange
            mock.onGet(/rest\/api\/2\/search/)
            .replyOnce(config => {
                return [200,
                    {
                        issues: []
                    },
                    {
                        'x-ausername': 'hue@br.com'
                    }]                
            });
            jiraHelper.getWorklog('2018-03-26').then(result => {
                expect(result).toEqual([]);
                done();
            }).catch(e => {
                fail(e);
                done();
            });
        });
        test('returns error', done => {
            jiraHelper.getWorklog('2018-03-26').then(result => {
                fail(result);
                done();
            }).catch(e => {
                expect(e).toEqual('Server response: 404(undefined): undefined');
                done();
            });
        });
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
    describe('getJiraUrl', () => {
        beforeEach(done => {
            initJiraHelper().then(() => done());
        });
        test('returns jira url successfully when jira # is CMS-123', done => {
            const jiraUrl = jiraHelper.getJiraUrl("CMS-123");
            expect(jiraUrl).toEqual("https://whatever.com/browse/CMS-123");
            
            done();
        });
        test('returns jira url successfully when jira # is CMS-45678', done => {
            const jiraUrl = jiraHelper.getJiraUrl("CMS-45678");
            expect(jiraUrl).toEqual("https://whatever.com/browse/CMS-45678");
            
            done();
        })
        test('fails to return jira URL when jira # is empty', done => {
            const jiraUrl = jiraHelper.getJiraUrl("");
            expect(jiraUrl).toEqual("");
            done();
        })
        
    });
});