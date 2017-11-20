window.Controller = window.Controller || {};
window.Controller.LogController = (function () {

    var worklogDateInput;

    function init(){
        worklogDateInput = document.getElementById("worklogDate");
        //initialize date with today's date
        worklogDateInput.value = formatDate(new Date());
        
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

    function formatDate(date) {
        var d = date,
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();

        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;

        return [year, month, day].join('-');
    }

    function getWorklogsByDay() {
        var worklogDate = worklogDateInput.value;

        View.Main.setLoadingStatus(true);

        JiraHelper.getWorklog(worklogDate).then((worklogItems) => {
            console.log(worklogItems);
            Model.WorklogModel.setItems(worklogItems);
            View.Table.populateWorklogTable(Model.WorklogModel.getItems());
        }).catch(() => {
            alert('Something went wrong.');
        }).then(() => {
            View.Main.setLoadingStatus(false);
        });
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
        var worklogItems = getFromText(worklogItemsText);
        Model.WorklogModel.addAll(worklogItems);
        View.Table.populateWorklogTable(Model.WorklogModel.getItems());
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