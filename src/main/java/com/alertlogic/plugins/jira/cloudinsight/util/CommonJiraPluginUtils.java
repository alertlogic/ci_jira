package com.alertlogic.plugins.jira.cloudinsight.util;

import java.io.IOException;
import java.io.InputStream;
import java.util.Map;
import java.util.Scanner;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.atlassian.plugin.Plugin;
import com.atlassian.plugin.osgi.bridge.external.PluginRetrievalService;
import com.atlassian.sal.api.user.UserManager;
import com.atlassian.templaterenderer.TemplateRenderer;
import com.google.common.collect.Maps;
import com.sun.jersey.core.util.Base64;

/**
 * A set of common Jira CI Add-on operations.
 */
public class CommonJiraPluginUtils {

	public final static String PLUGIN_INFO_KEY_PARAM = "plugin-key";
	public final static String UNAUTHORIZE_TEMPLATE = "/js/partials/Unauthorize/Unauthorize.vm";

	/**
	 * Returns a param available in the plugin-info tag of the JIRA plugin
	 * @param pluginRetrievalService	Object	Reference to the pluginRetrievalService
	 * @param paramName	String The name of the param
	 * @return	String the param value
	 */
	public static String getPluginInfoParam(PluginRetrievalService pluginRetrievalService, String paramName) {
		if (pluginRetrievalService != null) {
		    Plugin plugin = pluginRetrievalService.getPlugin();
		    Map<String,String> params = plugin
		      .getPluginInformation()
		      .getParameters();
			return params.get(paramName);
		}
		return null;
	}

	/**
	 * Validates if the jira user is an authorized jira administrator.
	 * @param req			The reference to the request
	 * @param userManager	The reference to the user manager
	 * @return	boolean		True if is an authorized administrator
	 */
	public static boolean isAnAuthorizedJiraAdministrator(HttpServletRequest req, UserManager userManager) {
		String jiraUser = userManager.getRemoteUsername(req);
		if (jiraUser == null || !userManager.isAdmin(jiraUser))
	    {
			return false;
	    }
		return true;
	}

	/**
	 * Returns true if the current jira user is an authorized jira user.
	 * @param req			The reference to the request
	 * @param userManager	The reference to the user manager
	 * @return
	 */
	public static boolean isAnAuthorizedJiraUser(HttpServletRequest req,UserManager userManager) {
		String jiraUser = userManager.getRemoteUsername(req);
		if (jiraUser == null) {
			return false;
		}
		return true;
	}

	/**
	 * Return the plugin key
	 * @param pluginRetrievalService	Object	Reference to the pluginRetrievalService
	 * @return	String the plugin key
	 */
	public static String getPluginKey(PluginRetrievalService pluginRetrievalService){
		return CommonJiraPluginUtils.getPluginInfoParam(
				pluginRetrievalService, CommonJiraPluginUtils.PLUGIN_INFO_KEY_PARAM);
	}

	/**
	 * Shows an unauthorized page
	 * @param res	Object reference to the HttpServletResponse
	 * @param templateRenderer	Object reference to the TemplateRenderer
	 * @throws IOException
	 */
	public static void unauthorize(HttpServletResponse res,TemplateRenderer templateRenderer) throws IOException{
        res.setContentType("text/html");
        Map<String, Object> context = Maps.newHashMap();
        templateRenderer.render(UNAUTHORIZE_TEMPLATE, context, res.getWriter());
	}

    /**
     * Convert a inputstream in a string
     * @param InputStream
     * @return String
     */
    public static String convertStreamToString(InputStream is) {
        @SuppressWarnings("resource")
		Scanner s = new Scanner(is).useDelimiter("\\A");
        return s.hasNext() ? s.next() : "";
    }

    /**
     * This function decode a string encoded as base 64.
     * @param encodedText	The string to encode
     * @return	String		The decoded string
     */
    public static String decode(String encodedText) {
    	byte[] decodedBytes = Base64.decode(encodedText);
    	return new String(decodedBytes);
    }

    /**
     * This function encode a string on base 64
     * @param text		The text to encode
     * @return	String	The encoded string
     */
    public static String encode(String text) {
    	return new String(Base64.encode(text.getBytes()));
    }
}
