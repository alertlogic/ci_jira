package com.alertlogic.plugins.jira.cloudinsight.service;

import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.alertlogic.plugins.jira.cloudinsight.entity.PluginConfig;
import com.sun.jersey.api.client.Client;
import com.sun.jersey.api.client.ClientResponse;
import com.sun.jersey.api.client.config.ClientConfig;
import com.sun.jersey.api.client.config.DefaultClientConfig;
import com.sun.jersey.api.json.JSONConfiguration;

/**
 *	Service for all the environment operations
 */
public class EnvironmentsService {
	private static final Logger log = LoggerFactory.getLogger(AIMSService.class);

	public PluginConfigService pluginConfigService;
	public AIMSService aimsService;

	public EnvironmentsService( PluginConfigService pluginConfigService, AIMSService aimsService )
	{
		this.pluginConfigService = pluginConfigService;
		this.aimsService = aimsService;
	}

	/**
	 * Return the environments
	 * @return
	 * @throws Exception 
	 */
	public JSONObject getAllEnvironments() throws Exception{
		PluginConfig conf = this.pluginConfigService.getConfiguration();
    	JSONObject jsonResponse = this.aimsService.ciAuthentication();
    	String token = this.aimsService.getToken(jsonResponse);
    	String account = this.aimsService.getAccount(jsonResponse);

    	ClientResponse responseGetEnvironments;

     	if ( token != null && account != null)
     	{
     		ClientConfig clientConfig = new DefaultClientConfig();
     		clientConfig.getFeatures().put(JSONConfiguration.FEATURE_POJO_MAPPING, Boolean.TRUE);

     		responseGetEnvironments = Client.create (clientConfig).
     			resource( conf.getCiUrl() + "/sources/v1/" + account +  "/sources?source.type=environment").
     			accept( "application/json" ).
	    		type( "application/json" ).
	    		header( "x-aims-auth-token" , token ).
     			get(ClientResponse.class);

     		if ( responseGetEnvironments.getStatus() == 200 )
     		{
     			JSONObject jsonObj = new JSONObject( responseGetEnvironments.getEntity(String.class) );
     			return jsonObj;
     		}
     		else{
     			log.error("CI Plugin:We could not find the environmets");
     			log.error("CI Plugin: " +responseGetEnvironments.getStatus() );
     		}
     	}
     	return null;
	}
}
