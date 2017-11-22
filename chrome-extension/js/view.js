window.View = window.View || {};

window.View.Main = (function () {

    var worklogDateInput,
        getWorklogButton,
        worklogInput,
        addWorklogsButton,
        saveButton,
        totalHoursSpan;

    function init() {

        setLoadingStatus(true);        
        
        Controller.LogController.init().then(() => {
            View.Table.init();
    
            getWorklogButton = document.getElementById("getWorklogButton");
            worklogInput = document.getElementById("worklog");
            addWorklogsButton = document.getElementById("addWorklogs");
            saveButton = document.getElementById("save");
            totalHoursSpan = document.getElementById("totalHours");
    
            worklogDateInput = document.getElementById("worklogDate");
            //initialize date with today's date
            worklogDateInput.value = formatDate(new Date());
    
            mediator.on('modal.totalHours.update', totalHours => {
                totalHoursSpan.innerText = parseFloat(totalHours).toFixed(2) + 'h';
            });
    
            getWorklogButton.addEventListener("click", getWorklogItemsFromDate);
    
            addWorklogsButton.addEventListener("click", () => {
                setLoadingStatus(true);
                Controller.LogController.bulkInsert(worklogInput.value).then(() => {
                    worklogInput.value = '';
                    setLoadingStatus(false);
                });
    
            });
    
            saveButton.addEventListener("click", () => {
                setLoadingStatus(true);
                var items = View.Table.getWorklogItems();
                Controller.LogController.save(items, worklogDateInput.value).then(() => {
                    alert('Worklog saved.');
                    
                }).catch(() => {
                    alert('Something went wrong');
                }).then(() => {
                    setLoadingStatus(false);
                });
    
            });

            worklogDateInput.addEventListener('input', () => {
                console.log('date changed: ' + worklogDateInput.value);
                getWorklogItemsFromDate();
            }, true);
    
            getWorklogItemsFromDate();            
        });

    }

    function getWorklogItemsFromDate(){
        setLoadingStatus(true);
        Controller.LogController.getWorklogsByDay(worklogDateInput.value).then(() => {
            setLoadingStatus(false);
        });

    }

    function setWorklogDateInputValue(formattedDate) {

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

    function setLoadingStatus(isLoading) {
        if (isLoading) {
            document.getElementById("loading").classList.remove('hidden');
        } else {
            document.getElementById("loading").classList.add('hidden');
        }
    }

    return {
        init: init,
        setLoadingStatus: setLoadingStatus
    };

})();

window.View.Table = (function () {
    var table,
        tbody;

    var worklogTableRowTemplate = `
    <tr class="worklog {{status-class}}" data-status="{{status}}" data-id="{{logId}}">
        <td class="tg-yw4l jira-number-column-item">
            <input name="jira" type="text" value="{{jiraNumber}}"/>
        </td>
        <td class="tg-yw4l time-spent-column-item">
            <input name="timeSpent" type="text" value="{{timeSpent}}"/>
        </td>
        <td class="tg-yw4l comment-column-item">
            <input name="comment" type="text" value="{{comment}}"/>
        </td>
        <td class="tg-yw4l delete-column-item">
            <a class='delete-button'></a>
        </td>
        <td class="tg-yw4l select-column-item">
            <input type="checkbox" name="selected">
        </td>
    </tr>`;

    var statusClassList = {
        saved: 'worklog--saved',
        invalid: 'worklog--invalid',
        edited: 'worklog--edited'
    };

    function getStatusClass(status){
        return statusClassList[status];
    }

    function addRow(worklogItem) {
        var row = worklogTableRowTemplate
            .replace('{{jiraNumber}}', worklogItem.jira)
            .replace('{{timeSpent}}', worklogItem.timeSpent)
            .replace('{{comment}}', worklogItem.comment)
            .replace('{{status}}', worklogItem.status)
            .replace('{{logId}}', worklogItem.logId)
            .replace('{{status-class}}', getStatusClass(worklogItem.status));
        tbody.innerHTML += row;
    }

    function deleteRow() {
        //TODO: implement
    }

    function clearRows() {
        var new_tbody = document.createElement('tbody');
        tbody.parentNode.replaceChild(new_tbody, tbody);
        tbody = new_tbody;
    }

    function populateWorklogTable(worklogItems) {
        clearRows();

        for (var i = 0; i < worklogItems.length; i++) {
            var worklogItem = worklogItems[i];
            addRow(worklogItem);
        }
    }

    function getWorklogItems(){

        var items = [];
        
        for (var i = 0, row; row = tbody.rows[i]; i++) {
            //iterate through rows
            var status = row.getAttribute('data-status');
            var logId = row.getAttribute('data-id');
            var jira = row.querySelector('[name=jira]').value;
            var timeSpent = row.querySelector('[name=timeSpent]').value;
            var comment = row.querySelector('[name=comment]').value;
            //var jira = row.get         
            //...
            items.push({
                status: status,
                jira: jira,
                timeSpent: timeSpent,
                comment: comment,
                logId: logId
            });
        }
        return items;
    }

    function init() {
        table = document.getElementById('worklog-items');
        tbody = table.getElementsByTagName('tbody')[0];

        mediator.on('model.workloglist.updated', worklogItems => populateWorklogTable(worklogItems));
    }

    return {
        init: init,
        addRow: addRow,
        deleteRow: deleteRow,
        clearRows: clearRows,
        populateWorklogTable: populateWorklogTable,
        getWorklogItems: getWorklogItems
    };
})();