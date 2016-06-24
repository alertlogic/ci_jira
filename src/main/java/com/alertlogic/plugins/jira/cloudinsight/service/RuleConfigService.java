package com.alertlogic.plugins.jira.cloudinsight.service;

import java.util.Date;

import net.java.ao.Query;

import org.json.JSONArray;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.alertlogic.plugins.jira.cloudinsight.entity.Filter;
import com.alertlogic.plugins.jira.cloudinsight.entity.RuleConfig;
import com.alertlogic.plugins.jira.cloudinsight.tasks.TaskRuleExecutionState;
import com.atlassian.activeobjects.external.ActiveObjects;

import static com.google.common.base.Preconditions.checkNotNull;

/**
 * This class handle the rules of schedule configured by the user.
 * It is going to be used for automatically to asign issues on jira
 * store the rules in the Jira Database using Active Objects.
 */
public class RuleConfigService {
    private final ActiveObjects activeObjects;
    private static final Logger log = LoggerFactory.getLogger(PluginConfigService.class);

    /**
     * Constructor
     * @param activeObjects
     */
    public RuleConfigService(ActiveObjects activeObjects)
    {
        this.activeObjects = checkNotNull(activeObjects);
    }

    /**
     * Creates a rule configuration, return the configuration reference object
     * @param group
     * @param project
     * @param ruleName
     * @param environment
     * @param filters
     * @return RuleConfig
     */
    public RuleConfig createRule(String group, int project, String ruleName, String environment, String[] filters, String userName)
    {
    	RuleConfig conf;

    	conf = activeObjects.create( RuleConfig.class);

    	conf.setProject(project);
        conf.setGroup(group);
        conf.setName(ruleName);
        conf.setEnvironment(environment);
        conf.setUser(userName);
        conf.setLastExecution(null);
        conf.setLastLog(null);
        conf.setLastImportantLog(null);
        conf.setLastStatus(TaskRuleExecutionState.SCHEDULED);

        conf.save();
        log.debug("CI Plugin: creating a rule configuration on active objects");

        for( int i = 0; i < filters.length; i++){
        	addFilter( conf , filters[ i ] );
        }

        return conf;
    }

    /**
     * Update the last execution of a rule
     * @param id
     * @param lastExecution
     */
    public void updateLastExecution(Integer id, Date lastExecution)
    {
    	RuleConfig conf = activeObjects.get(RuleConfig.class, id);
    	if( conf != null ){
    		conf.setLastExecution(lastExecution);
    		conf.save();
    	}
    }

    /**
     * Update the status
     * @param id
     * @param status
     */
    public void updateLastStatus(Integer id, int status)
    {
    	RuleConfig conf = activeObjects.get(RuleConfig.class, id);
    	if( conf != null ){
    		conf.setLastStatus(status);
    		conf.save();
    	}
    }

    /**
     * Update the log
     * @param id
     * @param log
     */
    public void updateLastImportantLog(Integer id, String lastImportantLog)
    {
    	RuleConfig conf = activeObjects.get(RuleConfig.class, id);
    	if( conf != null ){
    		conf.setLastImportantLog(lastImportantLog);
    		conf.save();
    	}
    }

    /**
     * Update the log
     * @param id
     * @param log
     */
    public void updateLastLog(Integer id, String lastLog)
    {
    	RuleConfig conf = activeObjects.get(RuleConfig.class, id);
    	if( conf != null ){
    		conf.setLastLog(lastLog);
    		conf.save();
    	}
    }

    /**
     * Update the log and last execution of a rule
     * @param id				The id of the rule
     * @param lastLog			The last log string
     * @param lastImportantLog	The last important log string
     * @param lastExecution		Date of the last execution
     * @param status			The status of the rule
     * @return	boolean
     */
    public boolean updateLog(Integer id, String lastLog, String lastImportantLog, Date lastExecution, int status)
    {
    	RuleConfig conf = activeObjects.get(RuleConfig.class, id);
    	if( conf != null ){
    		conf.setLastLog(lastLog);
    		conf.setLastImportantLog(lastImportantLog);
    		conf.setLastExecution(lastExecution);
    		conf.setLastStatus(status);
    		conf.save();
    		return true;
    	}
        return false;
    }

    /**
     * Update the log and last execution of a rule
     * @param id				The id of the rule
     * @param lastLog			The last log string
     * @param lastExecution		Date of the last execution
     * @param status			The status of the rule
     * @return	boolean
     */
    public boolean updateLog(Integer id, String lastLog, Date lastExecution, int status)
    {
    	RuleConfig conf = activeObjects.get(RuleConfig.class, id);
    	if( conf != null ){
    		conf.setLastLog(lastLog);
    		conf.setLastExecution(lastExecution);
    		conf.setLastStatus(status);
    		conf.save();
    		return true;
    	}
        return false;
    }

    /**
     * Update the log and last execution of a rule
     * @param id
     * @param log
     * @param lastExecution
     * @return boolean
     */
    public boolean updateRule(Integer id, String group, int project, String ruleName, String environment, String[] filters, String userName)
    {
    	RuleConfig conf = getRuleById(id);
    	if( conf != null ){
	    	conf.setProject(project);
	        conf.setGroup(group);
	        conf.setName(ruleName);
	        conf.setEnvironment(environment);
	        conf.setUser(userName);
	        conf.save();

	        log.debug("CI Plugin: updateing a rule configuration on active objects");
	        Filter[] filtersArray = conf.getFilters();
			activeObjects.delete( filtersArray );

	        for( int i = 0; i < filters.length; i++){
	        	addFilter( conf , filters[ i ] );
	        }
	        return true;
    	}

        return false;
    }

    /**
     * Associate the filter with a rule
     * @param rule
     * @param filterKey
     * @return filter
     */
    public Filter addFilter( RuleConfig rule, String filterKey){

         Filter filter = activeObjects.create( Filter.class );
	     filter.setRule(rule);
	     filter.setKey(filterKey);
	     filter.save();
	     log.debug("CI Plugin: adding filter to the rule");

         return filter;
    }

    /**
     * Get the rules configured on active object
     * @return RuleConfig[]
     */
    public RuleConfig[] getRules()
    {
    	RuleConfig[]  configArray = activeObjects.find( RuleConfig.class );
    	if (configArray.length > 0) {
    		return configArray;
    	}
    	return null;
    }

    /**
     * Get the rule configured by id
     * @param id rule
     * @return RuleConfig
     */
    public RuleConfig getRuleById( int id )
    {
    	return activeObjects.get(RuleConfig.class, id);
    }

    /**
     * Delete a rule configuration
     * @param id rule
     * @return boolean
     */
    public Boolean deleteConfiguration( int id )
    {
    	try{
    		RuleConfig[]  rulesArray = activeObjects.find( RuleConfig.class, Query.select().where("ID = ?", id));
    		if (rulesArray.length > 0) {
    			Filter[] filtersArray = rulesArray[0].getFilters();
    			activeObjects.delete( filtersArray );
    			log.debug("CI Plugin: deleting filters configured");
	    		activeObjects.delete( rulesArray );
	    		log.debug("CI Plugin: deleting rule configured");
	    		return true;
	    	}
    		return false;
    	}
    	catch(Exception e){
    		log.error("CI Plugin: " + e.toString());
			e.printStackTrace();
		}
    	return false;
    }

    /**
     * Get the rules from active object
     * @return JSONArray with the rules configured on active objects
     */
    public JSONArray getRulesConfigured(){

    	RuleConfig[] rules = this.getRules();
    	JSONArray rulesArray  =  new JSONArray();

    	if (rules == null) {
    		return null;
    	}

        for( int i = 0 ;i < rules.length ; i++ ) {
            JSONObject obj  =  new JSONObject();
            obj.put("id",rules[i].getID());
            obj.put("name",rules[i].getName());
            obj.put("environment",rules[i].getEnvironment());
            obj.put("project",rules[i].getProject());
            obj.put("group",rules[i].getGroup());
            obj.put("user",rules[i].getUser());
            obj.put("lastExecution",rules[i].getLastExecution());
            obj.put("lastLog",rules[i].getLastLog());
            obj.put("lastImportantLog",rules[i].getLastImportantLog());
            obj.put("lastStatus",rules[i].getLastStatus());
            obj.put("lastStatusName",TaskRuleExecutionState.getStateName(rules[i].getLastStatus()));

        	JSONArray filtersArray  =  new JSONArray();
        	Filter[] filters = rules[i].getFilters();
            JSONArray filtersString = new JSONArray();

        	for ( int j = 0; j < filters.length ; j++ ) {
        		JSONObject filter  =  new JSONObject();
        		filter.put( "key", filters[j].getKey() );
        		filtersArray.put(filter);
                filtersString.put( filters[j].getKey() );
        	}

        	obj.put("filters",filtersArray);
            obj.put("filtersString",filtersString);

        	rulesArray.put( obj );
        }

        return rulesArray;
    }

    /**
     * Get the rules from active object
     * @return JSONArray with the rules configured on active objects
     */
    public JSONObject getRuleByIdJSON(int id){

    	RuleConfig ruleConfig = this.getRuleById(id);
    	JSONObject obj  =  new JSONObject();

    	if (ruleConfig == null) {
    		return null;
    	}
    	else{
            obj.put("id",ruleConfig.getID());
            obj.put("name",ruleConfig.getName());
            obj.put("environment",ruleConfig.getEnvironment());
            obj.put("project",ruleConfig.getProject());
            obj.put("group",ruleConfig.getGroup());
            obj.put("user",ruleConfig.getUser());
            obj.put("lastExecution",ruleConfig.getLastExecution());
            obj.put("lastLog",ruleConfig.getLastLog());
            obj.put("lastImportantLog",ruleConfig.getLastImportantLog());
            obj.put("lastStatus",ruleConfig.getLastStatus());
            obj.put("lastStatusName",TaskRuleExecutionState.getStateName(ruleConfig.getLastStatus()));

        	JSONArray filtersArray  =  new JSONArray();
        	Filter[] filters = ruleConfig.getFilters();
            JSONArray filtersString = new JSONArray();

        	for ( int j = 0; j < filters.length ; j++ ) {
        		JSONObject filter  =  new JSONObject();
        		filter.put( "key", filters[j].getKey() );
        		filtersArray.put(filter);
                filtersString.put ( filters[j].getKey() );
        	}

        	obj.put("filters",filtersArray);
            obj.put("filtersString",filtersString);
        }

        return obj;
    }

}
