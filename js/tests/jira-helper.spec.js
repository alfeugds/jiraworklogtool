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

    test('testConnection works successfully with valid options', done => {
        //arrange
        const options = {
            jiraUrl: 'https://whatever.com',
            user: 'someuser@gmail.com',
            password: 'pwd',
            token: 'tkn'
        };
        mock.onGet(/rest\/api\/2\/search/).reply(200,
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
    })

    test.skip("module is initiated successfully", done => {
        //arrange
        //act
        //assert
        jiraHelper.init().then(() => {
            done();
        });
    });
});