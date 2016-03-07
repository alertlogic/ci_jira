package com.alertlogic.plugins.jira.cloudinsight.service;

import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.alertlogic.plugins.jira.cloudinsight.entity.PluginConfig;
import com.alertlogic.plugins.jira.cloudinsight.util.CommonJiraPluginUtils;
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

	public AIMSService( PluginConfigService pluginConfigService, I18nResolver i18n )
	{
		this.pluginConfigService = pluginConfigService;
		this.i18n = i18n;
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

     		Client client = Client.create(new DefaultClientConfig());
     		client.addFilter( new HTTPBasicAuthFilter(conf.getCredential().getCiAccessKeyId(), CommonJiraPluginUtils.decode( conf.getCredential().getCiSecretKey() )) );

     		WebResource resource = client.resource(conf.getCredential().getCiUrl()+"/aims/"+API_VERSION+"/authenticate");
	    	resource.accept("application/json").type("application/json");

     		ClientResponse response = resource.post(ClientResponse.class);

     		if ( response.getStatus() == 200 ) {
     			JSONObject jsonObj = new JSONObject( response.getEntity(String.class) );
     			jsonObj.put("endpoint", conf.getCredential().getCiUrl());

     			log.debug( i18n.getText("ci.service.aimsservice.msg.log.debug.authentication.valid") );
     			return jsonObj;
     		}
     		else{
     			log.error( i18n.getText("ci.service.aimsservice.msg.log.error.authentication.invalid") + response.getStatus() );
     			throw new Exception( "Error in authetication " + response.getStatus());
     		}

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
    public boolean deleteAccessKeyId(String jiraUser)  {

    	PluginConfig conf = pluginConfigService.getConfiguration( jiraUser );
    	String accessKeyId = conf.getCredential().getCiAccessKeyId();

    	try {
	    	JSONObject authJsonResponse = this.ciAuthentication( jiraUser );
	    	String token = getToken(authJsonResponse);
	    	String account = getAccount(authJsonResponse);
	    	String user = getUserId(authJsonResponse);

	    	ClientResponse responseDelete;
	     	if ( token != null && account != null && user != null) {

	     		ClientConfig clientConfig = new DefaultClientConfig();

	     		responseDelete = Client.create (clientConfig).
	     			resource( conf.getCredential().getCiUrl() + "/aims/v1/" + account + "/users/" + user + "/access_keys/" + accessKeyId).
	     			accept( "application/json" ).
		    		type( "application/json" ).
		    		header( "x-aims-auth-token" , token ).
	     			delete(ClientResponse.class);

	     		if( responseDelete.getStatus() == 204 ){
	     			return true;
				}
	     		else {
					return false;
				}
	     	}
    	}catch(Exception e){
    		e.printStackTrace();
    	}

     	return false;
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
}
