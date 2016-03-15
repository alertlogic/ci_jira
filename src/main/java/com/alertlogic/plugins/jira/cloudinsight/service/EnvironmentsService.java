package com.alertlogic.plugins.jira.cloudinsight.service;

import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.alertlogic.plugins.jira.cloudinsight.util.RestUtil;
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
	public RestUtil restUtil;

	public EnvironmentsService( PluginConfigService pluginConfigService, AIMSService aimsService, RestUtil restUtil)
	{
		this.pluginConfigService = pluginConfigService;
		this.aimsService = aimsService;
		this.restUtil = restUtil;
		
	}

	/**
	 * Return the environments
	 * @return
	 * @throws Exception 
	 */
	public JSONObject getAllEnvironments(String jiraUser) throws Exception{
		restUtil.setupAuthetication( jiraUser );
		String urlBase = restUtil.urlEndPointSource + "?source.type=environment";

    	ClientResponse responseGetEnvironments;

     	if ( urlBase != null)
     	{
     		ClientConfig clientConfig = new DefaultClientConfig();
     		clientConfig.getFeatures().put(JSONConfiguration.FEATURE_POJO_MAPPING, Boolean.TRUE);
     		
     		responseGetEnvironments = restUtil.get(urlBase);
     		
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
