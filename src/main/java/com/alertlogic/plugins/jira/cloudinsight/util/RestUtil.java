package com.alertlogic.plugins.jira.cloudinsight.util;

import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.alertlogic.plugins.jira.cloudinsight.entity.Credential;
import com.alertlogic.plugins.jira.cloudinsight.entity.PluginConfig;
import com.alertlogic.plugins.jira.cloudinsight.service.AIMSService;
import com.alertlogic.plugins.jira.cloudinsight.service.PluginConfigService;
import com.atlassian.sal.api.message.I18nResolver;
import com.sun.jersey.api.client.Client;
import com.sun.jersey.api.client.ClientResponse;
import com.sun.jersey.api.client.WebResource;
import com.sun.jersey.api.client.config.ClientConfig;
import com.sun.jersey.api.client.config.DefaultClientConfig;
import com.sun.jersey.api.client.filter.HTTPBasicAuthFilter;
import com.sun.jersey.api.json.JSONConfiguration;

public class RestUtil {
	private static final Logger log = LoggerFactory.getLogger(RestUtil.class);
	public String token;
	public String urlEndPointAsset;
	public String urlEndPointRemediation;
	public String urlEndPointSource;
	public String urlEndPointAccessKey;
	public String userId;
	public String account;
	public PluginConfigService pluginConfigService;
	public I18nResolver i18n;

	public RestUtil( PluginConfigService pluginConfigService, I18nResolver i18n)
	{
		this.pluginConfigService = pluginConfigService;
		this.i18n = i18n;
	}

    /**
     * Extract the token from authentication response.
     * @param jsonResponse	This parameter can be obtained calling ciAuthentication
     * @return token		The authentication token present in the response
     */
    public  String getToken(JSONObject jsonResponse){
    	if ( jsonResponse != null ) {
    		if(jsonResponse.has("authentication")){
    			if(jsonResponse.getJSONObject("authentication").has("token")){
    	    		return  jsonResponse.getJSONObject("authentication").getString("token");
    			}
    		}
		}
		return null;
    }

    /**
     * Extract the account from authentication response.
     * @param jsonResponse	This parameter can be obtained calling ciAuthentication
     * @return accountId	Return the account id present in the response.
     */
    public String getAccount(JSONObject jsonResponse){
    	if( jsonResponse != null ){
    		if(jsonResponse.has("authentication")){
    			if(jsonResponse.getJSONObject("authentication").has("account")){
    				return  jsonResponse.getJSONObject("authentication").getJSONObject("account").getString("id");
    			}
    		}
		}
		return null;
    }

    /**
     * Extract the user id from authentication response.
     * @param jsonResponse	This parameter can be obtained calling ciAuthentication
     * @return userId	Return the user id present in the response.
     */
    public String getUserId(JSONObject jsonResponse){
    	if( jsonResponse != null ){
    		if(jsonResponse.has("authentication")){
    			if(jsonResponse.getJSONObject("authentication").has("user")){
    				return  jsonResponse.getJSONObject("authentication").getJSONObject("user").getString("id");
    			}
    		}
		}
		return null;
    }


	/**
	 * Return a client config with basic authetication
	 * @return Client
	 */
	public Client getClientConfigAuthetication(Credential credential ) {
		Client client = Client.create(new DefaultClientConfig());
		client.addFilter( new HTTPBasicAuthFilter(credential.getCiAccessKeyId(), CommonJiraPluginUtils.decode( credential.getCiSecretKey() )) );
		return client;
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

    public JSONObject autheticate(Credential credential) throws Exception
    {
    	Client client = getClientConfigAuthetication(credential);
    	WebResource resource = client.resource( credential.getCiUrl()+"/aims/"+AIMSService.API_VERSION+"/authenticate");
    	resource.accept("application/json").type("application/json");

 		ClientResponse response = resource.post(ClientResponse.class);

 		if ( response.getStatus() == 200 ) {
 			JSONObject jsonObj = new JSONObject( response.getEntity(String.class) );
 			jsonObj.put("endpoint", credential.getCiUrl());

 			log.debug( i18n.getText("ci.service.aimsservice.msg.log.debug.authentication.valid") );
 			return jsonObj;
 		}
 		else{
 			log.error( i18n.getText("ci.service.aimsservice.msg.log.error.authentication.invalid") + response.getStatus() );
 			throw new Exception( "Error in authetication " + response.getStatus());
 		}
    }

    /**
	 * Authenticate a specific user in cloud insight
	 * @param jiraUser
	 * @throws Exception
	 */
	public void setupAuthetication(String jiraUser) throws Exception{
		PluginConfig conf = this.pluginConfigService.getConfiguration( jiraUser );
		setupAuthetication( conf.getCredential() );
	}

	/**
	 * Authenticate a specific user in cloud insight
	 * @param jiraUser
	 * @throws Exception
	 */
	public void setupAuthetication(Credential credential) throws Exception{
		JSONObject jsonResponse = autheticate( credential );

    	this.token = getToken( jsonResponse );
    	this.userId = getUserId( jsonResponse );
    	this.account = getAccount( jsonResponse );
    	this.urlEndPointRemediation = credential.getCiUrl() + "/remediation/" + AIMSService.API_VERSION ;
    	this.urlEndPointAsset = credential.getCiUrl() + "/assets/" + AIMSService.API_VERSION + '/' + account + "/environments/";
    	this.urlEndPointSource = credential.getCiUrl() + "/sources/" + AIMSService.API_VERSION + '/' + account +  "/sources";	
    	this.urlEndPointAccessKey = credential.getCiUrl() +"/aims/" + AIMSService.API_VERSION + "/" + account + "/users/" + userId + "/access_keys/";
	}

	/**
	 * Return a client response of a get request
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
	 * Return a clientReponse of a put request
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

	/**
	 * Return a clientReponse of a put request
	 * @param urlBase url base
	 * @param data parameters
	 * @return clientReponse
	 * @throws Exception
	 */
	public ClientResponse delete(String urlBase) throws Exception{

    	ClientConfig clientConfig = getClientConfig();

 		ClientResponse clientReponse = Client.create( clientConfig ).resource( urlBase )
	 		.accept( "application/json" ).
	 		type( "application/json" ).
	 		header( "x-aims-auth-token", this.token ).
	 		delete( ClientResponse.class);

 		return clientReponse;
    }
}
