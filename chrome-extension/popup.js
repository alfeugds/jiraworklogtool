/**
 * Get the current URL.
 *
 * @param {function(string)} callback called when the URL of the current tab
 *   is found.
 */
function getCurrentTabUrl(callback) {
    // Query filter to be passed to chrome.tabs.query - see
    // https://developer.chrome.com/extensions/tabs#method-query
    var queryInfo = {
        active: true,
        currentWindow: true
    };

    chrome.tabs.query(queryInfo, tabs => {
        // chrome.tabs.query invokes the callback with a list of tabs that match the
        // query. When the popup is opened, there is certainly a window and at least
        // one tab, so we can safely assume that |tabs| is a non-empty array.
        // A window can only have one active tab at a time, so the array consists of
        // exactly one tab.
        var tab = tabs[0];

        // A tab is a plain object that provides information about the tab.
        // See https://developer.chrome.com/extensions/tabs#type-Tab
        var url = tab.url;

        // tab.url is only available if the "activeTab" permission is declared.
        // If you want to see the URL of other tabs (e.g. after removing active:true
        // from |queryInfo|), then the "tabs" permission is required to see their
        // "url" properties.
        console.assert(typeof url == "string", "tab.url should be a string");

        callback(url);
    });

    // Most methods of the Chrome extension APIs are asynchronous. This means that
    // you CANNOT do something like this:
    //
    // var url;
    // chrome.tabs.query(queryInfo, (tabs) => {
    //   url = tabs[0].url;
    // });
    // alert(url); // Shows "undefined", because chrome.tabs.query is async.
}


//TODO: delete function
function getCookies(domain, name, callback) {
    chrome.cookies.get({"url": domain, "name": name}, function(cookie) {
        if(callback) {
            callback(cookie.value);
        }
    });
}

//TODO: move it to another meaningful place
function formatDate(date) {
    var d = date,
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
}

function setLoadingStatus(isLoading){
    if (isLoading) {
        document.getElementById("loading").classList.remove('hidden');
    }else{
        document.getElementById("loading").classList.add('hidden');
    }
}

//TODO: work in progress...
function clearRows(){
    document.getElementsById('worklog-items');
}

function populateWorklogTable(worklogItems){
    var worklogTableRowTemplate = `
    <tr class="worklog">
        <td class="tg-yw4l jira-number-column-item">
            <input type="text" value="{{jiraNumber}}"/>
        </td>
        <td class="tg-yw4l time-spent-column-item">
            <input type="text" value="{{timeSpent}}"/>
        </td>
        <td class="tg-yw4l comment-column-item">
            <input type="text" value="{{comment}}"/>
        </td>
        <td class="tg-yw4l select-column-item">
            <input type="checkbox" name="selected">
        </td>
        </tr>
    <tr>`;

    clearRows();
    for (var i = 0; i < worklogItems.length; i++) {
        var worklogItem = worklogItems[i];
        addRow(worklogItem, worklogTableRowTemplate);        
    }

}

document.addEventListener("DOMContentLoaded", () => {
    getCurrentTabUrl(url => {
        var worklogInput = document.getElementById("worklog");
        var getWorklogButton = document.getElementById("getWorklogButton");
        var logWorkButton = document.getElementById("logWorkButton");
        var worklogDateInput = document.getElementById("worklogDate");
        
        //initialize date with today's date
        worklogDate.value = formatDate(new Date());

        setLoadingStatus(true);

        //initialize jira url
        //TODO: remove hard-coded url
        chrome.storage.sync.get(
            {
                jiraUrl: "https://jira.coke.com/jira"
            },
            function(items) {
                JiraHelper.setJiraUrl(items.jiraUrl);
            }
        );

        getWorklogButton.addEventListener("click", () => {
            var worklogDate = worklogDateInput.value;

            setLoadingStatus(true);

            JiraHelper.getWorklog(worklogDate).then((worklogItems) => {
                console.log(worklogItems);
                //populateWorklogTable(worklogItems);
                //alert('done hue ' + worklogItems);
                //jira, timeSpent, comment, started, logId
                var worklogItemsText = '';
                for (var i = 0; i < worklogItems.length; i++) {
                    var worklogItem = worklogItems[i];
                    worklogItemsText += `${worklogItem.jira} - ${worklogItem.timeSpent} - ${worklogItem.comment} \n`;
                    
                }
                worklogInput.value = worklogItemsText;
            }).catch(() => {
                alert('Something went wrong.');
            }).then(() => {
                setLoadingStatus(false);
            });
        });

        logWorkButton.addEventListener("click", () => {
            var requestParams = {
                'worklogText': worklogInput.value,
                'worklogDate': worklogDateInput.value
            }

            setLoadingStatus(true);

            JiraHelper.bulkInsertWorklog(requestParams).then((result) => {
                console.log(result);
                //alert('done hue ' + result);
            }).catch((error) =>{
                console.log(error);
                alert('error hue ' + error);
            }).then(() => {
                setLoadingStatus(false);
            });
        });

        setLoadingStatus(false);
        
    });
});
