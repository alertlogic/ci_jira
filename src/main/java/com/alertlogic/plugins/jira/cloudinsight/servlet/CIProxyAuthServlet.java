package com.alertlogic.plugins.jira.cloudinsight.servlet;

import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONObject;

import com.alertlogic.plugins.jira.cloudinsight.service.AIMSService;
import com.alertlogic.plugins.jira.cloudinsight.service.PluginConfigService;
import com.alertlogic.plugins.jira.cloudinsight.util.CommonJiraPluginUtils;
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
public class CIProxyAuthServlet extends HttpServlet{

    private final UserManager userManager;
    private TemplateRenderer templateRenderer;
    private AIMSService aimsService;
    private PluginConfigService pluginConfigService;

    public CIProxyAuthServlet(UserManager userManager,TemplateRenderer templateRenderer,PluginConfigService pluginConfigService,AIMSService aimsService)
    {
        this.userManager = userManager;
        this.templateRenderer = templateRenderer;
        this.pluginConfigService = pluginConfigService;
        this.aimsService = aimsService;
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException
    {
    	if (userManager != null) {

    		if (!CommonJiraPluginUtils.isAnAuthorizedJiraUser(req, userManager)) {
				CommonJiraPluginUtils.unauthorize(res, templateRenderer);
				return;
		    }

    		String jiraUser = req.getParameter("user");
    		if( jiraUser == null ){
    			jiraUser = userManager.getRemoteUsername(req);
    		}

    		if(!pluginConfigService.hasConfiguration(jiraUser)){
    			res.sendError(HttpServletResponse.SC_PRECONDITION_FAILED);
    		}
    		else{

	    		try{
					JSONObject ciResponse = aimsService.ciAuthentication(jiraUser);

					if (ciResponse != null) {
						res.setContentType("application/json");
						PrintWriter out = res.getWriter();
						out.print(ciResponse);
						out.flush();

					} else {
						res.sendError(HttpServletResponse.SC_PRECONDITION_FAILED);
					}
	    		} catch (ClientHandlerException exception){
	    			//it happened when the server can not connect to the api
	    			res.sendError(HttpServletResponse.SC_BAD_GATEWAY);
	    		} catch (Exception exception) {
	    			res.sendError(HttpServletResponse.SC_UNAUTHORIZED);
				}
    		}
    	}
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException
    {
    	doGet( req, res);
    }
}
