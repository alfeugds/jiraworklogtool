const defaultSuccessfulResponse = {
    status: 200,
    contentType: 'application/json;charset=UTF-8',
    headers: {
        // 'x-ausername': 'hue@br.com',
        'x-aaccountid': 'some:token'
    }
}
const defaultFailedResponse = {
    status: 404
}
const search = {
    successfulGETRequestWithTwoItems: Object.assign({
        body: JSON.stringify({
            issues: [{
                'key': 'CMS-123'
            },{
                'key': 'CMS-456'
            }]
        })
    }, defaultSuccessfulResponse)
    //TODO: mock //https://jira.com/rest/api/2/search?fields=fields,key&jql=worklogDate=%272018-01-01%27%20AND%20worklogAuthor=currentUser()
};
const items = {
    "CMS-123": {
        "worklogs":[  
            {  
                "author":{
                    // "key":"hue@br.com",
                    "accountId": "some:token"
                },
                "comment":"tech onboarding",
                "started":"2018-01-01T06:00:00.000+0000",
                "timeSpent":"1h 50m",
                "id":"55829"
            }
        ]
    },
    "CMS-456": {
        "worklogs":[  
            {  
                "author":{
                    // "key":"hue@br.com",
                    "accountId": "some:token"
                },
                "comment":"tech onboarding 2",
                "started":"2018-01-01T06:00:00.000+0000",
                "timeSpent":"2h 50m",
                "id":"45645"
            }
        ]
    }
}

module.exports = {
    getResponse: (request) => {
        if(!request.url().includes('https://jira.com/'))
            return defaultFailedResponse;
        //search
        if (request.url().includes('rest/api/2/search?fields=fields,key&jql='))
            return search.successfulGETRequestWithTwoItems;

        let match;
        if(match = request.url().match('rest/api/2/issue/([^/]+)/worklog')){
            let item = match[1]
            return Object.assign( {body: JSON.stringify(items[item])}, defaultSuccessfulResponse); 
        }
        
        return {
            status: 404
        };
    }
};