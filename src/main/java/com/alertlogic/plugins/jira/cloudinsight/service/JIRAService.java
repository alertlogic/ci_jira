package com.alertlogic.plugins.jira.cloudinsight.service;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;

import org.json.JSONArray;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.alertlogic.plugins.jira.cloudinsight.entity.Filter;
import com.alertlogic.plugins.jira.cloudinsight.entity.RuleConfig;
import com.alertlogic.plugins.jira.cloudinsight.tasks.TaskRuleExecutionState;
import com.atlassian.crowd.embedded.api.Group;
import com.atlassian.crowd.embedded.api.User;
import com.atlassian.jira.bc.issue.IssueService;
import com.atlassian.jira.bc.issue.IssueService.IssueResult;
import com.atlassian.jira.bc.issue.IssueService.TransitionValidationResult;
import com.atlassian.jira.bc.issue.search.SearchService;
import com.atlassian.jira.component.ComponentAccessor;
import com.atlassian.jira.issue.Issue;
import com.atlassian.jira.issue.IssueInputParameters;
import com.atlassian.jira.issue.IssueInputParametersImpl;
import com.atlassian.jira.issue.comments.CommentManager;
import com.atlassian.jira.issue.fields.CustomField;
import com.atlassian.jira.issue.issuetype.IssueType;
import com.atlassian.jira.issue.priority.Priority;
import com.atlassian.jira.issue.search.SearchProvider;
import com.atlassian.jira.issue.search.SearchResults;
import com.atlassian.jira.jql.builder.JqlQueryBuilder;
import com.atlassian.jira.project.Project;
import com.atlassian.jira.security.JiraAuthenticationContext;
import com.atlassian.jira.user.ApplicationUser;
import com.atlassian.jira.web.bean.PagerFilter;
import com.opensymphony.workflow.loader.ActionDescriptor;

/**
 * Management of Jira Issues.
 */
public class JIRAService {
	private ScreenConfigService screenConfigService;
	private static final Logger log = LoggerFactory.getLogger(JIRAService.class);

	public JIRAService(ScreenConfigService screenConfigService) {
		this.screenConfigService = screenConfigService;
	}

	/**
	 * Creates a comment in an issue.
	 * @param issue	The Issue reference
	 * @param user	The User reference
	 * @param body	The string body of the comment
	 */
	public void commentIssue(Issue issue, ApplicationUser user, String body ) {
		CommentManager commentManager = ComponentAccessor.getCommentManager();
		commentManager.create(issue, user, body, false);
	}

	/**
	 * Return the priority id according to the position or just the last
	 * @param prioritiesArray
	 * @param position
	 * @return String Return the priority id
	 */
	public String getPriorityByPosition(ArrayList<Priority> prioritiesArray, int position){

		if( position < prioritiesArray.size() ) {
			return prioritiesArray.get( position ).getId();
		} else {
			return prioritiesArray.get( prioritiesArray.size() - 1 ).getId();
		}
	}

	/**
	 * Loggin the user into jira
	 * some action validate that the user has permmissions to execute the action
	 * an for this reason we need to loggin the user in the jira context
	 * @param user
	 */
	public void logginUser(ApplicationUser user) {
		JiraAuthenticationContext jiraAutheticationContext = ComponentAccessor.getJiraAuthenticationContext();
    	jiraAutheticationContext.setLoggedInUser( user );
	}

	/**
	 * Search issues by remediation item
	 * @param remediationItemValue
	 * @return
	 */
	public List<Issue> searchIssueByRemeditionItem(String remediationItemValue, String userName){
		try {
			screenConfigService.assigValuesToVariables();
			CustomField remediationItemCustomField = screenConfigService.getRemediationItemCustomField();
      SearchService searchService = ComponentAccessor.getComponentOfType(SearchService.class);

			JqlQueryBuilder builder = JqlQueryBuilder.newBuilder();
			ApplicationUser user = ComponentAccessor.getUserManager().getUserByName( userName );
			logginUser( user );

			builder.where().customField(remediationItemCustomField.getIdAsLong()).like( remediationItemValue );

          SearchResults<Issue> results = searchService.search(user, builder.buildQuery(), PagerFilter.getUnlimitedFilter());
	        return  results.getResults();
	    } catch (Exception e) {
	    	log.error("CI Plugin:"+e.toString());
			e.printStackTrace();
		}

		return null;
	}

	/**
	 * Get the string for a level
	 * @param level	The level for a threat
	 * @return	String
	 */
	public String getTextLevel( int level) {
		switch ( level ) {
			case 1: return "low";
			case 2: return "medium";
			case 3: return "high";
		}
		return "info";
	}

	/**
	 * Match between jira and cloud insight and return priority id
	 * @param ciLevel can be high, medium, low or info
	 * @return String Return the priority id
	 */
	public String getPriorityId( String ciLevel ){
		Collection<Priority> priorities = ComponentAccessor.getConstantsManager().getPriorities();
		ArrayList<Priority> prioritiesArray = new ArrayList<Priority>();

		if(priorities.size() > 0){
			for(Priority p : priorities){
				if( !p.getName().equalsIgnoreCase("Blocker") ) {
					prioritiesArray.add(p);
				}
			}

			if(ciLevel.equals("high")){
				return getPriorityByPosition( prioritiesArray, 0);
			}

			if(ciLevel.equals("medium")){
				return getPriorityByPosition( prioritiesArray, 1);
			}

			if(ciLevel.equals("low")){
				return getPriorityByPosition( prioritiesArray, 2);
			}

			if(ciLevel.equals("info")){
				return getPriorityByPosition( prioritiesArray, 3);
			}
		}
		return "";
	}

	/**
	 * Format a summary, remove special characters and crop if it is necessary
	 * @param description
	 * @return
	 */
	public String formatSummary(String description){
		String formated = description;
		if( description.length() > 255){
			 formated = description.substring(0,255) ;
	    }
		formated = formated.replaceAll("(\\r|\\n)", " ");

		return formated;
	}

	/**
	 * Create an issue with the information of cloud insight
	 * @param summary
	 * @param description
	 * @param projectID
	 * @param remediationItem
	 * @param remediationId
	 * @param jiraGroup
	 * @param issueTypeId
	 * @param level
	 * @param userName
	 * @return JSONObject with a log and if it was success or not
	 * @throws Exception
	 */
	public void createIssue(String summary, String description, long projectID, String remediationItem, String remediationId, String jiraGroup, String level, String userName) throws Exception {

		IssueService issueService = ComponentAccessor.getIssueService();
		//Validation that the project exists and are valid
		Project project = ComponentAccessor.getProjectManager().getProjectObj( projectID );
		if( project == null ) {
            throw new Exception("CI Plugin: this project does not exists "+projectID);
		}

		screenConfigService.assigValuesToVariables();
		if( !screenConfigService.hasIssueTypeConfigurated(project) ){
            throw new Exception("CI Plugin: this project is not configured properly :"+projectID);
		}

		ApplicationUser user =  getUserByName(userName);
		//Validation the user exist
		if( user == null ) {
			throw new Exception("CI Plugin: the user does not exist or is inactive :"+userName);
		}

		//Get values of customs and issue type configured for cloud insight
		IssueType ciIssueType = screenConfigService.getIssueTypeCI();
		CustomField groupCustomField = screenConfigService.getGroupCustomField();
		CustomField remediationItemCustomField = screenConfigService.getRemediationItemCustomField();
		CustomField remediationIdCustomField =screenConfigService.getRemediationIdCustomField();

		//setting values
        IssueInputParameters issueInputParameters = issueService.newIssueInputParameters();

        issueInputParameters.setSummary( formatSummary(summary) );
        issueInputParameters.setDescription( description );
        issueInputParameters.setProjectId( project.getId() );
        issueInputParameters.setIssueTypeId( ciIssueType.getId() );
        issueInputParameters.setPriorityId( getPriorityId( level ) );
        issueInputParameters.addCustomFieldValue( remediationItemCustomField.getId(), remediationItem);
        issueInputParameters.addCustomFieldValue( remediationIdCustomField.getId(), remediationId);
        issueInputParameters.addCustomFieldValue( groupCustomField.getId(), jiraGroup);
        issueInputParameters.setAssigneeId( project.getLeadUserName() );
        //Perform the validation
        IssueService.CreateValidationResult result = issueService.validateCreate( user, issueInputParameters);


        if (result.getErrorCollection().hasAnyErrors()) {

            Map<String, String> errors = result.getErrorCollection().getErrors();
            String errorDetails="";

            for (String key: errors.keySet()) {
            	errorDetails += "CI Plugin: Error Field, "+key + " - " + errors.get(key)+"\n";
        	}

            throw new Exception(errorDetails);

        } else {
        	issueService.create( user, result);
        }

	}

	/**
	 * Get jira user by name
	 * @param userName
	 * @return User
	 */
	public ApplicationUser getUserByName(String userName){
		ApplicationUser user =  ComponentAccessor.getUserManager().getUserByName(userName);
		//Validation the user exist
		if( user == null ) {
			log.error("CI Plugin: the user does not exist :" + userName );
			return null;
		}

		if( !user.isActive() ) {
			log.error("CI Plugin: the user is not active");
			return null;
        }

    	//loggin user it is necesary to create an issue
		logginUser( user );
		return user;
	}

	/**
	 * Move an issue in the workflow
	 * @param issue
	 * @param state
	 * @param user
	 * @return result the transation
	 */
	public boolean doTransitionIssue(Issue issue, int state, String userName,String msg) {

		ApplicationUser user = getUserByName(userName);
	    IssueService issueService = ComponentAccessor.getIssueService();
	    IssueInputParameters issueInputParameters = new IssueInputParametersImpl();

	    TransitionValidationResult validationResult = issueService.validateTransition(user, issue.getId(), state, issueInputParameters);
	    if (validationResult.isValid()) {
	    	IssueResult transResult = issueService.transition(user, validationResult);
	    	if(transResult.isValid()){

	    		commentIssue(transResult.getIssue(), 
	    				transResult.getIssue().getProjectObject().getProjectLead(),
						msg);

	    		return true;
	    	}
	    	else{
	    		log.error("CI Plugin: error while do the transition "+transResult.getErrorCollection().toString());
	    		return false;
	    	}
	    }
	    else{
	    	log.error("CI Plugin: error while do the transition");
	    	log.error("CI Plugin: error while do the transition "+validationResult.getErrorCollection().toString());
		}

	    return false;
	}

	/**
	 * Get an workflow action by name
	 * example Open Issue, Close Issue
	 * @param issue
	 * @param description
	 * @return
	 */
	public int getActionWorkflow(Issue issue, String description){

		Collection<ActionDescriptor> actions = ComponentAccessor
			.getWorkflowManager().getWorkflow(issue)
			.getAllActions();

		for (ActionDescriptor action : actions) {
			if(action.getName().equals(description)){
				return action.getId();
			}
		}

		return 0;
	}

	/**
	 * Get the groups for an user
	 * @return
	 */
	public Collection<Group> getGroupsForUser(String user){
		return ComponentAccessor.getGroupManager().getGroupsForUser(user);
	}

	/**
	 * Get the all groups
	 * This function was introduce because the api not support get all groups
	 * @return
	 */
	@SuppressWarnings("deprecation")
	public JSONObject getGroups(){
		 
		Collection<Group> groups = ComponentAccessor.getGroupManager().getAllGroups();
		JSONArray groupsArray  =  new JSONArray();
		JSONObject groupsJSON  =  new JSONObject();
		 
		for( Group group: groups ){
			JSONObject obj  =  new JSONObject();
			obj.put("name",group.getName());
			
			groupsArray.put ( obj );
		}
		
		groupsJSON.put("groups", groupsArray);

		return groupsJSON;
	}
}
