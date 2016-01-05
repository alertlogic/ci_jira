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
 * Verifies if the issue web item is part of a Cloud Insight Issue Type
 * this allow the correct display´s of items.
 */
public class CloudInsightIssueCondition extends AbstractIssueWebCondition {

	private static final Logger log = LoggerFactory.getLogger(CloudInsightIssueCondition.class);
	private ScreenConfigService screenConfigService;

	public CloudInsightIssueCondition(ScreenConfigService  screenConfigService) {
		this.screenConfigService = screenConfigService;
	}

	@Override
	public boolean shouldDisplay(ApplicationUser arg0, Issue arg1, JiraHelper arg2) {
		try {
			IssueType issueTypeCI = screenConfigService.getIssueTypeCI();
			if (issueTypeCI != null) {
				//Is this issue an CI issue type?
				if (arg1.getIssueTypeId().equals(issueTypeCI.getId())){
					//Bring custom field names from properties.
					screenConfigService.assigValuesToVariables();

					//Validates that this issue has the required custom fields.
					CustomField customField = screenConfigService.getRemediationCustomFieldIfExists();
					if ( customField == null ) {
						return false;
					}
					//OK this is a valid CI issue, show web components and CI stuff for this issue.
					return true;
				}
			}
		} catch (Exception e) {
			log.error(e.getMessage());
		}

		return false;
	}
}
