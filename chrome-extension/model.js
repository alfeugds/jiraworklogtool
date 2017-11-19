window.Model = {};
window.Model.WorklogModel = (function(){

    var items = [];

    function addAll(newItems){
        items = items.concat(newItems);
    }

    function getItems(){
        return items;
    }

    function setItems(newItems){
        items = newItems;
    }

    return {
        addAll: addAll,
        getItems: getItems,
        setItems: setItems
    };
})();