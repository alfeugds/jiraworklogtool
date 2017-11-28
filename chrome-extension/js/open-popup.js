var popupWindow = window.open(
    chrome.extension.getURL("popup.html"),
    "Jira Worklog Tool",
    "width=610,height=500"
);
popupWindow.focus();
window.close();