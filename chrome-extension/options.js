// Saves options to chrome.storage
function save_options() {
    var jiraUrl = document.getElementById("jiraUrl").value;
    chrome.storage.sync.set(
        {
            jiraUrl: jiraUrl
        },
        function() {
            // Update status to let user know options were saved.
            var status = document.getElementById("status");
            status.textContent = "Options saved.";
            setTimeout(function() {
                status.textContent = "";
            }, 750);
        }
    );
}

// Restores options state using the preferences
// stored in chrome.storage.
function restore_options() {
    //TODO: remove hard-coded url
    chrome.storage.sync.get(
        {
            jiraUrl: "https://jira.coke.com/jira"
        },
        function(items) {
            document.getElementById("jiraUrl").value = items.jiraUrl;
        }
    );
}
document.addEventListener("DOMContentLoaded", restore_options);
document.getElementById("save").addEventListener("click", save_options);
