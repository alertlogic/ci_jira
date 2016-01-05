package com.alertlogic.plugins.jira.cloudinsight.service;

//import java.util.Base64;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.alertlogic.plugins.jira.cloudinsight.entity.PluginConfig;
import com.atlassian.activeobjects.external.ActiveObjects;
import com.sun.jersey.core.util.Base64;

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
     * This function decode a string encoded as base 64.
     * @param encodedText	The string to encode
     * @return	String		The decoded string
     */
    public String decode(String encodedText) {
    	byte[] decodedBytes = Base64.decode(encodedText);
    	return new String(decodedBytes);
    }

    /**
     * This function encode a string on base 64
     * @param text		The text to encode
     * @return	String	The encoded string
     */
    public String encode(String text) {
    	return new String(Base64.encode(text.getBytes()));
    }

    /**
     * Creates or updates the configuration, return the configuration reference object
     */
    public PluginConfig createOrUpdateConfiguration(String jiraUser,String ciUser, String ciPassword,String ciUrl)
    {
    	PluginConfig conf;

    	if ( hasConfiguration() ) {
    		conf = getConfiguration();
    		log.debug("CI Plugin: updating configuration on active objects");
    	}else{
    		conf = activeObjects.create( PluginConfig.class);
    		log.debug("CI Plugin: creating configuration on active objects");
    	}
        conf.setJiraUser(jiraUser);
        conf.setCiUser(ciUser);
        conf.setCiPassword(ciPassword);
        conf.setCiUrl(ciUrl);
        conf.save();

        return conf;
    }

    /**
     * Get the configuration store as an active object
     */
    public PluginConfig getConfiguration()
    {
    	PluginConfig[]  configArray = activeObjects.find(PluginConfig.class);
    	if (configArray.length > 0) {
    		return configArray[0];
    	}
    	return null;
    }

    /**
     * Returns true if has a configuration.
     */
    public boolean hasConfiguration()
    {
    	return (activeObjects.count(PluginConfig.class) > 0);
    }

    /**
     * Get the configuration store as an active object.
     */
    public Boolean deleteConfiguration()
    {
    	try{
    		PluginConfig[]  configArray = activeObjects.find(PluginConfig.class);

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
}
