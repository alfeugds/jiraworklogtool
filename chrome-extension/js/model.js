window.Model = {};
window.Model.WorklogModel = (function(){

    var items = [];
    var totalHours = 0;

    function addAll(newItems){
        items = items.concat(newItems);
        mediator.trigger('model.workloglist.updated', items);
    }

    function getItems(){
        return items;
    }

    function setItems(newItems){
        items = newItems;
        mediator.trigger('model.workloglist.updated', items);
    }

    function updateTotalHours(){
        var total = 0;
        for (var i = 0; i < items.length; i++) {
            var worklog = items[i];
            total += JiraParser.timeSpentToHours(worklog.timeSpent);
        }
        totalHours = total;
    }

    function getTotalHours(){
        updateTotalHours();
        return totalHours;
    }

    return {
        addAll: addAll,
        getItems: getItems,
        setItems: setItems,
        getTotalHours: getTotalHours
    };
})();