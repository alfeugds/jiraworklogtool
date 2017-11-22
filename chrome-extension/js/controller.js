window.Controller = window.Controller || {};
window.Controller.LogController = (function () {

    function init(){
        return new Promise((resolve, reject) => {
            //initialize jira url
            //TODO: remove hard-coded url
            chrome.storage.sync.get(
                {
                    jiraUrl: "https://jira.coke.com/jira"
                },
                function(items) {
                    JiraHelper.setJiraUrl(items.jiraUrl);
                    resolve();
                }
            );

        });
        

    }

    function getWorklogsByDay(worklogDate) {
        return new Promise((resolve, reject) => {
            
            JiraHelper.getWorklog(worklogDate).then((worklogItems) => {
                Model.WorklogModel.updateItemsFromJira(worklogItems);
                resolve();
            }).catch(() => {
                reject();
            }).then(() => {
                
            });

        } );
    }

    function getFromText(worklogItemsText){
        var arr = worklogItemsText.split('\n');
        var result = [];
        for (var i = 0; i < arr.length; i++) {
            var worklogText = arr[i];
            if (worklogText && worklogText.trim()) {
                result.push(JiraParser.parse(worklogText));            
            }
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

    function save(items, date) {
        return new Promise((resolve, reject) => {
            console.log(items);
            var promises = [];
            for (var i = 0, item; item = items[i]; i++) {
                var promise;
                switch (item.status) {
                    case 'saved':
                        console.log('item already saved', item);
                        break;
                    case 'invalid':
                        
                        break;
                    case 'edited':
                        
                        break;
                    default:
                        console.log('item ignored', item);
                        break;
                }

                var promise = JiraHelper.logWork(item, date);
                promise.then(result =>{

                }).catch((error) => {

                }).then(() => {
                    
                });
                promises.push(promise);                
            }
            Promise.all(promises).then(() => {
                resolve();
            });
        });
    }

    function persistUnsavedData(date, items){
        if (!items || items.length === 0) {
            return Promise.resolve();
        }

        return Model.WorklogModel.persistUnsavedWorklogToLocal(date, items);
    }

    return {
        getWorklogsByDay: getWorklogsByDay,
        bulkInsert: bulkInsert,
        persistUnsavedData: persistUnsavedData,
        save: save,
        init: init
    };
})();