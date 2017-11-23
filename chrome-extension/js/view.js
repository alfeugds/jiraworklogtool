window.View = window.View || {};

window.View.Main = (function() {
    var worklogDateInput,
        getWorklogButton,
        worklogInput,
        addWorklogsButton,
        saveButton,
        totalHoursSpan;
    var previousDate;

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
            previousDate = worklogDateInput.value;

            mediator.on("modal.totalHours.update", totalHours => {
                totalHoursSpan.innerText =
                    parseFloat(totalHours).toFixed(2) + "h";
            });

            mediator.on("view.table.new-worklog.changed", worklog => {
                
                persistUnsavedData()
                    .then(() => {
                        console.log('persisted data locally.');
                    });
            });

            mediator.on("view.table.new-worklog.deleted", worklog => {
                
                persistUnsavedData()
                    .then(() => {
                        console.log('persisted data locally (deletion).');
                    });
            });

            getWorklogButton.addEventListener("click", () => {
                setLoadingStatus(true);
                persistUnsavedData()
                    .then(getWorklogItemsFromDate)
                    .then(() => {
                        setLoadingStatus(false);
                    });
            });

            addWorklogsButton.addEventListener("click", () => {
                setLoadingStatus(true);
                Controller.LogController.bulkInsert(worklogInput.value).then(
                    () => {
                        worklogInput.value = "";
                        mediator.trigger("view.table.new-worklog.changed", {});
                        setLoadingStatus(false);
                    }
                );
            });

            saveButton.addEventListener("click", () => {
                setLoadingStatus(true);
                var items = View.Table.getWorklogItems();
                Controller.LogController.save(items, worklogDateInput.value)
                    .then(() => {
                        getWorklogItemsFromDate().then(() => {
                            alert("Worklog saved.");
                            setLoadingStatus(false);
                        });            
                    })
                    .catch(error => {
                        alert("Something went wrong.");
                    })
                    .then(() => {
                        setLoadingStatus(false);
                    });
            });

            worklogDateInput.addEventListener(
                "input",
                () => {
                    console.log("date changed: " + worklogDateInput.value);
                    setLoadingStatus(true);
                    getWorklogItemsFromDate().then(() => {
                        setLoadingStatus(false);
                    });
                },
                true
            );

            getWorklogItemsFromDate().then(() => {
                setLoadingStatus(false);
            });
        });
    }

    function persistUnsavedData() {
        //first, persist unsaved data locally
        var items = View.Table.getWorklogItems().filter(item => {
            return item.status === "new";
        });
        return Controller.LogController.persistUnsavedData(worklogDateInput.value, items);
    }

    function getWorklogItemsFromDate() {
        var promise = Controller.LogController.getWorklogsByDay(
            worklogDateInput.value
        );
        promise
            .then(() => {})
            .catch(error => {
                alert(
                    "Something went wrong. Please make sure you are logged in Jira, and the Jira URL is correct."
                );
            })
            .then(() => {
                previousDate = worklogDateInput.value;
            });
        return promise;
    }

    function setWorklogDateInputValue(formattedDate) {}

    function formatDate(date) {
        var d = date,
            month = "" + (d.getMonth() + 1),
            day = "" + d.getDate(),
            year = d.getFullYear();

        if (month.length < 2) month = "0" + month;
        if (day.length < 2) day = "0" + day;

        return [year, month, day].join("-");
    }

    function setLoadingStatus(isLoading) {
        if (isLoading) {
            document.getElementById("loading").classList.remove("hidden");
        } else {
            document.getElementById("loading").classList.add("hidden");
        }
    }

    return {
        init: init,
        setLoadingStatus: setLoadingStatus
    };
})();

window.View.Table = (function() {
    var table, tbody;
    var originalWorklogItems = [];

    var worklogTableRowTemplate = `
    <tr class="worklog {{status-class}}" data-status="{{status}}" data-id="{{logId}}">
        <td class="tg-yw4l jira-number-column-item">
            <input name="jira" type="text" value="{{jiraNumber}}"/>
        </td>
        <td class="tg-yw4l time-spent-column-item">
            <input name="timeSpent" type="text" value="{{timeSpent}}" pattern="(\d+[m]|\d+[h](?:\s\d+[m])?)"/>
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
        saved: "worklog--saved",
        invalid: "worklog--invalid",
        edited: "worklog--edited"
    };

    function getStatusClass(status) {
        return statusClassList[status];
    }

    function addRow(worklogItem) {
        var row = worklogTableRowTemplate
            .replace("{{jiraNumber}}", worklogItem.jira)
            .replace("{{timeSpent}}", worklogItem.timeSpent)
            .replace("{{comment}}", worklogItem.comment)
            .replace("{{status}}", worklogItem.status)
            .replace("{{logId}}", worklogItem.logId)
            .replace("{{status-class}}", getStatusClass(worklogItem.status));
        tbody.innerHTML += row;
    }

    function deleteRow() {
        //TODO: implement
    }

    function clearRows() {
        var new_tbody = document.createElement("tbody");
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

    function getWorklogFromRow(row) {
        var status = row.getAttribute("data-status");
        var logId = row.getAttribute("data-id");
        var jira = row.querySelector("[name=jira]").value;
        var timeSpent = row.querySelector("[name=timeSpent]").value;
        var comment = row.querySelector("[name=comment]").value;
        //var jira = row.get
        //...
        return {
            status: status,
            jira: jira,
            timeSpent: timeSpent,
            comment: comment,
            logId: logId
        };
    }

    function getWorklogItems() {
        var items = [];

        for (var i = 0, row; (row = tbody.rows[i]); i++) {
            items.push(getWorklogFromRow(row));
        }
        return items;
    }

    function updateWorklogRowStatus(row, oldStatus, newStatus) {
        var oldStatusClass = getStatusClass(oldStatus);
        var newStatusClass = getStatusClass(newStatus);
        row.classList.remove(oldStatusClass);
        row.classList.add(newStatusClass);
        row.setAttribute("data-status", newStatus);
    }

    function isEqual(worklog1, worklog2){
        return worklog1.jira === worklog2.jira &&
            worklog1.comment === worklog2.comment &&
            worklog1.timeSpent === worklog2.timeSpent;
    }

    function worklogChanged(e) {
        var row = e.srcElement.parentElement.parentElement;
        var worklog = getWorklogFromRow(row);
        console.log("worklog changed", worklog);
        if (worklog.status !== "new") {
            originalWorklog = originalWorklogItems.filter(item => {
                return item.logId === worklog.logId;
            })[0];
            if (isEqual(originalWorklog, worklog)) {
                updateWorklogRowStatus(row, worklog.status, "saved");
            } else {
                updateWorklogRowStatus(row, worklog.status, "edited");
            }
        } else{
            mediator.trigger("view.table.new-worklog.changed", worklog);
        }
    }

    function deleteRow(row){
        tbody.removeChild(row);
    }

    function worklogDeleted(e){
        var row = e.srcElement.parentElement.parentElement;
        var worklog = getWorklogFromRow(row);

        if (worklog.status === "new") {
            //just delete the row
            deleteRow(row);
            mediator.trigger('view.table.new-worklog.deleted', worklog);
        }
    }

    function configureInputListeners() {
        var inputs = tbody.querySelectorAll("input[type=text]");

        inputs.forEach(input => {
            input.removeEventListener("input", worklogChanged);
            input.addEventListener("input", worklogChanged);
        });

        var deleteButtons = tbody.querySelectorAll("a.delete-button");
        
        deleteButtons.forEach(deleteButton => {
            deleteButton.removeEventListener("click", worklogDeleted);
            deleteButton.addEventListener("click", worklogDeleted);
        });
    }


    function init() {
        table = document.getElementById("worklog-items");
        tbody = table.getElementsByTagName("tbody")[0];

        mediator.on("model.workloglist.updated", worklogItems => {
            originalWorklogItems = worklogItems;
            populateWorklogTable(worklogItems);
            configureInputListeners();
        });
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
