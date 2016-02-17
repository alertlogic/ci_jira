
package com.alertlogic.plugins.jira.cloudinsight.servlet;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.Collection;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONArray;
import org.json.JSONObject;

import com.alertlogic.plugins.jira.cloudinsight.service.AIMSService;
import com.alertlogic.plugins.jira.cloudinsight.service.JIRAService;
import com.alertlogic.plugins.jira.cloudinsight.service.PluginConfigService;
import com.alertlogic.plugins.jira.cloudinsight.util.CommonJiraPluginUtils;
import com.atlassian.crowd.embedded.api.Group;
import com.atlassian.sal.api.user.UserManager;
import com.atlassian.templaterenderer.TemplateRenderer;
import com.sun.jersey.api.client.ClientHandlerException;

/**
 * This servlet works as a proxy between Jira and CI,
 * authenticates the user in CI, Jira is the only that
 * has access to the add-on configuration credentials so
 * this is a bypass for CI add-on web components.
 */
@SuppressWarnings("serial")
public class JiraProxiGroupsServlet extends HttpServlet{

    private final UserManager userManager;
    private TemplateRenderer templateRenderer;
    private JIRAService jiraService;
    private PluginConfigService pluginConfigService;

    public JiraProxiGroupsServlet(UserManager userManager,TemplateRenderer templateRenderer,PluginConfigService pluginConfigService,JIRAService jiraService)
    {
        this.userManager = userManager;
        this.templateRenderer = templateRenderer;
        this.pluginConfigService = pluginConfigService;
        this.jiraService = jiraService;
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException
    {
    	if (userManager != null) {

    		if (!CommonJiraPluginUtils.isAnAuthorizedJiraUser(req, userManager)) {
				CommonJiraPluginUtils.unauthorize(res, templateRenderer);
				return;
		    }
    		
    		try{
    			JSONObject ciResponse = jiraService.getGroups();
	
				if (ciResponse != null) {
					res.setContentType("application/json");
					PrintWriter out = res.getWriter();
					out.print(ciResponse);
					out.flush();
	
				} else {
					res.sendError(HttpServletResponse.SC_NOT_FOUND);
				}
    		
    		} catch (Exception exception) {
    			res.sendError(HttpServletResponse.SC_BAD_REQUEST);
			}
		}
    	
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException
    {
    	doGet( req, res);
    }
}

