window.Controller = window.Controller || {};
window.Controller.LogController = (function () {

    function init(){
        
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

    }

    function getWorklogsByDay(worklogDate) {
        return new Promise((resolve, reject) => {

            JiraHelper.getWorklog(worklogDate).then((worklogItems) => {
                console.log(worklogItems);
                Model.WorklogModel.setItems(worklogItems);
            }).catch(() => {
                alert('Something went wrong.');
            }).then(() => {
                resolve();
            });

        } );
    }

    function getFromText(worklogItemsText){
        var arr = worklogItemsText.split('\n');
        var result = [];
        for (var i = 0; i < arr.length; i++) {
            var worklogText = arr[i];
            result.push(JiraParser.parse(worklogText));            
        }
        // return [{
        //     timeSpent: "1h",
        //     jira: "CMS-1234",
        //     comment:
        //         "[grooming] align with SM about grooming pending tasks and blocks / align with Devs the grooming tasks and story overview"
        // },
        // {
        //     timeSpent: "2h 30m",
        //     jira: "CMS-1211",
        //     comment:
        //         "working on stuff"
        // }];
        return result;
    }

    function bulkInsert(worklogItemsText) {
        return new Promise((resolve, reject) => {
            var worklogItems = getFromText(worklogItemsText);
            Model.WorklogModel.addAll(worklogItems);
            resolve();
        });
    }

    function save(params) {
        
    }

    return {
        getWorklogsByDay: getWorklogsByDay,
        bulkInsert: bulkInsert,
        save: save,
        init: init
    };
})();