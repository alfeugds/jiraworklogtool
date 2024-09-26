# Jira Worklog Tool
[Download from Chrome Web Store](https://chrome.google.com/webstore/detail/jira-worklog-tool/pekbjnkonfmgjfnbpmindidammhgmjji)

[![CircleCI](https://circleci.com/gh/alfeugds/jiraworklogtool.svg?style=svg)](https://circleci.com/gh/alfeugds/jiraworklogtool)

A simple Chrome Extension that allows adding worklogs in Jira easily.
Logging your time in Jira doesn't need to be a pain anymore. If you already keep track of your tasks in a TODO list from a text file, then all you need to do is to adapt your list items to the below intuitive format:

```
<Jira number> - <time spent> - <worklog details and comments>
```
You can separate the fields with comma, semi-colon, dash, or even a simple white space. See some examples below:

```
JIRA-123 - 1h 30m - working on stuff
JIRA-222 - 45m    - developing that amazing feature in the website
DEV-456 2h 10m fixing bugs in my Pull Request
1m updating my worklog in Jira!
```
You can also omit the Jira # and time spent and add it later.

## Current Features

* Bulk insert worklogs in Jira;
* Converts your task list from text format to a worklog format Jira understands;
* Log your time in Jira issues without the need to open Jira;
* Add, edit and delete worklogs directly from the Chrome Extension;
* Keep track of how many hours you already spent in the tasks;
* Supports SAML and Basic Authentication with Jira app token.
* Also allows to sync events from Outlook Calendar to worklog list for easy logging.

## Getting Started
Before using it, you need to do two things:
- Make sure you are logged in to your Jira instance in Chrome. The extension leverages the existing authentication cookie when it is present in the browser;
- Open the **Options** page and configure the **Jira Hostname**, which needs to point to the API services*. For example: **`https://jira.atlassian.com`**.

After that, click **Test Connection** to make sure the extension can reach Jira correctly. If so, click **Save** and you are good to go.

If by only providing the Jira Hostname the connection fails, you'll need to configure the **Basic Authentication** with your user and password. Also, depending on the authentication method of the Jira API, you'll also need to provide an app token. If that's the case, please consult your IT department to get one.

*_The extension uses the **Jira Hostname** to build the URL and API calls to the Jira instance like this: **`https://jira.atlassian.com/`**`rest/api/2/search`._

### Outlook integration
To sync events from Outlook Calendar to the worklog list, you need to check **Enable Outlook Sync** and provide both the **Tenant ID** and **Client ID**.
You can get these values from the Azure Portal. If you don't have them, please consult your IT department.

For setting up the app in Azure, you can follow the steps below:
1. Go to the [Azure Portal](https://entra.microsoft.com/) and create a new app registration
2. In the app registration, go to the **Authentication** section and add:
  - Redirect URI: https://pekbjnkonfmgjfnbpmindidammhgmjji.chromiumapp.org/
  - Implicit grant: Access tokens
3. Open **API permissions** and add the Microsoft Graph permission **Calendars.ReadBasic**. Your IT department may need to approve this permission depending on your global account settings, even if it does not require admin consent.

## Some Images

![Main popup screen](/screenshots/popup.png "Main Screen")

See it in action:
![Adding worklogs](/screenshots/add-worklog-sample.gif "See it in action")

## Built With

Jira Worklog Tool's major implementation was built with vanilla Javascript. Below are the list of libraries used to help building it:

* [Mediator](https://github.com/ajacksified/Mediator.js) - A light utility class to help implement the Mediator pattern for easy eventing

## Contributions

If you find any issues or have ideas for new features, feel free to open an issue in Github, or even contribute with a new Pull Request!

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

# Development

install dependencies:

````sh
npm i
````

run tests (unit and UI):

````sh
npm run tests
````

UI test playground:

````sh
npm run ui-test-playground
````
## Running UI tests in Windows' wsl 2

- install xvfb with

````sh
sudo apt install xvfb
````

- install Headless Chrome dependencies (see [.circleci/config.yml](.circleci/config.yml) for reference).

- run the tests with `xvfb-run`:

````sh
xvfb-run npm run test
````