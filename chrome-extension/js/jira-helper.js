(function(){
    var user = '';
    var headers = {
        "content-type": "application/json",
        "cache-control": "no-cache"
    };
    var jiraOptions = {};

    function searchForWorklogKeysByDate(worklogDate){
        return new Promise((resolve, reject) =>{
            var fields = "fields=fields,key"
            var jql = `jql=worklogDate='${worklogDate}' AND worklogAuthor=currentUser()`;
            var url = jiraOptions.jiraUrl + "/rest/api/2/search?" + fields + '&' + jql;
            
            var config = {
                'headers': headers,
                'method': 'GET',
                'url': url
            }
            request(config).then((response) => {
                var keys = [];
                for (var i = 0; i < response.issues.length; i++) {
                    var item = response.issues[i];
                    keys.push(item.key);
                }
                resolve(keys);
            }).catch((error) => {
                reject(error);
            });
            
        });
    }

    function testConnection(options){
        return new Promise((resolve, reject) =>{
            var fields = "fields=fields,key"
            var jql = `jql=worklogAuthor=currentUser()`;
            var url = options.jiraUrl + "/rest/api/2/search?" + fields + '&' + jql;
            
            if (options.user) {
                var b64 = btoa(`${options.user}:${options.password}`);
                headers.Authorization = `Basic ${b64}`;
            }
            if(options.token){
                headers.app_token = options.token;
            }


            var config = {
                'headers': headers,
                'method': 'GET',
                'url': url
            }
            request(config).then((response) => {
                var keys = [];
                for (var i = 0; i < response.issues.length; i++) {
                    var item = response.issues[i];
                    keys.push(item.key);
                }
                resolve(keys);
            }).catch((error) => {
                reject(error);
            });
            
        });
    }
    
    function request(config){
        return new Promise((resolve, reject) => {
            var xhr = new XMLHttpRequest();
            xhr.withCredentials = true;
            
            xhr.addEventListener("readystatechange", () => {
                if (xhr.readyState === 4) {
                    if(xhr.status === 200 || xhr.status === 201 || xhr.status === 204){
                        //TODO: define better way to save user name, which will be used to filter the worklogs
                        user = xhr.getResponseHeader('X-AUSERNAME').toLowerCase();
                        var response = {};
                        if (xhr.responseText) {
                            response = JSON.parse(xhr.responseText);
                        }
                        resolve(response);
                    }else{
                        reject(xhr.statusText);
                    }
                }
            });
            
            xhr.open(config.method, config.url);

            for (header in config.headers) {
                xhr.setRequestHeader(header, config.headers[header]);   
            }
            if (config.data) 
                xhr.send(JSON.stringify(config.data));
            else
                xhr.send();
        });
    }

    function getDetailedWorklogFromIssue(key){
        var url = `${jiraOptions.jiraUrl}/rest/api/2/issue/${key}/worklog`;
        var config = {
            'headers': headers,
            'method': 'GET',
            'url': url
        }
        return request(config);
    }

    function getWorklogObjects(key, worklogs){
        return new Promise((resolve) => {
            
            console.log(`key: ${key}`,worklogs);
            var worklogObjectArray = [];
            worklogs.forEach((worklog)=> {
                worklogObjectArray.push({
                    'jira': key,
                    'timeSpent': worklog.timeSpent,
                    'comment': worklog.comment,
                    'started': worklog.started,
                    'logId': worklog.id,
                    'status': 'saved'
                });
            })
            console.log(worklogObjectArray);
            resolve(worklogObjectArray);
        });
    }

    function getDetailedWorklogs(keys, worklogDate){
        return new Promise((resolve) =>{
            var promises = [];
            var worklogsObjectArray = [];
            keys.forEach((key) => {
                var responsePromise = getDetailedWorklogFromIssue(key);
                promises.push(responsePromise);
                
                responsePromise.then((response) => {
                    //filter worklogs by 'started' date and user author
                    var worklogs = response.worklogs.filter((worklog) => {
                        return worklog.started.indexOf(worklogDate) > -1 &&
                            worklog.author.key === (jiraOptions.user || user);
                    });
                    var promise = getWorklogObjects(key, worklogs);
                    promises.push(promise);
                    promise.then((arr) => {
                        worklogsObjectArray = worklogsObjectArray.concat(arr);
                    });
                });
            });
            Promise.all(promises).then(() => {
                resolve(worklogsObjectArray);
            })            
        });
    }

    function getWorklog(worklogDate){
        return searchForWorklogKeysByDate(worklogDate).then((keys) => {
            return getDetailedWorklogs(keys,worklogDate);
        })
    }

    function logWork(worklog, date){
        worklog.started = date + 'T06:00:00.075+0000'; //TODO: refactor to expected date format

        var url = `${jiraOptions.jiraUrl}/rest/api/2/issue/${worklog.jira}/worklog`;
        var config = {
            'headers': headers,
            'method': 'POST',
            'url': url,
            'data': {
                'started': worklog.started,
                'comment': worklog.comment,
                'timeSpent': worklog.timeSpent
            }
        }
        return request(config).then(() => {
            return Promise.resolve(worklog);
        }).catch(() => {
            return Promise.reject(worklog);
        });
    }

    function updateWorklog(worklog){

        worklog = {
            comment: worklog.comment,
            jira: worklog.jira,
            logId: worklog.logId,
            timeSpent: worklog.timeSpent,
        }

        var url = `${jiraOptions.jiraUrl}/rest/api/2/issue/${worklog.jira}/worklog/${worklog.logId}`;
        var config = {
            'headers': headers,
            'method': 'PUT',
            'url': url,
            'data': {
                'started': worklog.started,
                'comment': worklog.comment,
                'timeSpent': worklog.timeSpent
            }
        }
        return request(config).then(() => {
            return Promise.resolve(worklog);
        }).catch(() => {
            return Promise.reject(worklog);
        });
    }

    function deleteWorklog(worklog){

        worklog = {
            comment: worklog.comment,
            jira: worklog.jira,
            logId: worklog.logId,
            timeSpent: worklog.timeSpent,
        }

        var url = `${jiraOptions.jiraUrl}/rest/api/2/issue/${worklog.jira}/worklog/${worklog.logId}`;
        var config = {
            'headers': headers,
            'method': 'DELETE',
            'url': url
        }
        return request(config).then(() => {
            return Promise.resolve(worklog);
        }).catch(() => {
            return Promise.reject(worklog);
        });
    }

    function configureHeaders(jiraOptions){
        if (jiraOptions.user) {
            var b64 = btoa(`${jiraOptions.user}:${jiraOptions.password}`);
            headers.Authorization = `Basic ${b64}`;
        }
        if(jiraOptions.token){
            headers.app_token = jiraOptions.token;
        }
    }

    function setJiraOptions(options){
        jiraOptions = options;
        configureHeaders(options);
        console.log(jiraOptions);
    }

    function init(){
        return new Promise((resolve, reject) => {
            chrome.storage.sync.get(
                {
                    jiraOptions: {}
                },
                function(items) {
                    console.log(items);
                    setJiraOptions(items.jiraOptions);
                    testConnection(items.jiraOptions)
                        .then(resolve)
                        .catch(reject);                    
                }
            );
        });
    }

    window.JiraHelper = {
        init: init,
        getWorklog : getWorklog,
        logWork: logWork,
        updateWorklog: updateWorklog,
        deleteWorklog: deleteWorklog,
        testConnection: testConnection
    }

})();