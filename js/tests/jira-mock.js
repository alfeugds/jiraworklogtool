const search = {
    successfulGETRequest: {
        status: 200,
        contentType: 'application/json;charset=UTF-8',
        headers: {
            'x-ausername': 'hue@br.com'
        },
        body: JSON.stringify({
            issues: [{
                'key': 'cms-123'
            }]
        })
    }
    //TODO: mock //https://jira.com/rest/api/2/search?fields=fields,key&jql=worklogDate=%272018-05-31%27%20AND%20worklogAuthor=currentUser()
};
module.exports = {
    getResponse: (request) => {
        //search
        if (request.url().includes('https://jira.com/rest/api/2/search?fields=fields,key&jql=worklogAuthor=currentUser()'))
            return search.successfulGETRequest
        else 
            return {
                status: 404
            };
    }
};