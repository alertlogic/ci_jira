package com.alertlogic.plugins.jira.cloudinsight.conditions;

import com.alertlogic.plugins.jira.cloudinsight.service.PluginConfigService;
import com.atlassian.crowd.embedded.api.User;
import com.atlassian.jira.plugin.webfragment.conditions.AbstractJiraCondition;
import com.atlassian.jira.plugin.webfragment.model.JiraHelper;

/**
 * Condition for web fragments, used to check if
 * the plugin's configuration has been entered.
 */
@SuppressWarnings("deprecation")
public class CloudInsightPluginHasConfigCondition extends AbstractJiraCondition{

	public PluginConfigService pluginConfigService;

	public CloudInsightPluginHasConfigCondition( PluginConfigService pluginConfigService )
	{
		this.pluginConfigService = pluginConfigService;
	}

	@Override
	public boolean shouldDisplay(User arg0, JiraHelper arg1) {
		return pluginConfigService.hasConfiguration();
	}
}
