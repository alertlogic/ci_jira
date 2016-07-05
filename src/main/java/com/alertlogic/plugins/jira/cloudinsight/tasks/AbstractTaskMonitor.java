package com.alertlogic.plugins.jira.cloudinsight.tasks;

import java.util.Date;

import com.alertlogic.plugins.jira.cloudinsight.service.AIMSService;
import com.alertlogic.plugins.jira.cloudinsight.service.CredentialService;
import com.alertlogic.plugins.jira.cloudinsight.service.JIRAService;
import com.alertlogic.plugins.jira.cloudinsight.service.PluginConfigService;
import com.alertlogic.plugins.jira.cloudinsight.service.RuleConfigService;
import com.alertlogic.plugins.jira.cloudinsight.util.RestUtil;
import com.atlassian.sal.api.message.I18nResolver;
import com.atlassian.sal.api.scheduling.PluginScheduler;

/**
 * Basic attributes template for a Scheduled Task
 */
public abstract class AbstractTaskMonitor {

    //References that could be required for a scheduled task
	protected PluginConfigService pluginConfigService;
	protected AIMSService aimsService;
	protected RuleConfigService ruleConfigService;
	protected JIRAService jiraService;
	protected I18nResolver i18nResolver;
	protected PluginScheduler pluginScheduler;
	protected CredentialService credentialService;
	protected RestUtil restUtilService;

    //Attributes that could change the implementation class
    protected long interval = 62000L;    // default job interval (1 minute)
    protected Date lastRun = null;

    public AbstractTaskMonitor(
		PluginScheduler pluginScheduler,
		PluginConfigService pluginConfigService,
		AIMSService aimsService,
		RuleConfigService ruleConfigService,
		JIRAService jiraService,
		I18nResolver i18nResolver,
		CredentialService credentialService,
		RestUtil restUtilService)
    {
        this.setPluginScheduler(pluginScheduler);
        this.pluginConfigService = pluginConfigService;
        this.aimsService = aimsService;
        this.ruleConfigService = ruleConfigService;
        this.jiraService = jiraService;
        this.i18nResolver = i18nResolver;
        this.credentialService = credentialService;
        this.restUtilService = restUtilService;
    }

    public PluginConfigService getPluginConfigService() {
		return pluginConfigService;
	}

	public AIMSService getAIMSService() {
		return aimsService;
	}

	public RuleConfigService getRuleConfigService() {
		return ruleConfigService;
	}

	public JIRAService getJIRAService() {
		return jiraService;
	}

	public CredentialService getCredentialService() {
		return credentialService;
	}

    public void setLastRun(Date lastRun) {
        this.lastRun = lastRun;
    }

    public Date getLastRun() {
    	return this.lastRun;
    }

	public I18nResolver getI18nResolver() {
		return i18nResolver;
	}

	public void setI18nResolver(I18nResolver i18nResolver) {
		this.i18nResolver = i18nResolver;
	}

	public PluginScheduler getPluginScheduler() {
		return pluginScheduler;
	}

	public void setPluginScheduler(PluginScheduler pluginScheduler) {
		this.pluginScheduler = pluginScheduler;
	}

	public RestUtil getRestUtil() {
		return restUtilService;
	}
}