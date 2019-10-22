/**
 * Fire the form dialog before it´s rendered by JIRA.
 */
AJS.$(function () {
    JIRA.Dialogs.snoozeIncidentIssue = new JIRA.FormDialog({
        id: "schedule-dialog",
        trigger: "a.issueaction-snooze",
        ajaxOptions: JIRA.Dialogs.getDefaultAjaxOptions,
        onSuccessfulSubmit : JIRA.Dialogs.storeCurrentIssueIdOnSucessfulSubmit,
        issueMsg : 'thanks_issue_updated'
    });
});
/**
 * Explicit load of the controller, to be used
 * into a JIRA Dialog.
 */
function snoozeIncidentController() {
    AJS.$(document).ready( function() {
        // initialize the url bases
        jiraService.startService();
        // important
        var jiraIssueId = AJS.$('#jiraIssueId').val();
        var issue = jiraService.Issue().getById( jiraIssueId );

        issue.done( function( data ){
            var user = data.fields.reporter.name;

            Bootstrap.start( user, function(){
                var self = this;

                var fields = jiraService.Field().getFields();

                var incidentIdCustomName = fields.incidentId ;
                var accountIdCustomName = fields.accountId ;

                Bootstrap.onView("#snoozeIncidentCancelButton", function(){
                    AJS.$("#snoozeIncidentCancelButton").click(function(){
                        JIRA.Dialogs.snoozeIncidentIssue.hide();
                    });
                });

                Bootstrap.onView("#snoozeIncidentButton", function(){

                    AJS.$("#snoozeIncidentButton").click(function(){
                        //User data
                        var snoozeUntil = AJS.$('#snoozeUntil').val();
                        var snoozeComment = AJS.$('#snoozeComment').val() == "" ? AJS.I18n.getText("ci.partials.snooze.incident.js.comment.no") : AJS.$('#snoozeComment').val();

                        var expirationOptions = {
                            "tomorrow": 86400,
                            "two_days": 172800,
                            "next_week": 604800,
                            "two_weeks": 1209600
                        };

                        var expirationTS = AUIUtils.todayToTimestamp() + ( expirationOptions[snoozeUntil] * 1000 );

                        if( incidentIdCustomName != null )
                        {
                            var incidentId =  data.fields[ incidentIdCustomName ];
                            var accountId = data.fields[ accountIdCustomName ];
                            var payload = {
                                incident: incidentId,
                                period_ms: expirationTS,
                                reason_code: this.snoozeUntil,
                                notes: this.snoozeComment,
                            };
                            var irisSnooze = irisService.snoozeIncident( accountId, payload);

                            irisSnooze.success( function( data ){
                                JIRA.Dialogs.snoozeIncidentIssue.hide();
                                JIRA.Messages.showSuccessMsg(  AJS.I18n.getText("ci.partials.snooze.incident.js.msg.success.snoozed") );
                                jiraService.Issue().comment( jiraIssueId, AJS.I18n.getText("ci.partials.snooze.incident.js.msg.success.comment.snoozed")+" "+snoozeComment).done(function(){
                                    var transaction = jiraService.Issue().doTransition( jiraIssueId, 'close', AJS.I18n.getText("ci.partials.snooze.incident.js.msg.close.issue"));

                                    transaction.done( function(){
                                        JIRA.trigger(JIRA.Events.REFRESH_ISSUE_PAGE, [JIRA.Issue.getIssueId()]);
                                    });
                                });
                            });

                            irisSnooze.error( function( data ){
                                JIRA.Messages.showErrorMsg( AJS.I18n.getText("ci.partials.snooze.incident.js.msg.error.issue.not.snoozed") );
                            });
                        }
                    });
                });
                //loading
                Bootstrap.onView("#snoozeMsg", function(){

                    if( incidentIdCustomName != null )
                    {
                        var incidentIdCustomName =  data.fields[ incidentIdCustomName ];
                        if( incidentIdCustomName == null ){

                            var divElement = AJS.$("#snoozeMsg");
                            AJS.$("#snoozeMsg span").remove();
                            divElement.append("<span>" + AJS.I18n.getText("ci.partials.snooze.incident.js.msg.isnotanincident") + '</span>');
                            AJS.$("#snoozeIncidentForm").hide();
                            AJS.$("#snoozeIncidentButton").hide();
                        }
                    }
                });
            });
        });

        issue.error( function( data ){
            JIRA.Messages.showErrorMsg( AJS.I18n.getText("ci.partials.snooze.incident.js.msg.error.issue.not.found") );
        });

    });
}
