package com.alertlogic.plugins.jira.cloudinsight.util;

import org.json.JSONObject;

import com.alertlogic.plugins.jira.cloudinsight.entity.PluginConfig;
import com.alertlogic.plugins.jira.cloudinsight.service.AIMSService;
import com.alertlogic.plugins.jira.cloudinsight.service.PluginConfigService;
import com.sun.jersey.api.client.Client;
import com.sun.jersey.api.client.ClientResponse;
import com.sun.jersey.api.client.config.ClientConfig;
import com.sun.jersey.api.client.config.DefaultClientConfig;
import com.sun.jersey.api.json.JSONConfiguration;

public class RestUtil {

	public String token;
	public String urlEndPointAsset;
	public String urlEndPointRemediation;
	public String urlEndPointSource;
	public String userId;
	public String account;
	public PluginConfigService pluginConfigService;
	public AIMSService aimsService;
	
	public RestUtil( PluginConfigService pluginConfigService, AIMSService aimsService )
	{
		this.pluginConfigService = pluginConfigService;
		this.aimsService = aimsService;
	}

	/**
	 * Log a specific user in cloud insight
	 * @param jiraUser
	 * @throws Exception
	 */
	public void setupAuthetication(String jiraUser) throws Exception{
		PluginConfig conf = this.pluginConfigService.getConfiguration( jiraUser );
    	JSONObject jsonResponse = this.aimsService.ciAuthentication( jiraUser );
    	
    	this.token = this.aimsService.getToken( jsonResponse );
    	this.userId = this.aimsService.getUserId( jsonResponse );
    	this.account = this.aimsService.getAccount( jsonResponse );
    	this.urlEndPointRemediation = conf.getCredential().getCiUrl() + "/remediation/" + AIMSService.API_VERSION ;
    	this.urlEndPointAsset = conf.getCredential().getCiUrl() + "/assets/" + AIMSService.API_VERSION + '/' + account + "/environments/";
    	this.urlEndPointSource = conf.getCredential().getCiUrl() + "/sources/" + AIMSService.API_VERSION + '/' + account +  "/sources";	
	}

	/**
	 * Return a client config
	 * @return ClientConfig
	 */
	public ClientConfig getClientConfig( ) {
    	
    	ClientConfig clientConfig = new DefaultClientConfig();
 		clientConfig.getFeatures().put( JSONConfiguration.FEATURE_POJO_MAPPING, Boolean.TRUE );

 		return clientConfig;
    }
	
	/**
	 * Return a client response
	 * @param urlBase url base
	 * @return clientReponse
	 * @throws Exception
	 */
	public ClientResponse get(String urlBase) throws Exception{
    	
    	ClientConfig clientConfig = getClientConfig();

 		ClientResponse clientReponse = Client.create( clientConfig ).
 				resource( urlBase ).
 				accept( "application/json" ).
 				type( "application/json" ).
 				header( "x-aims-auth-token", this.token ).
 				get(ClientResponse.class);
 		
 		return clientReponse;
    }

	/**
	 * Return a clientReponse
	 * @param urlBase url base
	 * @param data parameters
	 * @return clientReponse
	 * @throws Exception
	 */
	public ClientResponse put(String urlBase, Object data) throws Exception{
    	
    	ClientConfig clientConfig = getClientConfig();

 		ClientResponse clientReponse = Client.create( clientConfig ).resource( urlBase )
 		.accept( "application/json" ).
 		type( "application/json" ).
 		header( "x-aims-auth-token", this.token ).put( ClientResponse.class, data);
 		
 		return clientReponse;
    }
}
