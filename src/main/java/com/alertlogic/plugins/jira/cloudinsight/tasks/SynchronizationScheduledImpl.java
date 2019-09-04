package com.alertlogic.plugins.jira.cloudinsight.tasks;

import java.util.Date;
import java.util.HashMap;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.alertlogic.plugins.jira.cloudinsight.service.AIMSService;
import com.alertlogic.plugins.jira.cloudinsight.service.CredentialService;
import com.alertlogic.plugins.jira.cloudinsight.service.JIRAService;
import com.alertlogic.plugins.jira.cloudinsight.service.PluginConfigService;
import com.alertlogic.plugins.jira.cloudinsight.service.RuleConfigService;
import com.alertlogic.plugins.jira.cloudinsight.util.RestUtil;
import com.atlassian.sal.api.lifecycle.LifecycleAware;
import com.atlassian.sal.api.message.I18nResolver;
import com.atlassian.sal.api.scheduling.PluginScheduler;

/**
 * Schedules the CI Add-on sync task.
 */
public class SynchronizationScheduledImpl extends AbstractTaskMonitor implements LifecycleAware {

	private final Logger logger = LoggerFactory.getLogger(SynchronizationScheduledImpl.class);

	public static final String KEY = SynchronizationScheduledImpl.class.getName() + ":instance";
    public static final String JOB_NAME = SynchronizationScheduledImpl.class.getName() + ":job";

	public SynchronizationScheduledImpl(
			PluginScheduler pluginScheduler,
			PluginConfigService pluginConfigService,
			AIMSService aimsService,
			RuleConfigService ruleConfigService,
			JIRAService jiraService,
			I18nResolver i18nResolver,
			CredentialService credentialService,
			RestUtil restUtilService)
	{
		super(pluginScheduler, pluginConfigService, aimsService,ruleConfigService, jiraService, i18nResolver, credentialService, restUtilService);
	}

	// declared by LifecycleAware
    public void onStart() {
        reschedule(interval);
    }

    @SuppressWarnings("serial")
	public void reschedule(long interval) {

        this.interval = interval;

        pluginScheduler.scheduleJob(
                JOB_NAME,                  		// unique name of the job
                SynchronizationTasks.class, 	// class of the job
                new HashMap<String,Object>() {{
                    put(KEY, SynchronizationScheduledImpl.this);
                }},                         	// data that needs to be passed to the job
                new Date(),                 	// the time the job is to start
                interval);            			// interval between repeats, in milliseconds

        logger.info(String.format(JOB_NAME+":: Scheduled to run every %dms, the first execution will be ignored.", interval));
    }

	@Override
	public void onStop() {
		// TODO Auto-generated method stub
		pluginScheduler.unscheduleJob(JOB_NAME);
	}
}
