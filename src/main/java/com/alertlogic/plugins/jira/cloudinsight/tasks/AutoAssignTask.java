package com.alertlogic.plugins.jira.cloudinsight.tasks;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.Date;
import java.util.List;
import java.util.Map;

import org.json.JSONArray;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.alertlogic.plugins.jira.cloudinsight.entity.RuleConfig;
import com.alertlogic.plugins.jira.cloudinsight.service.RemediationsService;
import com.alertlogic.plugins.jira.cloudinsight.service.RuleConfigService;
import com.alertlogic.plugins.jira.cloudinsight.util.TaskLogger;
import com.atlassian.jira.issue.Issue;
import com.atlassian.sal.api.scheduling.PluginJob;

/**
 *	The automatic assign of issues tasks, this tasks query Cloud Insight for
 *	remediations based on the user configuration and creates the corresponding
 *	Jira issues.
 */
public class AutoAssignTask implements PluginJob {
	private static final Logger log = LoggerFactory.getLogger(AutoAssignTask.class);

	private RemediationsService remediationsService;
	private RuleConfigService ruleConfigService;
	private AutoAssignScheduledImpl monitor;

	@Override
	public void execute(Map<String, Object> jobDataMap) {
		//Get the reference to the monitor of the task
        monitor = (AutoAssignScheduledImpl)jobDataMap.get(AutoAssignScheduledImpl.KEY);
        log.debug("----------------------Job Auto Assign issues Cloud Insight---------------------");

        //Verify monitor is present
        if ( monitor != null ) {
        	//Ignore task execution if it´s the first time, let the spring context initialize correctly.
    		if (monitor.getLastRun() == null) {
    			log.debug(AutoAssignScheduledImpl.JOB_NAME+":: Ignoring the first execution.");
    			monitor.setLastRun(new Date());
    		} else {
    			//Set last run always, even if is the first time execution.
	    		Date currentDate = new Date();
	        	log.debug(AutoAssignScheduledImpl.JOB_NAME+":: Current Date: "+currentDate+" Last Execution: "+monitor.getLastRun());
	        	monitor.setLastRun(currentDate);

	        	if( monitor.getPluginConfigService() != null ){
	        		assingJob();
	        	}
    		}
        }
	}

	/**
	 * It is an open remediation
	 * incomplete: re-open
	 * open: not exist in the remeditionsItems
	 * other state is not open
	 */
	private boolean isAnOpenRemediation (JSONObject allRemediationsItems, String remediationId ) {
		JSONArray assets = allRemediationsItems.getJSONArray("assets");

		for (int i = 0; i < assets.length(); i++) {
			JSONObject remediation = assets.getJSONArray(i).getJSONObject(0);
			//review if the remediations has items
			if (remediation.getString("remediation_id").equals(remediationId))
			{
				if( remediation.getString("state").equals("incomplete") || remediation.getString("state").equals("verified"))
				{
					//if the remediation is incomplete this means that it is re-open
					return true;
				} else {
					//in others cases is or planned or complete
					return false;
				}
			}

		}
		//if the remediation not exist in remediation items is because it is open
		return true;
	};

	/**
	 * The assign main job, starts all the tasks required for the job.
	 * @param monitor	Object	Reference to the tasks monitor object.
	 */
	private void assingJob() {

		this.ruleConfigService = monitor.getRuleConfigService();

		JSONArray rulesConfigured = this.ruleConfigService.getRulesConfigured();

		if (rulesConfigured != null) 
		{
			//Iterate on every configured rule to perform execution.
			for ( int i = 0; i < rulesConfigured.length(); i++ )
			{
				JSONObject rule = rulesConfigured.getJSONObject(i);

				if (rule != null) {

					String ruleName = rule.getString("name");

					TaskLogger taskLogger = new TaskLogger();
					taskLogger.log(monitor.getI18nResolver().getText("ci.job.autoassign.msg.log.header") + ruleName);

					RuleConfig ruleConfig = this.ruleConfigService.getRuleById(rule.getInt("id"));

					//Verify that the task is not in blocked state
					if(ruleConfig.getLastStatus() != TaskRuleExecutionState.BLOCKED)
					{
						int statusBeforeRun = ruleConfig.getLastStatus();
						int ruleId = rule.getInt("id");

						try {
							//Set the state of the rule to EXECUTING
							this.ruleConfigService.updateLog(
									ruleId, 
									taskLogger.toString(), 
									new Date(), TaskRuleExecutionState.EXECUTING);
							log.debug(monitor.getI18nResolver().getText("ci.job.autoassign.msg.log.header") + ruleName);

							//If something bad happens, this method will throw an exception.
							int plannedItems = executeJob(ruleName, rule, statusBeforeRun);

							//This line should be reach if no exceptions where triggered
							updateRuleLog(ruleId,plannedItems,taskLogger);

						} catch (Exception e) {
							//Properly manage the exception and update logs with the errors.
							manageRuleException(rule,ruleConfig,e,taskLogger,statusBeforeRun);
						}

						log.debug(taskLogger.toString());
					}
				}
			}
		}
	}

	/**
	 * Manage the exception to properly update the rule logs.
	 * @param rule				Reference to the rule
	 * @param ruleConfig		Reference to the ruleConfig
	 * @param e					The exception to manage
	 * @param taskLogger		Reference to the task logger
	 * @param statusBeforeRun	The status before exception occurred.
	 */
	private void manageRuleException(JSONObject rule,RuleConfig ruleConfig,Exception e,TaskLogger taskLogger,int statusBeforeRun) 
	{
		//Capture and print the exception properly
		StringWriter sw = new StringWriter();
		e.printStackTrace(new PrintWriter(sw));
		String exceptionAsString = sw.toString();

		//If error happens last important log becomes the previous one.
		String lastImportantLog = rule.has("lastLog") ? rule.getString("lastLog") : "No last log available.";
		String ruleName = rule.has("name") ? rule.getString("name") : "No name available.";
		int ruleId = rule.has("id") ? rule.getInt("id") : 0;

		//Is the second time it fails?
		if (statusBeforeRun == TaskRuleExecutionState.ERROR) 
		{
			//Prepare the text for logging
			taskLogger.log(monitor.getI18nResolver().getText("ci.job.autoassign.msg.log.stacktrace") + exceptionAsString);	
			taskLogger.log(monitor.getI18nResolver().getText("ci.job.autoassign.msg.log.blocked") + ruleName +":"+e.getMessage());
			taskLogger.log(monitor.getI18nResolver().getText("ci.job.autoassign.msg.log.blocked") + ruleName +":"+monitor.getI18nResolver().getText("ci.job.autoassign.msg.log.blocked.msg"));

			//Mark the rule as blocked
			this.ruleConfigService.updateLog(ruleId, taskLogger.toString(), lastImportantLog, new Date(), TaskRuleExecutionState.BLOCKED);

		} else {
			//Prepare the text for logging
			taskLogger.log(monitor.getI18nResolver().getText("ci.job.autoassign.msg.log.stacktrace") + exceptionAsString);
			taskLogger.log(monitor.getI18nResolver().getText("ci.job.autoassign.msg.log.error")+ ruleName +":"+e.getMessage());

			//Mark the rule as error
			this.ruleConfigService.updateLog(ruleId,  taskLogger.toString(), lastImportantLog, new Date(), TaskRuleExecutionState.ERROR);
		}

		log.error(taskLogger.toString());
	}

	/**
	 * Update the log data when planned items are found or not.
	 * @param ruleId		The ruleId reference
	 * @param plannedItems	The amount of planned items
	 * @param taskLogger	Reference to the taskLogger
	 */
	private void updateRuleLog(int ruleId, int plannedItems, TaskLogger taskLogger) {
		//Check planned items
		if (plannedItems > 0) 
		{
			taskLogger.log(plannedItems+" "+monitor.getI18nResolver().getText("ci.job.autoassign.msg.assigned"));
			//Store this event as a last important log too.
			this.ruleConfigService.updateLog(
					ruleId, 
					taskLogger.toString(), 
					taskLogger.toString(),//Same as last log. 
					new Date(), TaskRuleExecutionState.SUCCESS);
		} else {
			taskLogger.log(monitor.getI18nResolver().getText("ci.job.autoassign.msg.notfound"));
			this.ruleConfigService.updateLog(
					ruleId, 
					taskLogger.toString(), 
					new Date(), TaskRuleExecutionState.SUCCESS);
		}
	}

	/**
	 * Execute the specified rule job
	 * @param monitor	The reference to the task data
	 * @param ruleName	The rule name
	 * @param rule		The reference to the rule data
	 * @return
	 * @throws Exception	If something goes wrong the job reports the error for the rule
	 */
	private int executeJob(String ruleName, JSONObject rule, int statusBeforeRun) throws Exception 
	{
		//Create the instance of the service
		this.remediationsService = new RemediationsService(monitor.getPluginConfigService(), monitor.getRestUtil());

    	String environment = rule.getString("environment");
    	String jiraUser = rule.getString("user");

    	if (!environment.isEmpty())
    	{
    		//Get the filters for this rule
	    	JSONArray filters = rule.getJSONArray("filters");
	    	JSONArray filtersString = rule.getJSONArray("filtersString");

	    	//Get all remediation items for the configures environment in the rule
	    	JSONObject allRemediationsItems = this.remediationsService.getAllRemediationsItemsByEnvironment( environment, jiraUser);
	    	//Get all remediations based on the environment an the filter
	    	JSONObject allRemediations = this.remediationsService.getAllRemediations( environment, filters, jiraUser);
	    	//Get all remediations descritions
	    	JSONObject descriptions=this.remediationsService.getRemediationsDescriptions(jiraUser);

	    	JSONArray currentRemediations = getOpenRemediations(allRemediations,allRemediationsItems);

	    	if (currentRemediations.length() > 0) {

	    		JSONArray remediationKeys = this.remediationsService.getRemediationsKeys(currentRemediations);
	    		JSONArray plannedItems = this.remediationsService.planRemediations(environment, remediationKeys, filtersString, jiraUser);

	    		if (plannedItems.length() <= 0) {
	    			throw new Exception(currentRemediations.length()+" "+monitor.getI18nResolver().getText("ci.job.autoassign.msg.plannederror"));
	    		}

	    		//For each successfully planned item create a jira issue
	    		for (int i = 0; i < plannedItems.length(); i++)
	    		{
	    			JSONObject remediationItem = plannedItems.getJSONObject(i);
	    			JSONObject remediation = getRemediationData(currentRemediations,remediationItem);
	    			assignRemediation(remediation,remediationItem,rule,descriptions);
	    		}

	    		return plannedItems.length();
	    	} else {
	    		if (statusBeforeRun == TaskRuleExecutionState.ERROR) {
	    			throw new Exception(monitor.getI18nResolver().getText("ci.job.autoassign.msg.blocked.error"));
	    		}
	    	}

    	} else {
    		throw new Exception(monitor.getI18nResolver().getText("ci.job.autoassign.msg.noenv.error"));
    	}

    	//No planned items
    	return 0;
	}

	/**
	 * Get the remediation data
	 * @param currentRemediations	The current remediations
	 * @param remediationItem	The remediation item to check
	 * @return	JSONObject	The remediation data object
	 */
	private JSONObject getRemediationData(JSONArray currentRemediations, JSONObject remediationItem) {
		if (remediationItem != null){
			if(remediationItem.has("properties")){
				JSONObject properties = remediationItem.getJSONObject("properties");
				if (properties.has("remediation_id")) {
					String remediationId = properties.getString("remediation_id");
					for (int i = 0; i < currentRemediations.length(); i++ ) 
					{
						if(currentRemediations.getJSONObject(i).getString("remediation_id").equals(remediationId)){
							return currentRemediations.getJSONObject(i);
						}
					}
				}
			}
		}
		return null;
	}

	/**
	 * Assign an issue in jira (Creates an issue) using the data related to the remediation
	 * and the corresponding remediation item and taking care of the rule information
	 * @param monitor			Reference to the task monitor
	 * @param remediation		Reference to the remediation
	 * @param remediationItem	Reference to the remediation item
	 * @param rule				Reference to the rule information
	 * @param descriptions      Reference to remediations descriptions
	 * @throws Exception	If something fails in the assignation the exception should reach log
	 */
	private void assignRemediation(JSONObject remediation, JSONObject remediationItem, JSONObject rule, JSONObject descriptions)
			throws Exception
	{
		List<Issue> issues = monitor.getJIRAService().searchIssueByRemeditionItem( remediationItem.getString("key"), rule.getString("user"));
		if( issues.size() == 0 ){
		    monitor.getJIRAService().createIssue(
    			remediation.getString("name"),
    			this.remediationsService.getRemediationsDescriptionsById(descriptions, remediation.getString("remediation_id")),
    			rule.getLong("project"),
    			remediationItem.getString("key"),
    			remediation.getString("key"),
    			rule.getString("group"),
    			monitor.getJIRAService().getTextLevel(remediation.getInt("threat_level")),
    			rule.getString("user"));
		}
	}

	/**
	 * Return the current open remediations based on the info available in assets.
	 * @param allRemediations		The reference to all remediations
	 * @param allRemediationsItems	The reference to all remediations items
	 * @return	JSONArray	the current open remediations
	 */
	private JSONArray getOpenRemediations(JSONObject allRemediations,JSONObject allRemediationsItems) 
	{
		JSONArray currentRemediations = new JSONArray();

		if ( allRemediations != null ) {

			if ( allRemediations.has("remediations") ) {
		    	if ( allRemediations.getJSONObject("remediations") != null ) {

		    		JSONArray assets = allRemediations.getJSONObject("remediations").getJSONArray("assets");

		    		if ( assets != null ) {
						for (int i = 0; i < assets.length(); i++)
						{
							if (this.isAnOpenRemediation(allRemediationsItems, assets.getJSONObject(i).getString("remediation_id"))) {
								currentRemediations.put(assets.getJSONObject(i));
							}
						}

					}
				}
			}
		}

    	return currentRemediations;
	}
}
