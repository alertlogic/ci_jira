package com.alertlogic.plugins.jira.cloudinsight.conditions;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.alertlogic.plugins.jira.cloudinsight.service.ScreenConfigService;
import com.atlassian.jira.issue.Issue;
import com.atlassian.jira.issue.fields.CustomField;
import com.atlassian.jira.issue.issuetype.IssueType;
import com.atlassian.jira.plugin.webfragment.conditions.AbstractIssueWebCondition;
import com.atlassian.jira.plugin.webfragment.model.JiraHelper;
import com.atlassian.jira.user.ApplicationUser;

/**
 * Verifies if the issue web item is part of a Incidents Issue Type
 * this allow the correct display´s of items.
 */
public class IncidentsIssueCondition extends AbstractIssueWebCondition {

    private static final Logger log = LoggerFactory.getLogger(IncidentsIssueCondition.class);
    private ScreenConfigService screenConfigService;

    public IncidentsIssueCondition(ScreenConfigService  screenConfigService) {
        this.screenConfigService = screenConfigService;
    }

    @Override
    public boolean shouldDisplay(ApplicationUser applicationUser, Issue issue, JiraHelper jiraHelper) {
        try {
            IssueType incidentsIssueType = screenConfigService.getIssueTypeCI( ScreenConfigService.incidentsProduct);
            if (incidentsIssueType != null) {
                //Is this issue an incidents issue type?
                if (issue.getIssueTypeId().equals(incidentsIssueType.getId())){
                    //Bring custom field names from properties.
                    screenConfigService.assigValuesToVariables();

                    //Validates that this issue has the required custom fields.
                    CustomField customField = screenConfigService.getIncidentCustomFieldIfExists();
                    if ( customField == null ) {
                        return false;
                    }
                    //OK this is a valid incident issue, show web components and incident stuff for this issue.
                    return true;
                }
            }
        } catch (Exception e) {
            log.error(e.getMessage());
        }

        return false;
    }
}
