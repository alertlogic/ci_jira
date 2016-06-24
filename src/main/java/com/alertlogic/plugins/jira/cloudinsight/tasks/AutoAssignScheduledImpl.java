package com.alertlogic.plugins.jira.cloudinsight.tasks;

import java.util.Date;
import java.util.HashMap;

import com.alertlogic.plugins.jira.cloudinsight.service.AIMSService;
import com.alertlogic.plugins.jira.cloudinsight.service.CredentialService;
import com.alertlogic.plugins.jira.cloudinsight.service.JIRAService;
import com.alertlogic.plugins.jira.cloudinsight.service.PluginConfigService;
import com.alertlogic.plugins.jira.cloudinsight.service.RuleConfigService;
import com.alertlogic.plugins.jira.cloudinsight.util.RestUtil;
import com.atlassian.sal.api.lifecycle.LifecycleAware;
import com.atlassian.sal.api.message.I18nResolver;
import com.atlassian.sal.api.scheduling.PluginScheduler;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Schedules the CI Add-on AutoAssign tasks.
 */
public class AutoAssignScheduledImpl extends AbstractTaskMonitor implements LifecycleAware {

    private final Logger logger = LoggerFactory.getLogger(AutoAssignScheduledImpl.class);

    public static final String KEY = AutoAssignScheduledImpl.class.getName() + ":instance";
    public static final String JOB_NAME = AutoAssignScheduledImpl.class.getName() + ":job";

	public AutoAssignScheduledImpl(
			PluginScheduler pluginScheduler,
			PluginConfigService pluginConfigService,
			AIMSService aimsService,
			RuleConfigService ruleConfigService,
			JIRAService jiraService,
			I18nResolver i18nResolver,
			CredentialService credentialService,
			RestUtil restUtilService)
	{
		super(pluginScheduler, pluginConfigService, aimsService, ruleConfigService,jiraService, i18nResolver, credentialService, restUtilService);
		this.interval = 186000L; //3 minutes 186
	}

	// declared by LifecycleAware
    public void onStart() {
        reschedule(interval);
    }

    @SuppressWarnings({ "serial", "deprecation" })
	public void reschedule(long interval) {

        this.interval = interval;

        pluginScheduler.scheduleJob(
                JOB_NAME,                   	// unique name of the job
                AutoAssignTask.class,      		// class of the job
                new HashMap<String,Object>() {{
                    put(KEY, AutoAssignScheduledImpl.this);
                }},                         	// data that needs to be passed to the job
                new Date(),                 	// the time the job is to start
                interval);                  	// interval between repeats, in milliseconds

        logger.info(String.format(JOB_NAME+":: Scheduled to run every %dms, the first execution will be ignored.", interval));

    }

	@SuppressWarnings("deprecation")
	@Override
	public void onStop() {
		pluginScheduler.unscheduleJob(JOB_NAME);
	}
}
