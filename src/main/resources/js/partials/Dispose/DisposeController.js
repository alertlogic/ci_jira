/**
 * Fire the form dialog before it´s rendered by JIRA.
 */
AJS.$(function () {
    JIRA.Dialogs.disposeIssue = new JIRA.FormDialog({
        id: "schedule-dialog",
        trigger: "a.issueaction-dispose",
        ajaxOptions: JIRA.Dialogs.getDefaultAjaxOptions,
        onSuccessfulSubmit : JIRA.Dialogs.storeCurrentIssueIdOnSucessfulSubmit,
        issueMsg : 'thanks_issue_updated'
    });
});
/**
 * Explicit load of the controller, to be used
 * into a JIRA Dialog.
 */
function disposeController() {
    AJS.$(document).ready( function() {
        var jiraIssueId = AJS.$('#jiraIssueId').val();
        var issue = jiraService.Issue().getById( jiraIssueId );

        issue.done( function( data ){
            var user = data.fields.reporter.name;

            Bootstrap.start( user, function(){
                var self = this;

                var fields = jiraService.Field().getFields();

                var remediationItemCustomName = fields.remediationItem ;

                Bootstrap.onView("#disposeCancelButton", function(){
                    AJS.$("#disposeCancelButton").click(function(){
                        JIRA.Dialogs.disposeIssue.hide();
                    });
                });

                Bootstrap.onView("#disposeRemediationButton", function(){

                    AJS.$("#disposeRemediationButton").click(function(){
                        //User data
                        var disposeReason = AJS.$('#disposeReason').val();
                        var disposeExpiration = AJS.$('#disposeUntil').val();
                        var disposeComment = AJS.$('#disposeComment').val() == "" ? AJS.I18n.getText("ci.partials.dispose.js.comment.no") : AJS.$('#disposeComment').val();

                        var expirationOptions = {
                            "none": 0,
                            "tomorrow": 86400,
                            "week": 604800,
                            "month": 2592000
                        };
                        var expirationTS = AUIUtils.todayToTimestamp() + ( expirationOptions[disposeExpiration] * 1000 );

                        if( remediationItemCustomName != null )
                        {
                            var remediationItem =  data.fields[ remediationItemCustomName ];
                            var environment = remediationsService.getEnvironmentFromRemediationItem( remediationItem );
                            var dispose = remediationsService.disposeRemediation( environment, remediationItem, disposeReason, expirationTS, disposeComment);

                            dispose.success( function( data ){
                                JIRA.Dialogs.disposeIssue.hide();
                                JIRA.Messages.showSuccessMsg(  AJS.I18n.getText("ci.partials.dispose.js.msg.success.disposed") );
                                jiraService.Issue().comment( jiraIssueId, AJS.I18n.getText("ci.partials.dispose.js.msg.success.comment.disposed")+" "+disposeComment).done(function(){
                                    var transaction = jiraService.Issue().doTransition( jiraIssueId, 'close', AJS.I18n.getText("ci.partials.dispose.js.msg.close.issue"));

                                    transaction.done( function(){
                                        JIRA.trigger(JIRA.Events.REFRESH_ISSUE_PAGE, [JIRA.Issue.getIssueId()]);
                                    });
                                });
                            });

                            dispose.error( function( data ){
                                JIRA.Messages.showErrorMsg( AJS.I18n.getText("ci.partials.dispose.js.msg.error.issue.not.disposed") );
                            });
                        }
                    });
                });
                //loading
                Bootstrap.onView("#disposeMsg", function(){

                    if( remediationItemCustomName != null )
                    {
                        var remediationItem =  data.fields[ remediationItemCustomName ];
                        if( remediationItem == null ){

                            var divElement = AJS.$("#disposeMsg");
                            AJS.$("#disposeMsg span").remove();
                            divElement.append("<span>" + AJS.I18n.getText("ci.partials.dispose.js.msg.isnotaremediation") + '</span>');
                            AJS.$("#disposeForm").hide();
                            AJS.$("#disposeRemediationButton").hide();
                        }
                    }
                });
            });
        });

        issue.error( function( data ){
            JIRA.Messages.showErrorMsg( AJS.I18n.getText("ci.partials.dispose.js.msg.error.issue.not.found") );
        });

    });
}
