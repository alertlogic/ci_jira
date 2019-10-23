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
            var tomorrow = moment().add(1, 'days').hour(9).minute(0).second(0);
            var two_days = moment().add(2, 'days').hour(9).minute(0).second(0);
            var next_week = moment().weekday(8).hour(9).minute(0).second(0);
            var two_weeks = moment().weekday(15).hour(9).minute(0).second(0);

            Bootstrap.start( user, function(){
                var self = this;

                var snoozeOptions = {
                    // immediately: {description: "now, and cancel the snooze ", date_string:"" },
                    tomorrow: {description: AJS.I18n.getText('ci.partials.snooze.incident.vm.until.tomorrow'), date_string: tomorrow.format("H a") },
                    two_days: {description: AJS.I18n.getText('ci.partials.snooze.incident.vm.until.two_days') , date_string: two_days.format("dddd Do") },
                    next_week: {description: AJS.I18n.getText('ci.partials.snooze.incident.vm.until.next_week'), date_string: next_week.format("dddd Do") },
                    two_weeks: {description: AJS.I18n.getText('ci.partials.snooze.incident.vm.until.two_weeks'), date_string: two_weeks.format("dddd Do") },
                };

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
                            "tomorrow": tomorrow,
                            "two_days": two_days,
                            "next_week": next_week,
                            "two_weeks": two_weeks
                        };

                        var expirationTS =  ( expirationOptions[snoozeUntil].valueOf() - moment().valueOf());

                        if( incidentIdCustomName != null )
                        {
                            var incidentId =  data.fields[ incidentIdCustomName ];
                            var accountId = data.fields[ accountIdCustomName ];
                            var payload = {
                                incidents: [incidentId],
                                period_ms: expirationTS,
                                reason_code: snoozeUntil,
                                notes: snoozeComment,
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

                self.loadOptions = function() {
                    var selectElement = AJS.$("#snoozeUntil");
                    //clearSelect;
                    AUIUtils.addSelectOption( selectElement, 'tomorrow', snoozeOptions.tomorrow.description + snoozeOptions.tomorrow.date_string);
                    AUIUtils.addSelectOption( selectElement, 'two_days', snoozeOptions.two_days.description + snoozeOptions.two_days.date_string);
                    AUIUtils.addSelectOption( selectElement, 'next_week', snoozeOptions.next_week.description + snoozeOptions.next_week.date_string);
                    AUIUtils.addSelectOption( selectElement, 'two_weeks', snoozeOptions.two_weeks.description + snoozeOptions.two_weeks.date_string);
                    //selectElement.select('val','tomorrow');
                    selectElement.val($("#snoozeUntil option:first").val());
                }
                loadOptions();
            });
        });

        issue.error( function( data ){
            JIRA.Messages.showErrorMsg( AJS.I18n.getText("ci.partials.snooze.incident.js.msg.error.issue.not.found") );
        });

    });
}
