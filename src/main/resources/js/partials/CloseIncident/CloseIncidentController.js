/**
 * Fire the form dialog before it´s rendered by JIRA.
 */
AJS.$(function () {
    JIRA.Dialogs.closeIncidentIssue = new JIRA.FormDialog({
        id: "schedule-dialog",
        trigger: "a.issueaction-close",
        ajaxOptions: JIRA.Dialogs.getDefaultAjaxOptions,
        onSuccessfulSubmit : JIRA.Dialogs.storeCurrentIssueIdOnSucessfulSubmit,
        issueMsg : 'thanks_issue_updated'
    });
});
/**
 * Explicit load of the controller, to be used
 * into a JIRA Dialog.
 */
function closeIncidentController() {
    AJS.$(document).ready( function() {
        // initialize the url bases
        jiraService.startService();
        // important
        var jiraIssueId = AJS.$('#jiraIssueId').val();
        var issue = jiraService.Issue().getById( jiraIssueId );

        issue.done( function( issueData ){
            var user = issueData.fields.reporter.name;

            Bootstrap.start( user, function(){
                var self = this;

                var fields = jiraService.Field().getFields();

                var incidentIdCustomName = fields.incidentId ;
                var accountIdCustomName = fields.accountId ;

                Bootstrap.onView("#closeIncidentCancelButton", function(){
                    AJS.$("#closeIncidentCancelButton").click(function(){
                        JIRA.Dialogs.closeIncidentIssue.hide();
                    });
                });

                Bootstrap.onView("#closeIncidentButton", function(){

                    AJS.$("#closeIncidentButton").click(function(){
                        //User data

                        var closeReasonValue = $("input[name='closeReason']:checked").val();
                        var closeComment = AJS.$('#closeComment').val() == "" ? AJS.I18n.getText("ci.partials.close.incident.js.comment.no") : AJS.$('#closeComment').val();

                        if( incidentIdCustomName != null )
                        {
                            var incidentId =  issueData.fields[ incidentIdCustomName ];
                            var accountId = issueData.fields[ accountIdCustomName ];
                            var payload = {
                                incidents: [incidentId],
                                reason_code: closeReasonValue,
                                operation: "completed",
                                notes: closeComment,
                            };

                            if( issueData.fields["status"].name === "Closed" ){
                                payload.operation = "open";
                            }
                            var irisClose = irisService.closeIncident( accountId, payload);

                            irisClose.success( function( irisData ){
                                JIRA.Dialogs.closeIncidentIssue.hide();
                                if( issueData.fields["status"].name !== "Closed" ){
                                    JIRA.Messages.showSuccessMsg(  AJS.I18n.getText("ci.partials.close.incident.js.msg.success.closed") );
                                    jiraService.Issue().comment( jiraIssueId, AJS.I18n.getText("ci.partials.close.incident.js.msg.success.comment.closed")+" "+closeComment).done(function(){

                                        var transaction = jiraService.Issue().doTransition( jiraIssueId, 'close', AJS.I18n.getText("ci.partials.close.incident.js.msg.close.issue"));

                                        transaction.done( function(){
                                            JIRA.trigger(JIRA.Events.REFRESH_ISSUE_PAGE, [JIRA.Issue.getIssueId()]);
                                        });
                                    });
                                } else {
                                    JIRA.Messages.showSuccessMsg(  AJS.I18n.getText("ci.partials.close.incident.js.msg.success.reopen") );
                                    jiraService.Issue().comment( jiraIssueId, AJS.I18n.getText("ci.partials.close.incident.js.msg.success.comment.reopen")+" "+closeComment).done(function(){

                                        var transaction = jiraService.Issue().doTransition( jiraIssueId, 're-open', AJS.I18n.getText("ci.partials.close.incident.js.msg.success.comment.reopen"));

                                        transaction.done( function(){
                                            JIRA.trigger(JIRA.Events.REFRESH_ISSUE_PAGE, [JIRA.Issue.getIssueId()]);
                                        });
                                    });
                                }
                            });

                            irisClose.error( function( data ){
                                JIRA.Messages.showErrorMsg( AJS.I18n.getText("ci.partials.close.incident.js.msg.error.issue.not.closed") );
                            });
                        }
                    });
                });

                Bootstrap.onView("#closeMsg", function(){

                    if( incidentIdCustomName != null )
                    {
                        var incidentIdCustomName =  data.fields[ incidentIdCustomName ];
                        if( incidentIdCustomName == null ){

                            var divElement = AJS.$("#closeMsg");
                            AJS.$("#closeMsg span").remove();
                            divElement.append("<span>" + AJS.I18n.getText("ci.partials.close.incident.js.msg.isnotanincident") + '</span>');
                            AJS.$("#closeIncidentForm").hide();
                            AJS.$("#closeIncidentButton").hide();
                        }
                    }
                });

            });
        });

        issue.error( function( data ){
            JIRA.Messages.showErrorMsg( AJS.I18n.getText("ci.partials.close.incident.js.msg.error.issue.not.found") );
        });

    });
}
