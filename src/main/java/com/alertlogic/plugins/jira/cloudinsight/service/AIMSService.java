package com.alertlogic.plugins.jira.cloudinsight.service;

import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.alertlogic.plugins.jira.cloudinsight.entity.Credential;
import com.alertlogic.plugins.jira.cloudinsight.entity.PluginConfig;
import com.alertlogic.plugins.jira.cloudinsight.util.CommonJiraPluginUtils;
import com.alertlogic.plugins.jira.cloudinsight.util.RestUtil;
import com.atlassian.sal.api.message.I18nResolver;
import com.sun.jersey.api.client.Client;
import com.sun.jersey.api.client.ClientResponse;
import com.sun.jersey.api.client.WebResource;
import com.sun.jersey.api.client.config.ClientConfig;
import com.sun.jersey.api.client.config.DefaultClientConfig;
import com.sun.jersey.api.client.filter.HTTPBasicAuthFilter;

/**
 * This class is for the communication with the API of Cloud Insight
 * Something servlets or listeners going to call this for authentication.
 */
public class AIMSService {

	private static final Logger log = LoggerFactory.getLogger(AIMSService.class);
	public static final String API_VERSION = "v1";
	public PluginConfigService pluginConfigService;
	private I18nResolver i18n;
	private RestUtil restUtil;

	public AIMSService( PluginConfigService pluginConfigService, I18nResolver i18n, RestUtil restUtil )
	{
		this.pluginConfigService = pluginConfigService;
		this.i18n = i18n;
		this.restUtil = restUtil;
	}

	/**
	 * Authenticates to CI and return the data.
	 * @return JSONObject	The response of the authentication with an extra endpoint data.
	 * @throws Exception
	 */
    public JSONObject ciAuthentication(String jiraUser) throws Exception{

    	PluginConfig conf;

     	if ( pluginConfigService.hasConfiguration( jiraUser ) ) {

     		conf = pluginConfigService.getConfiguration( jiraUser );
     		return ciAuthentication( conf.getCredential() );
     	} else {
     		log.error( i18n.getText("ci.service.aimsservice.msg.log.error.not.credentials") );
     	}

     	return null;
    }

    /**
	 * Authenticates to CI and return the data.
	 * @return JSONObject	The response of the authentication with an extra endpoint data.
	 * @throws Exception
	 */
    public JSONObject ciAuthentication(Credential credential) throws Exception{

     	if( credential != null ){
     		return restUtil.autheticate(credential);
     	} else {
     		log.error( i18n.getText("ci.service.aimsservice.msg.log.error.not.credentials") );
     	}
     	
     	return null;
    }


	/**
	 * Delete access key
	 * @return boolean Return if the operation was successfull
	 * @throws Exception
	 */
    public boolean deleteAccessKeyId(Credential credential) {

    	String accessKeyId = credential.getCiAccessKeyId();
    	try {
        	restUtil.setupAuthetication(credential);
	    	String urlBase = restUtil.urlEndPointAccessKey;

	    	ClientResponse responseDelete;
	     	if ( urlBase != null) {
	     		urlBase += accessKeyId;

	     		log.debug( i18n.getText("ci.service.aimsservice.msg.log.debug.accesskey.deleting") );
	     		responseDelete = restUtil.delete(urlBase);

	     		if( responseDelete.getStatus() == 204 ){
	     			log.debug( i18n.getText("ci.service.aimsservice.msg.log.debug.accesskey.detele.success") );
	     			return true;
				}
	     		else {
	     			log.debug( i18n.getText("ci.service.aimsservice.msg.log.debug.accesskey.detele.error") );
	     			log.debug( "CI Plugin: "+responseDelete.getStatus() );
	     			log.debug( "CI Plugin: "+urlBase );
	     			log.debug( "CI Plugin: "+credential.getJiraUser() );

					return false;
				}
	     	}
    	}catch(Exception e){
    		log.debug( i18n.getText("ci.service.aimsservice.msg.log.debug.accesskey.detele.error") );
 			e.printStackTrace();
    	}

     	return false;
    }
}
