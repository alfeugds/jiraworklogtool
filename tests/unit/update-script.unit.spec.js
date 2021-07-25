/* global test jest expect describe beforeEach */
const { updateScript } = require('../../chrome-extension/js/update-script')

describe('Update Script', () => {
  beforeEach(() => {
    // arrange
    global.options = {
      jiraOptions: {
        jiraUrl: 'https://whatever.com',
        user: 'someuser@gmail.com',
        password: 'pwd',
        token: 'tkn'
      }
    }
    global.chrome = {
      runtime: {
        getManifest: jest.fn(function () {
          return {
            version: '0.2.3'
          }
        })
      },
      storage: {
        sync: {
          set: jest.fn((options, callback) => {
            global.options = options
            callback()
          }),
          get: jest.fn((jiraOptions, callback) => {
            callback(global.options)
          })
        }
      }
    }
    global.console = {
      log: jest.fn()
    }
  })

  test('should run update storage script upon extension update', (done) => {
    // act
    // console.log('before', options);
    expect(global.options.jiraOptions.password).toBe('pwd')
    updateScript.run().then(() => {
      // assert

      expect(console.log).toHaveBeenCalledWith('app version: 0.2.3')
      expect(global.chrome.runtime.getManifest).toHaveBeenCalled()
      expect(global.options.jiraOptions.token).toBe('tkn')
      expect(global.options.jiraOptions.password).toBe('')

      done()
    })
  })
})
