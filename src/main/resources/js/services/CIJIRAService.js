/**
 * Author: MVS
 * Management the conections to the JIRA API.
 * the api url that we are consuming is https://docs.atlassian.com/jira/REST/latest/
 */
var CIJIRAService = function() {
    var self = this;

    var urlBaseHost;
    var urlBase;
    var urlBaseServlets;

    /**
     * Start the service calling required
     * init functions.
     */
    self.startService = function() {
        self.initUrlBaseHost();
        self.registerFilters();
    };

    /**
     * Inits the url base host variables for the service.
     */
    self.initUrlBaseHost = function() {
        urlBaseHost     = AJS.params.baseURL;
        urlBase         = urlBaseHost + "/rest/api/2";
        urlBaseServlets = urlBaseHost + "/plugins/servlet/";
    };

    /**
     * Authenticates using the proxy servlet
     */
    self.AuthProxy = function( user ) {

        var urlProxyServlet = urlBaseServlets + "proxyauthservlet";
        var data = {
            user: user
        };

        return jQuery.ajax({
            type: "POST",
            url: urlProxyServlet,
            dataType: 'json',
            data: data
        });
    };

    /**
     * Authenticates using the proxy servlet
     */
    self.Configuration = function() {
        var urlProxyServlet = urlBaseServlets + "pluginconfiguration";

        return {
            /**
             * Get the credential configured for the user logged
             */
            get: function() {
                return jQuery.ajax({
                    type: "POST",
                    url: urlProxyServlet,
                    dataType: 'json'
                });
            },

            /**
             * Save the configuration of credentials to login cloud insight
             * @param idCredential        id credential
             **/
            save: function( idCredential ) {
                var data = {
                    "idCredential": idCredential
                };
                return jQuery.ajax({
                    type: "PUT",
                    url: urlProxyServlet,
                    dataType: 'json',
                    data: JSON.stringify(data)
                });
            },

            /**
             * Delete the configuration stored
             **/
            deleteConfig: function() {
                return jQuery.ajax({
                    type: "DELETE",
                    url: urlProxyServlet,
                    dataType: 'json'
                });
            }
        };
    };

    /**
     * Configure project using the servlet
     * @param projectKey         projectKey to configure
     */
    self.ConfigureProject = function( projectKey ) {
        var urlServlet = urlBaseServlets + "projectsetup"+"?project="+projectKey;

        return jQuery.ajax({
            type: "POST",
            url: urlServlet,
            dataType: 'json'
        });
    };

    /**
     * Return the issue manager
     */
    self.Issue = function() {

        return {

            /**
             * Get a List of Issues
             **/
            getAll: function() {
                return jQuery.ajax({
                    type: "GET",
                    url: urlBase + '/search',
                    dataType: "json",
                    contentType: "application/json"
                });
            },

            /**
             * Get issue by id or key
             * @param issueId
             */
            getById: function( issueId ) {
                return jQuery.ajax({
                    type: "GET",
                    url: urlBase + '/issue/' + issueId,
                    dataType: "json",
                    contentType: "application/json"
                });
            },

            /**
             *Validate that the project have the customs fields
             * @param issue id or key
             * @param status to do the transition
             * @param comment
             */
            doTransition: function( issue, status , comment) {
                var transaction = {
                    "close" : 2,
                    "re-open" : 3
                };

                var parameters = {
                    "transition": {
                        "id": transaction[ status ]
                    },
                     "update": {
                        "comment": [
                            {
                                "add": {
                                    "body": comment
                                }
                            }
                        ]
                    }
                };

                return jQuery.ajax({
                    type: "POST",
                    url: urlBase + '/issue/' + issue + '/transitions?expand=transitions.fields',
                    dataType: "json",
                    contentType: "application/json",
                    data: JSON.stringify( parameters )
                });
            },

            /**
             * POST send to create a issue
             * @param summary
             * @param description
             * @param projectKey
             * @param remediationItem value of remediation item key on CI
             * @param remediationId value of remediation key on CI
             * @param jiraGroup
             * @param issueTypeId
             * @param level to define the priority
             **/
            create: function( summary, description, projectKey, remediationItem, remediationId, jiraGroup, issueTypeId, level ) {

                var fields = self.Field().getFields();

                var remediationItemCustomName = fields.remediationItem;
                var remediationIdCustomName = fields.remediationId;
                var jiraGroupCustomName = fields.group ;
                var priorityId = self.Priority().getPriorities()[level];

                if( remediationItemCustomName != null  && remediationIdCustomName != null && jiraGroupCustomName != null)
                {
                    var issue = {
                        "fields": {
                            "project":{ "id": projectKey },
                            "summary": summary,
                            "description": description,
                            "issuetype": { "id": issueTypeId },
                            "priority": { "id": priorityId }
                        }
                    };

                    issue.fields[ remediationItemCustomName ] = remediationItem;
                    issue.fields[ remediationIdCustomName ] = remediationId;
                    if (jiraGroup) {
                        issue.fields[ jiraGroupCustomName ] = { "name": jiraGroup };
                    }

                    return jQuery.ajax({
                        type: "POST",
                        url: urlBase + '/issue',
                        dataType: "json",
                        contentType: "application/json",
                        data: JSON.stringify( issue )
                    });

                }
            },

            /**
             * Add a comment to issue
             * @param issue
             * @param comment
             */
            comment: function( issue, comment ) {
                /*TODO review the log because somthing is causing error 500*/
                var data = {
                    "body": comment
                };
                return jQuery.ajax({
                    type: "POST",
                    url: urlBase + '/issue/'+issue+"/comment",
                    dataType: "json",
                    contentType: "application/json",
                    data: JSON.stringify( data )
                });
            }
        };
    };

    self.Field = function() {
        return {
            /**
            * Review if the customs field are stored in the local storage
            * if not store the custom fields in local storage
            */
            configurate: function() {
                if( storageService.getKey("field-remediation-item" ) == null ||
                    storageService.getKey("field-remediation-id" ) == null ||
                    storageService.getKey("field-group" ) == null
                ){
                    self.Field().getAll().done( function( fields ) {

                        var fieldRemediationItem = self.Field().getIdByName( AJS.I18n.getText("ci.constant.custom.remediationItem"), fields);
                        var fieldRemediationId = self.Field().getIdByName( AJS.I18n.getText("ci.constant.custom.remediationId"), fields);
                        var fieldGroupAssigned = self.Field().getIdByName( AJS.I18n.getText("ci.constant.custom.groupAssigned"), fields);

                        if(fieldRemediationItem != null && fieldRemediationId != null)
                        {
                            storageService.storeKey("field-remediation-id", fieldRemediationId);
                            storageService.storeKey("field-remediation-item", fieldRemediationItem);
                            storageService.storeKey("field-group", fieldGroupAssigned);
                        }
                    });
                }
            },
            /**
            * get fields
            */
            getFields: function() {
                return {
                    "remediationId": storageService.getKey("field-remediation-id" ),
                    "remediationItem": storageService.getKey("field-remediation-item" ),
                    "group": storageService.getKey("field-group" )
                };
            },

            /**
            * get all fields
            */
            getAll: function() {
                return jQuery.ajax({
                    type: "GET",
                    url: urlBase + '/field',
                    dataType: "json",
                    contentType: "application/json"
                });
            },

            /**
            * Return the field id of a custom field give a name
            */
            getIdByName: function( name , data) {

                for(var position in data) {
                    if( data[ position ].name == name) {
                        return data[ position ].id;
                    }
                }
                return null;
            }
        };
    };

    self.Project = function() {
        return {

            /**
             * GET Get a List of projects
             **/
            getAll: function() {
                return jQuery.ajax({
                    type: "GET",
                    url: urlBase + '/project',
                    dataType: "json",
                    contentType: "application/json"
                });
            },
            /**
             * Get the project information
             * @return {String} full url for the project info
             */
            getProjectInfo: function( infoUrl ) {
                return jQuery.ajax({
                    type: "GET",
                    url: infoUrl,
                    dataType: "json",
                    contentType: "application/json"
                });
            }
        };
    };

    self.IssueType = function() {
        return {

            /**
             * GET Get a List of projects
             **/
            getAll: function() {
                return jQuery.ajax({
                    type: "GET",
                    url: urlBase + '/issuetype',
                    dataType: "json",
                    contentType: "application/json"
                });
            }
        };
    };

    self.Groups = function() {
        return {

            /**
             * GET Get a List of groups
             **/
            getAll: function() {
                return jQuery.ajax({
                    type: "GET",
                    url: urlBaseHost + "/plugins/servlet/groupsservlet",
                    dataType: "json",
                    contentType: "application/json"
                });
            }
        };
    };

    /**
     * Return the priority level to create a issue
     */
    self.Priority = function () {
        return {
            /**
             * Get a jira priority by position
             */
            getPriorityByPosition: function( prioritiesJira, level ) {
                //search and remove if exist the priority blocker.
                for(var i = 0; i < prioritiesJira.length; i++ ){
                    if( prioritiesJira[i].name === "Blocker" ){
                        prioritiesJira.splice( i, 1 );
                    }
                }

                if( level < prioritiesJira.length ){
                    return prioritiesJira[ level ].id;
                }
                else{
                    //validate the amount of priorities and show a message
                    JIRA.Messages.showWarningMsg(
                        AJS.I18n.getText("ci.services.jiraservice.js.msg.error.amount")
                    );
                    return prioritiesJira[ prioritiesJira.length -1].id;
                }
            },
            /**
             * GET Get a List of projects
             **/
            getAll: function() {
                return jQuery.ajax({
                    type: "GET",
                    url: urlBase + '/priority',
                    dataType: "json",
                    contentType: "application/json"
                });
            },
            /**
            * Get priorities
            */
            getPriorities: function() {
                return {
                    "3": storageService.getKey( "priority-high" ),
                    "2": storageService.getKey( "priority-medium" ),
                    "1": storageService.getKey( "priority-low" ),
                    "0": storageService.getKey( "priority-info" )
                };
            }
        };
    };


    /**
    * Explore the customs fields and priorities then store the names that we need.
    */
    self.registerFilters = function(){
        self.Field().configurate();

        self.Priority().getAll().done( function( priorities ){

            var high = self.Priority().getPriorityByPosition( priorities, 0);
            var medium = self.Priority().getPriorityByPosition( priorities, 1);
            var low = self.Priority().getPriorityByPosition( priorities, 2);
            var info = self.Priority().getPriorityByPosition( priorities, 3);

            storageService.storeKey( "priority-high", high );
            storageService.storeKey( "priority-medium", medium );
            storageService.storeKey( "priority-low", low );
            storageService.storeKey( "priority-info", info );

            if( high == null || medium == null || low == null || info == null){
                JIRA.Messages.showWarningMsg(
                    AJS.I18n.getText("ci.services.jiraservice.js.msg.error.priorities")
                );
            }
        });
    };
};
/**
 * Creates the service instance.
 */
var jiraService =  new CIJIRAService();