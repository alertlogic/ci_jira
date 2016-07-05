package com.alertlogic.plugins.jira.cloudinsight.service;

import net.java.ao.Query;

import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.alertlogic.plugins.jira.cloudinsight.entity.Credential;
import com.alertlogic.plugins.jira.cloudinsight.entity.PluginConfig;
import com.atlassian.activeobjects.external.ActiveObjects;

import static com.google.common.base.Preconditions.checkNotNull;

/**
 * This class store the configuration of the add-on in the Jira Database
 * using Active Objects.
 */
public class PluginConfigService
{
    private final ActiveObjects activeObjects;
    private static final Logger log = LoggerFactory.getLogger(PluginConfigService.class);

    public PluginConfigService(ActiveObjects activeObjects)
    {
        this.activeObjects = checkNotNull(activeObjects);
    }

    /**
     * Creates or updates the configuration, return the configuration reference object
     */
    public PluginConfig createOrUpdateConfiguration(String jiraUser, Credential credential)
    {
    	PluginConfig conf;
    	if ( hasConfiguration( jiraUser ) ) {
    		conf = getConfiguration( jiraUser );
    		log.debug("CI Plugin: updating configuration on active objects");
    	}else{
    		conf = activeObjects.create( PluginConfig.class);
    		log.debug("CI Plugin: creating configuration on active objects");
    	}
        conf.setJiraUser(jiraUser);
        conf.setCredential(credential);
        conf.save();

        return conf;
    }

    /**
     * Get the configuration store as an active object
     */
    public PluginConfig getConfiguration( String jiraUser )
    {
    	PluginConfig[]  configArray = activeObjects.find( PluginConfig.class, Query.select().where( "JIRA_USER = ?", jiraUser) );

    	if (configArray.length > 0) {
    		return configArray[0];
    	}
    	return null;
    }

    /**
     * Returns true if has a configuration.
     */
    public boolean hasConfiguration( String jiraUser )
    {
    	return (activeObjects.count( PluginConfig.class, Query.select().where("JIRA_USER = ?", jiraUser )) > 0);
    }

    /**
     * Get the configuration store as an active object.
     */
    public Boolean deleteConfiguration( String jiraUser )
    {
    	try{
    		PluginConfig[]  configArray = activeObjects.find( PluginConfig.class, Query.select().where("JIRA_USER = ?", jiraUser));

    		if (configArray.length > 0) {
	    		activeObjects.delete(configArray);
	    		log.debug("CI Plugin: deleting configuration of active objects");
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
     * Get the configuration of an user
     * @return JSONObject with the credential condigured
     */
    public JSONObject getConfigurationByUserJSON( String jiraUser ){

    	PluginConfig config = this.getConfiguration(jiraUser);
    	JSONObject obj = new JSONObject();

    	if (config == null) {
    		return null;
    	}
    	else{
            obj.put("id",config.getID());
            obj.put("credential_ciUser",config.getCredential().getCiUser());
            obj.put("credential_id",config.getCredential().getID());
        }

        return obj;
    }
}
