const updateScript = require("../../chrome-extension/js/update-script");

let window = {};

test("should run update storage script upon extension update", (done) => {  
    var isCalled = false;
    global.chrome = {
        runtime: {
            onInstalled: {
                addListener: jest.fn(function(callback){
                    isCalled = true;
                    callback({
                        reason: 'update',
                        previousVersion: '0.2.2'
                    });
                })
            },
            getManifest: jest.fn(function(){
                return {
                    version: '0.2.3'
                }
            })
        }
    };
    global.console = {
        log: jest.fn()
    };
    updateScript.run();
    expect(chrome.runtime.onInstalled.addListener).toHaveBeenCalled();
    expect(isCalled).toBeTruthy();
    expect(console.log).toHaveBeenCalledWith('Updated from 0.2.2 to 0.2.3!');
    expect(console.log).toHaveBeenCalledWith('details', {
            reason: 'update',
            previousVersion: '0.2.2'
        });
    expect(chrome.runtime.getManifest).toHaveBeenCalled();
    done();
});
