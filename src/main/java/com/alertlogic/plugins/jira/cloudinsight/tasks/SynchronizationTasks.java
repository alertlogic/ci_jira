
package com.alertlogic.plugins.jira.cloudinsight.tasks;

import java.io.UnsupportedEncodingException;
import java.util.Date;
import java.util.List;
import java.util.Map;

import org.json.JSONArray;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.alertlogic.plugins.jira.cloudinsight.entity.Credential;
import com.alertlogic.plugins.jira.cloudinsight.service.EnvironmentsService;
import com.alertlogic.plugins.jira.cloudinsight.service.RemediationsService;
import com.atlassian.jira.issue.Issue;
import com.atlassian.sal.api.scheduling.PluginJob;

/**
 *	The automatic synchronization task, this tasks query Cloud Insight for
 *	remediations items based on the user configuration and synchronization the status between
 *	Jira issues and Cloud insight remediations.
 */
public class SynchronizationTasks implements PluginJob {
	private static final Logger log = LoggerFactory.getLogger(SynchronizationTasks.class);

	private RemediationsService remediationsService;
	private EnvironmentsService environmentsService;
	private SynchronizationScheduledImpl monitor;
	private long timeWait = 20000L;

	@Override
	public void execute(Map<String, Object> jobDataMap) {
		//Get the reference to the monitor of the task
        monitor = (SynchronizationScheduledImpl)jobDataMap.get(SynchronizationScheduledImpl.KEY);
        log.debug(monitor.getI18nResolver().getText("ci.job.autosynchronization.msg.log.debug.executing"));

        //Verify monitor is present
        if ( monitor != null ) {
        	//Ignore task execution if it´s the first time, let the spring context initialize correctly.
    		if (monitor.getLastRun() == null) {
    			log.debug(SynchronizationScheduledImpl.JOB_NAME+":: Ignoring the first execution.");
    			monitor.setLastRun(new Date());
    		} else {
    			//Set last run always, even if is the first time execution.
	    		Date currentDate = new Date();
	        	log.debug(SynchronizationScheduledImpl.JOB_NAME+":: Current Date: "+currentDate+" Last Execution: "+monitor.getLastRun());
	        	monitor.setLastRun(currentDate);

	        	if( monitor.getPluginConfigService() != null ){
	        		searchCredentialsToSynchronization();
	        	}
    		}
        }
	}

	/**
	 * Search the credential for star the synchronization proccess
	 */
    private void searchCredentialsToSynchronization(){
    	Credential[] credentials = monitor.getCredentialService().getCredentials();

    	for( int  i = 0; i < credentials.length; i++){
    		synchronizeJob(monitor, credentials[i].getJiraUser());
    	}
    }

	/**
	 * The main job, starts all the tasks required for the job.
	 * @param monitor	Object	Reference to the tasks monitor object.
	 */
	private void synchronizeJob(SynchronizationScheduledImpl monitor, String jiraUser) {

		this.remediationsService = new RemediationsService(monitor.getPluginConfigService(), monitor.getRestUtil());
		this.environmentsService = new EnvironmentsService(monitor.getPluginConfigService(), monitor.getRestUtil());

		try {
			JSONObject environmentsAll = this.environmentsService.getAllEnvironments(jiraUser);
			JSONArray environments = environmentsAll.getJSONArray("sources");
			if (environments != null) {

				for ( int i = 0; i < environments.length(); i++ ) {
					JSONObject environment = environments.getJSONObject(i).getJSONObject("source");

					if (environment != null) {

						String envId = environment.getString("id");
						log.debug( monitor.getI18nResolver().getText("ci.job.autosynchronization.msg.log.debug.executing.environment") +envId);

						try {
							executeSynchronizeJob(monitor, envId, jiraUser);
						} catch (Exception e) {
							log.error( monitor.getI18nResolver().getText("ci.job.autosynchronization.msg.log.error.executing.synchronizejob") + e.getMessage() );		
							e.printStackTrace();
						}
					}

				}

			} else {
				log.debug( monitor.getI18nResolver().getText("ci.job.autosynchronization.msg.log.debug.notenvironments"));		
			}
		} catch(Exception exception){
			exception.printStackTrace();
		}
	}

	/**
	 * How many time passed since last updating
	 * @param issue
	 * @return
	 */
	private boolean skipSynchronization(Issue issue){

		long time = (new Date()).getTime() - issue.getUpdated().getTime();

		if( time < timeWait ){
			return true;
		}
		return false;
	}

	/**
	 * Synchronize the status between Cloud insight and jira,
	 * can reopen issues that are close
	 * can close issues that are open
	 * @param issue
	 * @param statusCI
	 * @param monitor
	 * @throws UnsupportedEncodingException
	 */
	private void synchronizeStatus(Issue issue, String statusCI, SynchronizationScheduledImpl monitor ) {
		String statusJira = issue.getStatusObject().getNameTranslation();

		try{
			if( !skipSynchronization( issue ) ){
				if ( statusCI.equals("planned") || statusCI.equals("incomplete") ) {
					if( statusJira.equals("Closed") || statusJira.equals("Resolved")) {
						log.debug( monitor.getI18nResolver().getText("ci.job.autosynchronization.msg.log.debug.issue.goingtobereopen")  + issue.getKey());		

						int state = monitor.getJIRAService().getActionWorkflow(issue,"Reopen Issue");
						monitor.getJIRAService().doTransitionIssue(
								issue,
								state,
								issue.getProjectObject().getLeadUserName(),
								monitor.getI18nResolver().getText("ci.job.autosynchronization.msg.transation.reopen")
								);
						log.debug( monitor.getI18nResolver().getText("ci.job.autosynchronization.msg.log.debug.issue.hasbeenreopen")  + issue.getKey());		
						}
			    }
				else{
				    if ( statusCI.equals("disposed") || statusCI.equals("complete") ) {
				    	if( !statusJira.equals("Closed") && !statusJira.equals("Resolved")){
				    		log.debug( monitor.getI18nResolver().getText("ci.job.autosynchronization.msg.log.debug.issue.goingtobeclose")  + issue.getKey());		

				    		int state = monitor.getJIRAService().getActionWorkflow(issue,"Close Issue");
							monitor.getJIRAService().doTransitionIssue(
									issue,
									state,
									issue.getProjectObject().getLeadUserName(),
									monitor.getI18nResolver().getText("ci.job.autosynchronization.msg.transation.close")
								);

							log.debug( monitor.getI18nResolver().getText("ci.job.autosynchronization.msg.log.debug.issue.hasbeenclosed")  + issue.getKey());		
						}
				    }
		        }
			}
		}catch(Exception e){
			log.error( monitor.getI18nResolver().getText("ci.job.autosynchronization.msg.log.error.synchr.status"));		
			log.error( monitor.getI18nResolver().getText("ci.job.autosynchronization.msg.log.error.synchr.jirastatus") + statusJira);		
			log.error( monitor.getI18nResolver().getText("ci.job.autosynchronization.msg.log.error.synchr.cistatus") + statusCI);		
			log.error( monitor.getI18nResolver().getText("ci.job.autosynchronization.msg.log.error.synchr.issuekey") + issue.getKey());		

			e.printStackTrace();
		}
	}

	/**
	 * Synchronize the remediations items in an environment with the issues assigned
	 * @param monitor
	 * @param environmentId
	 */
	private void executeSynchronizeJob(SynchronizationScheduledImpl monitor, String environmentId, String jiraUser) {
		this.remediationsService = new RemediationsService(monitor.getPluginConfigService(), monitor.getRestUtil());

    	if (!environmentId.isEmpty()) {
    		try{

		    	JSONObject allRemediationsItems = this.remediationsService.getAllRemediationsItemsByEnvironment( environmentId, jiraUser);

		    	if ( allRemediationsItems.has("assets") ) {

		    		JSONArray assets = allRemediationsItems.getJSONArray("assets");

		    		if ( assets.length() != 0 ) {

		    			for(int i = 0; i < assets.length(); i++)
		    	    	{
		    	    		for(int j = 0; j < assets.getJSONArray(i).length(); j++)
		    	        	{
		    	    			JSONObject remediationItem = assets.getJSONArray(i).getJSONObject(j);
		    	    			if( remediationItem.has("state")  && remediationItem.has("key")){
			    	    			String state = remediationItem.getString("state");
			    	    			String key = remediationItem.getString("key");
			    	    			log.debug( monitor.getI18nResolver().getText("ci.job.autosynchronization.msg.log.debug.user") + jiraUser);	

			    	    			List<Issue> issues = monitor.getJIRAService().searchIssueByRemeditionItem(key, jiraUser);
			    	    			log.debug( monitor.getI18nResolver().getText("ci.job.autosynchronization.msg.log.debug.searchissue") + key);
			    	    			log.debug( monitor.getI18nResolver().getText("ci.job.autosynchronization.msg.log.debug.searchissue.amount") + issues.size());
			    	    			log.debug( monitor.getI18nResolver().getText("ci.job.autosynchronization.msg.log.debug.searchissue.cistate") + state);

			    	    			for(int k=0; k<issues.size();k++){
			    	    				synchronizeStatus( issues.get(k), state, monitor);
			    	    			}
		    	    			}
		    	        	}
		    	    	}

					} else {
						log.debug( monitor.getI18nResolver().getText("ci.job.autosynchronization.msg.log.debug.notassets") );	
					}

				} else{
					log.debug( monitor.getI18nResolver().getText("ci.job.autosynchronization.msg.log.debug.notremediations") );	
				}

    		} catch(Exception exception) {
	    		exception.printStackTrace();
	    	}
    	}
	}

}
