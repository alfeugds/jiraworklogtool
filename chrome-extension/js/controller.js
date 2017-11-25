window.Controller = window.Controller || {};
window.Controller.LogController = (function(JiraHelper, Model, JiraParser) {
    'use strict';
    function init() {
        return JiraHelper.init();
    }

    function getWorklogsByDay(worklogDate) {
        return new Promise((resolve, reject) => {
            var p = Model.WorklogModel.getUnsavedWorklogFromLocal(worklogDate);
            p.then(items => {
                Model.WorklogModel.clearItems();
                Model.WorklogModel.updateItemsWithLocalData(items);
                JiraHelper.getWorklog(worklogDate)
                    .then(worklogItems => {
                        Model.WorklogModel.updateItemsFromJira(worklogItems);
                        resolve();
                    })
                    .catch(() => {
                        reject();
                    })
                    .then(() => {});
            });
        });
    }

    function getFromText(worklogItemsText) {
        var arr = worklogItemsText.split("\n");
        var result = [];
        for (var i = 0; i < arr.length; i++) {
            var worklogText = arr[i];
            if (worklogText && worklogText.trim()) {
                result.push(JiraParser.parse(worklogText));
            }
        }
        return result;
    }

    function bulkInsert(worklogItemsText) {
        return new Promise((resolve) => {
            var worklogItems = getFromText(worklogItemsText);
            Model.WorklogModel.addAll(worklogItems);
            resolve();
        });
    }

    function save(items, date) {
        return new Promise((resolve) => {
            console.log(items);
            var promises = [];
            var i = items.length;
            while (i--) {
                var item = items[i];

                //ignore invalid items
                if(item.status !== 'deleted' && getInvalidFields(item).length)
                    continue;
                
                var promise;
                switch (item.status) {
                    case "saved":
                        console.log("item already saved", item);
                        break;
                    case "invalid":
                        break;
                    case "edited":
                        var promise = JiraHelper.updateWorklog(item);
                        promise
                            .then(item => {
                                items.splice(items.indexOf(item), 1);
                                console.log('item update', item);
                            })
                            .catch(error => {
                                console.error("controller.save update", error,item);
                            })
                            .then(() => {});
                        promises.push(promise);
                        break;
                    case "new":
                        var promise = JiraHelper.logWork(item, date);
                        promise
                            .then(item => {
                                items.splice(items.indexOf(item), 1);
                                console.log('item inserted', item);
                            })
                            .catch(error => {
                                console.error("controller.save insert", error, item);
                            })
                            .then(() => {});
                        promises.push(promise);
                        break;
                    case "deleted":
                        var promise = JiraHelper.deleteWorklog(item);
                        promise
                            .then(item => {
                                items.splice(items.indexOf(item), 1);
                                console.log('item deleted', item);
                            })
                            .catch(error => {
                                console.error("controller.save delete", error, item);
                            })
                            .then(() => {});
                        promises.push(promise);
                        break;
                    default:
                        console.log("item ignored", item);
                        break;
                }
            }

            Promise.all(promises).then(() => {
                persistUnsavedData(date, items).then(() => {
                    resolve();
                })
            }).catch(error => {
                // persistUnsavedData(date, items).then(() => {
                //     reject(error);
                // })
                console.log('after save error', error);
                resolve();
            });;
        });
    }

    function persistUnsavedData(date, items) {
        return Model.WorklogModel.persistUnsavedWorklogToLocal(date, items)
            .then(() => {
                Model.WorklogModel.clearItems();
                Model.WorklogModel.updateItemsWithLocalData(items);
            });
    }

    function getInvalidFields(worklog){
        return JiraParser.getInvalidFields(worklog);
    }

    return {
        getWorklogsByDay: getWorklogsByDay,
        bulkInsert: bulkInsert,
        persistUnsavedData: persistUnsavedData,
        save: save,
        init: init,
        getInvalidFields: getInvalidFields
    };
})(window.JiraHelper, window.Model, window.JiraParser);
