window.View = window.View || {};

window.View.Main = (function (){
    function setLoadingStatus(isLoading) {
        if (isLoading) {
            document.getElementById("loading").classList.remove('hidden');
        } else {
            document.getElementById("loading").classList.add('hidden');
        }
    }

    return {
        setLoadingStatus: setLoadingStatus
    };
    
})();

window.View.Table = (function () {
    var table,
        tbody;

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

    function addRow(worklogItem) {
        var row = worklogTableRowTemplate
            .replace('{{jiraNumber}}', worklogItem.jira)
            .replace('{{timeSpent}}', worklogItem.timeSpent)
            .replace('{{comment}}', worklogItem.comment);
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

    function populateWorklogTable(worklogItems){
        clearRows();

        for (var i = 0; i < worklogItems.length; i++) {
            var worklogItem = worklogItems[i];
            addRow(worklogItem);        
        }
    }

    function init(){
        table = document.getElementById('worklog-items');
        tbody = table.getElementsByTagName('tbody')[0];
    }

    return {
        init: init,
        addRow: addRow,
        deleteRow: deleteRow,
        clearRows: clearRows,
        populateWorklogTable: populateWorklogTable
    };
})();