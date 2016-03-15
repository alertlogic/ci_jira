package com.alertlogic.plugins.jira.cloudinsight.service;

import net.java.ao.Query;

import org.json.JSONArray;
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
public class CredentialService
{
    private final ActiveObjects activeObjects;
    private static final Logger log = LoggerFactory.getLogger(PluginConfigService.class);

    public CredentialService(ActiveObjects activeObjects)
    {
        this.activeObjects = checkNotNull(activeObjects);
    }

    /**
     * Creates or updates the configuration, return the configuration reference object
     */
    public Credential createOrUpdateCredential(int idCredential, String jiraUser, String ciUser, String ciUrl, String ciAccessKeyId, String ciSecretKey)
    {
    	Credential credential;

    	if ( hasCredentials( ciUser ) ) {
    		credential = getCredentialByUser( ciUser );
    		log.debug("CI Plugin: updating configuration on active objects");
    	}else{
    		if( idCredential != -1 ){
    			credential = getCredentialById( idCredential );
    		}
    		else{
	    		credential = activeObjects.create( Credential.class);
	    		log.debug("CI Plugin: creating configuration on active objects");
	    	}
    	}
    	credential.setJiraUser(jiraUser);
    	credential.setCiUser(ciUser);
    	credential.setCiUrl(ciUrl);
    	credential.setCiAccessKeyId(ciAccessKeyId);
    	credential.setCiSecretKey(ciSecretKey);

    	credential.save();

        return credential;
    }

    /**
     * Get the configuration store as an active object
     */
    public Credential getCredentialByUser(String ciUser)
    {
    	Credential[]  configArray = activeObjects.find( Credential.class, Query.select().where("CI_USER = ?", ciUser ) );
    	if (configArray.length > 0) {
    		return configArray[0];
    	}
    	return null;
    }

    /**
     * Get the configuration store as an active object
     */
    public Credential getCredentialById(int id)
    {
    	Credential[]  configArray = activeObjects.find( Credential.class, Query.select().where("ID = ?", id ) );
    	if (configArray.length > 0) {
    		return configArray[0];
    	}
    	return null;
    }

    /**
     * Get all the credentials
     */
    public Credential[] getCredentials()
    {
    	Credential[]  configArray = activeObjects.find( Credential.class );
    	if (configArray.length > 0) {
    		return configArray;
    	}
    	return null;
    }

    /**
     * Returns true if the user has a credential.
     */
    public boolean hasCredentials(String user)
    {
    	return (activeObjects.count( Credential.class, Query.select().where("CI_USER = ?", user ) ) > 0);
    }

    /**
     * Review if exists some configuration that are using the credential
     * @param id credential
     * @return boolean
     */
    public boolean canBeDeleted(int id){
    	try{
	    	Credential credential = getCredentialById(id);
	    	PluginConfig[] configs = credential.getPluginConfigs();

	    	if(configs.length > 0){
	    		return false;
	    	}
	    	return true;
    	}
    	catch(Exception e){
    		log.error("CI Plugin: " + e.toString());
			e.printStackTrace();
		}
    	return false;
    }

    /**
     * Delete the configuration store as an active object.
     */
    public Boolean deleteCredential(int id)
    {
    	try{
    		Credential credentialsArray = getCredentialById(id);

    		if (credentialsArray != null ) {
	    		activeObjects.delete( credentialsArray );
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
     * Get the credentials
     * @return JSONArray with the credentials stored on active objects
     */
    public JSONArray getCredentialsJSONArray(){

    	Credential[] credentials = this.getCredentials();
    	JSONArray credentialArray  =  new JSONArray();

    	if (credentials == null) {
    		return null;
    	}

        for( int i = 0 ;i < credentials.length ; i++ ) {
            JSONObject obj  =  new JSONObject();
            obj.put("id",credentials[i].getID());
            obj.put("ciAccessKeyId",credentials[i].getCiAccessKeyId());
            obj.put("ciUrl",credentials[i].getCiUrl());
            obj.put("ciUser",credentials[i].getCiUser());

            credentialArray.put( obj );
        }

        return credentialArray;
    }
}
