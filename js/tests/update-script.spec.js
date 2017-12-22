/* global test jest expect describe beforeEach*/
const updateScript = require("../../chrome-extension/js/update-script");

describe('Update Script', () => {
    let options,
    chrome;
    
    beforeEach(() => {
        //arrange
        options = {
            jiraOptions: {
                jiraUrl: 'https://whatever.com',
                user: 'someuser@gmail.com',
                password: 'pwd',
                token: 'tkn'
            }
        };
        global.chrome = {
            runtime: {
                getManifest: jest.fn(function(){
                    return {
                        version: '0.2.3'
                    }
                })
            },
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
        global.console = {
            log: jest.fn()
        };
        chrome = global.chrome;

    });

    test("should run update storage script upon extension update", (done) => {
    
        //act
        //console.log('before', options);
        expect(options.jiraOptions.password).toBe('pwd');
        updateScript.run().then(() => {
            //assert
            
            expect(console.log).toHaveBeenCalledWith('app version: 0.2.3');
            expect(chrome.runtime.getManifest).toHaveBeenCalled();
            expect(options.jiraOptions.token).toBe('tkn');
            expect(options.jiraOptions.password).toBe('');
    
            done();
        });
    
    });
});

