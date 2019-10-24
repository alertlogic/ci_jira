/**
 * Explicit load of the controller, to be used
 * into a JIRA Panel.
 */
function incidentStatusController( user ) {
    AJS.$(document).ready(
        function() {
            Bootstrap.start( user, function(){
                var self = this;

                var scope = {
                    accountId:'',
                    accountName: '',
                    incidentStatus : '',
                    incidentId: '',
                    issueStatus : '',
                    issueId: '',
                    issueUpdated: ''
                };

                /** Take an incident and extract the correct status */
                self.getCurrentStatus = function( incidentData ){
                    var state ="open";
                    if( incidentData.snooze_status.snoozed === true){
                        state ="snoozed";
                    } else {
                        if( incidentData.customer_status.status === "completed"){
                            state ="closed";
                        }
                    }
                    return state;
                }

                /**
                 * Get the incident status
                 * @param  {String}   jiraIssueId The Jira issue id
                 */
                self.getIncidentStatus = function( accountId, incidentId ){
                    var incident= irisService.getIncidentById( accountId, incidentId );

                    incident.done(function(incidentData){
                        scope.accountName = incidentData.customer;
                        scope.incidentStatus = self.getCurrentStatus(incidentData);
                        self.printHtml();
                    });
                };

                /**
                 * Print the status on html
                 */
                self.printHtml = function() {
                    var panelElement = AJS.$("#incidentStatusPanel");
                    panelElement.empty();
                    if( scope.incidentStatus ){
                        panelElement.append("Incident Status : <span class='aui-lozenge aui-lozenge-current'>" + scope.incidentStatus + '</span>');
                    }
                    var incidentAccountElement = AJS.$("#incidentAccount");
                    incidentAccountElement.empty();
                    if( scope.accountName ){
                        incidentAccountElement.append("Account Name : <span>" + scope.accountName + '</span>');
                    }
                };

                /**
                 * Review that the issue has the minimun information to search in CI the remediation
                 * @param  {issue}   issue
                 */
                self.isValidIssue = function( issueData ) {

                    //validate that the custom field exist
                    var fields = jiraService.Field().getFields();
                    var incidentIdCustomName = fields.incidentId;
                    var accountIdCustomName = fields.accountId;

                    if( incidentIdCustomName == null  || accountIdCustomName == null)
                    {
                        return false;
                    }

                    //validate that the issue have a custom field
                    if( !issueData.fields.hasOwnProperty( incidentIdCustomName ) || !issueData.fields.hasOwnProperty( accountIdCustomName )) {
                        return false;
                    }

                    //validate that incident item has a value
                    if( issueData.fields[ incidentIdCustomName ] == null || issueData.fields[ accountIdCustomName ] == null ) {
                        return false;
                    }

                    scope.incidentId = issueData.fields[ incidentIdCustomName ];
                    scope.accountId = issueData.fields[ accountIdCustomName ];

                    return true;
                }

                /**
                 * Load the status of a remediation,
                 * @param  {String}   jiraIssueId The Jira issue id
                 */
                self.loadIncidentStatus = function( jiraIssueId ) {
                    scope.issueId = jiraIssueId;

                    var issue = jiraService.Issue().getById( jiraIssueId );

                    issue.success(function( issueData ) {
                        scope.issueStatus = issueData.fields.status.name;

                        scope.issueUpdated = issueData.fields.updated;

                        if( self.isValidIssue( issueData ) )
                        {
                            self.getIncidentStatus( scope.accountId, scope.incidentId );

                            //Verify status every 4 seconds.
                            setTimeout(function(){
                                loadIncidentStatus( globalIssueID );
                            }, configService.timeRefresh );
                        }
                        else{
                            var panelElement = AJS.$("#remediationStatusMessage");
                            //remove span element if this exist
                             var spanElement = AJS.$("#remediationStatusMessage span");
                            spanElement.remove();
                            panelElement.append("<span>" + AJS.I18n.getText("ci.partials.statuspanel.js.msg.isnotaremediation") + '</span>');
                        }
                    });

                    issue.error(function() {
                        JIRA.Messages.showWarningMsg( AJS.I18n.getText("ci.partials.statuspanel.js.msg.issuenotexist") );
                    });

                };

                if (typeof globalIssueID !== 'undefined') {
                    loadIncidentStatus( globalIssueID );
                }

            });
        }
    );
}