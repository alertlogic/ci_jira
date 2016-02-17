package com.alertlogic.plugins.jira.cloudinsight.conditions;

import com.alertlogic.plugins.jira.cloudinsight.service.PluginConfigService;
import com.atlassian.jira.plugin.webfragment.conditions.AbstractWebCondition;
import com.atlassian.jira.plugin.webfragment.model.JiraHelper;
import com.atlassian.jira.user.ApplicationUser;

/**
 * Condition for web fragments, used to check if
 * the plugin's configuration has been entered.
 */
public class CloudInsightPluginHasConfigCondition extends AbstractWebCondition{

	public PluginConfigService pluginConfigService;

	public CloudInsightPluginHasConfigCondition( PluginConfigService pluginConfigService )
	{
		this.pluginConfigService = pluginConfigService;
	}

	@Override
	public boolean shouldDisplay(ApplicationUser arg0, JiraHelper arg1) {
		return pluginConfigService.hasConfiguration();
	}
}
