package com.alertlogic.plugins.jira.cloudinsight.service;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

import org.json.JSONArray;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.alertlogic.plugins.jira.cloudinsight.util.RestUtil;
import com.sun.jersey.api.client.ClientResponse;
import com.sun.jersey.api.client.config.ClientConfig;
import com.sun.jersey.api.client.config.DefaultClientConfig;
import com.sun.jersey.api.json.JSONConfiguration;

/**
 *	Service for all the remediations operations
 */
public class RemediationsService {
	private static final Logger log = LoggerFactory.getLogger(RemediationsService.class);

	public PluginConfigService pluginConfigService;
	private RestUtil restUtil;

	public RemediationsService( PluginConfigService pluginConfigService, RestUtil restUtil )
	{
		this.pluginConfigService = pluginConfigService;
		this.restUtil = restUtil;
	}

	/**
     * This method get a remediation item data from the CI API.
     * @param 	env				The Environment ID.
     * @param 	remediationItem	The Remediation Item Key.
     * @return	JSONObject 		Get the information of a remediation item.
	 * @throws Exception
     */
    public JSONObject getRemediationItem(String env,String remediationItem, String jiraUser) throws Exception{

    	restUtil.setupAuthetication( jiraUser );
    	String urlBase = restUtil.urlEndPointAsset;
    	ClientResponse responseGetRemediationItem;

     	if ( urlBase != null && remediationItem != null)
     	{
     		urlBase += env + "/assets?asset_types=remediation-item&remediation-item.key="+remediationItem+"&optional=remediation-item";
     		responseGetRemediationItem = restUtil.get(urlBase);

     		if ( responseGetRemediationItem.getStatus() == 200 )
     		{
     			JSONObject jsonObj = new JSONObject( responseGetRemediationItem.getEntity(String.class) );
     			return jsonObj;
     		}
     		else{
     			log.error("CI Plugin:We could not find the remediation"+urlBase);
     			log.error("CI Plugin: " +responseGetRemediationItem.getStatus() );
     		}
     	}
     	return null;
    }

    /**
     * Get all the remediations items by environment
     * @param  {String} environment The environment to query
     * @throws Exception
     */
    public JSONObject getAllRemediationsItemsByEnvironment(String env ,String jiraUser ) throws Exception {
    	restUtil.setupAuthetication( jiraUser );
    	String urlBase = restUtil.urlEndPointAsset;
    	ClientResponse responseGetRemediationItem;

     	if ( urlBase != null ) {
     		urlBase += env + "/assets?asset_types=remediation-item&reduce=true&remediation-item.deleted_on=0";

     		responseGetRemediationItem = restUtil.get(urlBase);

     		if( responseGetRemediationItem.getStatus() == 200 ){
     			JSONObject jsonObj = new JSONObject( responseGetRemediationItem.getEntity(String.class) );
     			return jsonObj;
     		}
     		else{
     			log.error("CI Plugin: Error getting remediations items. Status Code ["+responseGetRemediationItem.getStatus()+"]");
     		}
     	}
     	return null;
    }

    /**
     * Get all the remediations for a specific environment.
     * CI return  remediations and the filters
     * @throws Exception
     */
    public JSONObject getAllRemediations( String environment, JSONArray filters, String jiraUser ) throws Exception {
    	restUtil.setupAuthetication( jiraUser );
    	String urlBase = restUtil.urlEndPointAsset ;
    	ClientResponse response;

     	if ( urlBase != null )
     	{
     		urlBase += environment + "/remediations";
	        String filterStringParams = getFilterStringParams(filters);
     		urlBase += filterStringParams;

     		response = restUtil.get( urlBase );

     		if ( response.getStatus() == 200 ) {

     			JSONObject jsonObj = new JSONObject( response.getEntity(String.class) );
     			return jsonObj;

     		} else {
     			log.error("CI Plugin: Error getting remediations. Resource ["+urlBase+"] Status Code ["+response.getStatus()+"]");
     		}

     	}
     	return null;
    }

    /**
     * Get the filters to be used as query params
     * @param filters	The filters to use
     * @return	String	The filters query string
     * @throws UnsupportedEncodingException
     */
    private String getFilterStringParams(JSONArray filters) throws UnsupportedEncodingException {
    	if (filters != null)
    	{
            if (filters.length() > 0)
            {
                String filterStringParams = "?";

                for (int i = 0; i < filters.length(); i++)
                {

                	JSONObject filter = filters.getJSONObject(i);

                    if( i != 0 )
                    {
                        filterStringParams +="&";
                    }

                    String filterEncoded = "";
                    String filterString = filter.getString("key");

                    filterEncoded = URLEncoder.encode(filterString,"UTF-8");

                    filterEncoded = filterEncoded.replace("%2F", "/");

                    filterStringParams += "filter="+filterEncoded;
                }

                filterStringParams += "&scope=true";

                return filterStringParams;

            }
        }
    	return "";
	}

	/**
     * Plan a set of remediations
	 * @throws Exception 
     */
    public JSONArray planRemediations( String environment, JSONArray remediationsKeys, JSONArray filters, String jiraUser) throws Exception {
    	restUtil.setupAuthetication( jiraUser );
    	String urlBase = restUtil.urlEndPointAsset;

        JSONObject payload = new JSONObject();
        payload.put( "operation", "plan_remediations");
        payload.put( "remediations", remediationsKeys);
        payload.put( "filters", filters);
        payload.put( "user_id", restUtil.userId );

    	ClientResponse responseRemediationItem;

     	if ( urlBase != null ) {

     		urlBase += environment + "/assets";
     		responseRemediationItem = restUtil.put( urlBase, payload.toString());

     		if ( responseRemediationItem.getStatus() == 201 )
     		{
     			JSONArray jsonData = new JSONArray( responseRemediationItem.getEntity(String.class) );
     			return jsonData;
     		} else {
     			throw new Exception("Error getting remediations items. Status Code ["+responseRemediationItem.getStatus()+"]");
     		}
     	}

     	return null;
    }

    /**
     * This method mark as complete a remediation in CI.
     * @param env				The environment
     * @param remediationItem	The remediation item id
     * @return Boolean			True if the remediation was completed.
     * @throws Exception
     */
    public Boolean markAsComplete(String env,String remediationItem, String jiraUser) throws Exception{
    	restUtil.setupAuthetication( jiraUser );
    	String urlBase = restUtil.urlEndPointAsset;

    	JSONObject remediationsItemResponse = getRemediationItem( env, remediationItem, jiraUser);
    	String status = getStatusRemediationItem( remediationsItemResponse , remediationItem);
 		log.debug("CI Plugin: Status CI : "+status);

    	ClientResponse responseMarkasComplete;

     	if ( urlBase != null && (status.equals("planned") || status.equals("incomplete"))) {

     		Map<String, Object> data = new HashMap<String, Object>();
     		data.put("operation", "complete_remediations");
     		data.put("remediation_items", Arrays.asList( remediationItem));

     		urlBase += env + "/assets";

     		responseMarkasComplete = restUtil.put( urlBase, data);

     		log.debug("CI Plugin: Mark as complete status CI : "+responseMarkasComplete.getStatus());

     		if( responseMarkasComplete.getStatus() != 201 ){
     			log.debug("Response : "+responseMarkasComplete);
     			log.debug("Data : "+data);
     			log.debug("Url : "+urlBase);

     			return false;
			}

			if( responseMarkasComplete.getStatus() == 201 ){
				return true;
			}
     	}

     	if ( status.equals("complete")) {
     		return true;
     	}

     	return false;
    }


    /**
     * This method search the status in a remediation items response.
     * @param jsonObject 	The remediation response in json format
     * @return String 		status
     */
	public String  getStatusRemediationItem(JSONObject jsonObject, String remediationItemKey){
    	if( jsonObject != null ){
	    	JSONArray assetsArray = jsonObject.getJSONArray("assets");

	    	for(int i = 0; i < assetsArray.length(); i++)
	    	{
	    		JSONArray  remediationItems = assetsArray.getJSONArray(i);

	    		for(int j = 0; j < remediationItems.length(); j++)
	        	{
	    			JSONObject remediationItem = remediationItems.getJSONObject(j);

	    			if(remediationItem.getString("key").equals(remediationItemKey)){
	    				return remediationItem.getString("state");
	    			}
	        	}
	    	}
    	}
    	return "";
    }


    /**
     * Undispose a remediation
     * @param env				The environment
     * @param remediationItem	The remediation item to undispose
     * @return	Boolean			True if the undipose call was successfull
     * @throws Exception 
     */
    public Boolean unDipose(String env,String remediationItem, String jiraUser) throws Exception{
    	restUtil.setupAuthetication( jiraUser );
    	String urlBase = restUtil.urlEndPointAsset;

    	JSONObject remediationsItemResponse = getRemediationItem( env, remediationItem, jiraUser);
    	String status = getStatusRemediationItem( remediationsItemResponse, remediationItem );

    	ClientResponse responseUndispose;

     	if ( urlBase != null && status.equals("disposed")) {

     		Map<String, Object> data = new HashMap<String, Object>();
     		data.put("operation", "undispose_remediations");
     		data.put("remediation_items", Arrays.asList( remediationItem));

     		urlBase += env + "/assets";
     		responseUndispose = restUtil.put(urlBase, data );

     		log.debug("CI Plugin: Undipose status CI : "+responseUndispose.getStatus());

     		if( responseUndispose.getStatus() != 201 ){
     			log.debug("Response : "+responseUndispose);
     			log.debug("Data : "+data);
     			log.debug("Url : "+urlBase);

     			return false;
			}

			if( responseUndispose.getStatus() == 201 ){
				return true;
			}
     	}

     	if ( status.equals("planned") ) {
     		return true;
     	}

     	return false;
    }

    /**
     * Get the remediation keys from the remediations passed as
     * parameter.
     * @param currentRemediations	The reference to the remediations
     * @return	String[]	The array of remediations keys
     */
	public JSONArray getRemediationsKeys(JSONArray currentRemediations) {
		JSONArray remediations = new  JSONArray();

		for (int i = 0; i < currentRemediations.length(); i++)
		{
			JSONObject remediation = currentRemediations.getJSONObject(i);
			remediations.put(remediation.getString("key"));
		}

		return remediations;
	};

    /**
     * Search in a remediation description
     * @param remediationsDescriptions
     * @param remediationId
     * @return
     */
    public String getRemediationsDescriptionsById(JSONObject remediationsDescriptions, String remediationId) {
        if( remediationsDescriptions != null ){
            JSONArray remediationsArray = remediationsDescriptions.getJSONArray("remediations");

            for(int i = 0; i < remediationsArray.length(); i++)
            {
                JSONObject  remediation = remediationsArray.getJSONObject(i);

                if(remediation.getString("id").equals(remediationId)){
                    return remediation.getString("description");
                }
            }
        }
        return "";
    };

    /**
     * Get the remediations description
     * @return JSONObject with remediations descriptions
     * @throws Exception
     */
    public JSONObject getRemediationsDescriptions(String jiraUser) throws Exception {
    	restUtil.setupAuthetication( jiraUser );
    	String urlBase = restUtil.urlEndPointRemediation;

        ClientResponse response;

        if ( urlBase != null )
        {
            ClientConfig clientConfig = new DefaultClientConfig();
            clientConfig.getFeatures().put(JSONConfiguration.FEATURE_POJO_MAPPING, Boolean.TRUE);

            response = restUtil.get( urlBase );

            if ( response.getStatus() == 200 ) {

                JSONObject jsonObj = new JSONObject( response.getEntity(String.class) );
                return jsonObj;

            } else {
                throw new Exception("Error getting remediations descriptions. Status Code ["+response.getStatus()+"]");
            }

        }
        return null;
    }

}
