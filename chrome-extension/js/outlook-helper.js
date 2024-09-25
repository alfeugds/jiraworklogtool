(function (chrome) {
  var outlookOptions = {}

  function setOutlookOptions (options) {
    outlookOptions = options
  }

  function testConnection () {
    if (!outlookOptions.outlookSyncEnabled) {
      console.log('Outlook sync is disabled')
      return Promise.resolve()
    }

    return getToken();
  }

  function init () {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.get(
        {
          outlookOptions: {}
        },
        function (items) {
          setOutlookOptions(items.outlookOptions)
          testConnection()
            .then(resolve)
            .catch(reject)
        }
      )
    })
  }

  function getToken() {
    return new Promise((resolve, reject) => {
      if (!outlookOptions.tenantID || !outlookOptions.clientID) {
        console.log('Outlook options are not set');
        reject('Outlook options are not set');
      }

      chrome.identity.launchWebAuthFlow(
        {
          url: `https://login.microsoftonline.com/${outlookOptions.tenantID}/oauth2/v2.0/authorize?` +
            'response_type=token' +
            '&response_mode=fragment' +
            '&client_id=' + outlookOptions.clientID +
            '&redirect_uri=' + chrome.identity.getRedirectURL() +
            '&scope=Calendars.ReadBasic',
          interactive: true
        },
        function (responseWithToken) {
          console.log('Authorization response:', responseWithToken);
          if (chrome.runtime.lastError || !responseWithToken) {
            reject('Authorization failed: ' + chrome.runtime.lastError);
          }

          const token = extractAccessToken(responseWithToken);
          if (token) {
            resolve(token);
          } else {
            reject('Failed to extract access token from response: ' + responseWithToken);
          }
        }
      );

      chrome.identity.getAuthToken({ 'interactive': true }, function(token) {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError)
        } else {
          resolve(token)
        }
      })
    })
  }

  function extractAccessToken(responseUrl) {
    const params = new URLSearchParams(responseUrl.split('#')[1]);
    return params.get('access_token');
  }

  async function fetchAllPages(url, accessToken) {
    let allResults = [];

    async function fetchPage(url) {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch calendar entries');
      }

      const data = await response.json();
      allResults = allResults.concat(data.value);

      if (data['@odata.nextLink']) {
        await fetchPage(data['@odata.nextLink']);
      }
    }

    await fetchPage(url);
    return allResults;
  }

  function fetchCalendarEntries(accessToken) {
    return new Promise((resolve, reject) => {
      const dateStart = new Date(new Date(worklogDateInput.value).setHours(0, 0, 0, 0));
      const dateEnd = new Date(new Date(worklogDateInput.value).setHours(23, 59, 59, 999));
      const url = `https://graph.microsoft.com/v1.0/me/calendar/calendarView?startDateTime=${dateStart.toISOString()}&endDateTime=${dateEnd.toISOString()}`;

      fetchAllPages(url, accessToken)
      .then(data => {
        console.log('Calendar events:', data);

        // Sort events by start date
        data.sort((a, b) => new Date(a.start.dateTime) - new Date(b.start.dateTime));

        // Filter out events based on the specified criteria
        const filteredData = data.filter(event =>
          !event.isAllDay &&
          !event.isCancelled &&
          event.sensitivity !== 'private' &&
          event.subject !== 'Mittagspause' &&
          event.subject !== 'Notizen' &&
          event.subject !== 'Notes'
        );

        const worklogItems = filteredData.map(event => {
          const startTime = new Date(event.start.dateTime);
          const endTime = new Date(event.end.dateTime);
          const durationMinutes = (endTime - startTime) / (1000 * 60); // Convert milliseconds to minutes
          const durationString = durationMinutes >= 60
            ? `${Math.floor(durationMinutes / 60)}h ${durationMinutes % 60}m`
            : `${durationMinutes}m`;
          const worklogString = `${event.subject} ${durationString} ${event.subject}`;
          return worklogString;
        });

        console.log('Worklog items:', worklogItems);

        Controller.LogController.bulkInsert(worklogItems.join('\n'))
        .then(() => {
            mediator.trigger('view.table.new-worklog.changed', {})
            resolve()
        });
      })
      .catch(error => {
        reject('Error fetching calendar entries: ' + error);
      });
    });
  }

  window.OutlookHelper = {
    init: init,
    testConnection: testConnection,
    getToken: getToken,
    fetchCalendarEntries: fetchCalendarEntries,
  }
})(window.chrome)

if (typeof module !== 'undefined') { module.exports = window.OutlookHelper }
