package com.alertlogic.plugins.jira.cloudinsight.service;

import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.alertlogic.plugins.jira.cloudinsight.entity.PluginConfig;
import com.sun.jersey.api.client.Client;
import com.sun.jersey.api.client.ClientResponse;
import com.sun.jersey.api.client.config.DefaultClientConfig;

/**
 * This class is for the communication with the API of Cloud Insight
 * Something servlets or listeners going to call this for authentication.
 */
public class AIMSService {

	private static final Logger log = LoggerFactory.getLogger(AIMSService.class);
	public static final String API_VERSION = "v1";

	public PluginConfigService pluginConfigService;

	public AIMSService( PluginConfigService pluginConfigService )
	{
		this.pluginConfigService = pluginConfigService;
	}

	/**
	 * Authenticates to CI and return the data.
	 * @return JSONObject	The response of the authentication with an extra endpoint data.
	 */
    public JSONObject ciAuthentication(){

    	PluginConfig conf;

     	if ( pluginConfigService.hasConfiguration() ) {

     		conf = pluginConfigService.getConfiguration();
     		String authorizationHeader = "Basic "+ pluginConfigService.encode( conf.getCiUser() + ":" + pluginConfigService.decode( conf.getCiPassword() ) );
     		ClientResponse response = Client.create(new DefaultClientConfig()).
	    		resource(conf.getCiUrl()+"/aims/"+API_VERSION+"/authenticate").accept("application/json").
	    		type("application/json").
	    		header("Authorization", authorizationHeader).
	    		post(ClientResponse.class);

     		if ( response.getStatus() == 200 ) {
     			JSONObject jsonObj = new JSONObject( response.getEntity(String.class) );
     			jsonObj.put("endpoint", conf.getCiUrl());
     			log.debug("CI Plugin: the authentication is valid ");
     			return jsonObj;
     		}

     	} else {
     		log.error("CI Plugin: Error retrieving plugin configuration");
     	}

     	return null;
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
