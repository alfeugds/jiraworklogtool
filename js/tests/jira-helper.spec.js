//mocks
function XMLHttpRequest(){
    this.callback;
    this.addEventListener = jest.fn((eventName, callback) => {
        this.callback = callback;
    });
    this.open = jest.fn();
    this.setRequestHeader = jest.fn();
    this.send = jest.fn(() => {
        global.mockResponse(this);
        this.callback();
    });

    this.getResponseHeader = jest.fn((h) =>{
        return this.header[h];
    });
}

global.mockResponse = jest.fn(() => {
    throw('implement it');
});

global.XMLHttpRequest = XMLHttpRequest;

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
        global.mockResponse = jest.fn().mockImplementationOnce((xhr) => {
            xhr.readyState = 4;
            xhr.status = 200;
            xhr.header = {
                'X-AUSERNAME': 'hue'
            }
            xhr.responseText = '{"issues":[]}'

            xhr.callback();
        });

        const options = {
            jiraUrl: 'https://whatever.com',
            user: 'someuser@gmail.com',
            password: 'pwd',
            token: 'tkn'
        }
        //act
        //assert
        jiraHelper.testConnection(options).then(result => {
            expect(result).not.toBeNull();

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