var chrome = window.chrome || {};
var JiraHelper = window.JiraHelper || {};

// Saves options to chrome.storage
function save_options(options) {

    chrome.storage.sync.set(
        {
            jiraOptions: options
        },
        function () {
            // Update status to let user know options were saved.
            var status = document.getElementById("status");
            status.textContent = "Options saved.";
            setTimeout(function () {
                status.textContent = "";
            }, 750);
        }
    );
}

// Restores options state using the preferences
// stored in chrome.storage.
function restoreOptions() {
    chrome.storage.sync.get(
        {
            jiraOptions: {}
        },
        function (items) {
            restoreOptionsToInput(items.jiraOptions);
        }
    );
}

var jiraUrlInput, userInput, passwordInput, tokenInput;

function restoreOptionsToInput(options) {
    jiraUrlInput.value = options.jiraUrl || '';
    userInput.value = options.user || '';
    passwordInput.value = options.password || '';
    tokenInput.value = options.token || '';
}

function getOptionsFromInput() {
    return {
        jiraUrl: jiraUrlInput.value,
        user: userInput.value,
        password: passwordInput.value,
        token: tokenInput.value
    };
}

document.addEventListener("DOMContentLoaded", () => {
    restoreOptions();
    jiraUrlInput = document.getElementById("jiraUrl");
    userInput = document.getElementById("user");
    passwordInput = document.getElementById("password");
    tokenInput = document.getElementById("token");

    document.getElementById("save").addEventListener("click", () => {
        save_options(getOptionsFromInput());
    });
    document.getElementById("testConnection").addEventListener("click", () => {
        var jiraOptions = getOptionsFromInput();
        console.log(jiraOptions);
        JiraHelper.testConnection(jiraOptions)
            .then(result => {
                console.info("connection successful", result);
                alert('Connection [OK]');
            })
            .catch(error => {
                console.error("connection failed", error);
                alert('Connection [FAILED]. Please double-check the options.');
            });
    });
});
