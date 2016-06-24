package com.alertlogic.plugins.jira.cloudinsight.conditions;

import java.util.Collection;
import java.util.List;

import com.alertlogic.plugins.jira.cloudinsight.service.JIRAService;
import com.alertlogic.plugins.jira.cloudinsight.service.PermissionService;
import com.atlassian.crowd.embedded.api.Group;
import com.atlassian.jira.plugin.webfragment.conditions.AbstractWebCondition;
import com.atlassian.jira.plugin.webfragment.model.JiraHelper;
import com.atlassian.jira.user.ApplicationUser;

/**
 * Condition for web fragments, used to check if
 * the user belong to a group with permission to dispose
 */
public class CloudInsightUserHasPermissionCondition extends AbstractWebCondition{

	private JIRAService jiraService;
	private PermissionService permissionService;

	public CloudInsightUserHasPermissionCondition(JIRAService  jiraService, PermissionService permissionService) {
		this.jiraService = jiraService;
		this.permissionService = permissionService;
	}

	@Override
	public boolean shouldDisplay(ApplicationUser appUser, JiraHelper jiraHelper) {

		Collection<Group> groupsForUser = jiraService.getGroupsForUser( appUser.getUsername() );
		List<String> permissionsList = permissionService.getPermmisionsList() ;

		//by default if in the instance has not configured any permission everybody has permission.
		if( permissionsList.size() == 0 ){
			return true;
		}
		//search if one of the groups for the user are configured with permissions
		for( Group group: groupsForUser ){
			if( permissionsList.indexOf( group.getName() ) >= 0 ){
				return true;
			}
		}
		return false;
	}
}
