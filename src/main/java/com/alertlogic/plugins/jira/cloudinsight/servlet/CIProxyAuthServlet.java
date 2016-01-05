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

    public CIProxyAuthServlet(UserManager userManager,TemplateRenderer templateRenderer,PluginConfigService pluginConfigService)
    {
        this.userManager = userManager;
        this.templateRenderer = templateRenderer;
        this.aimsService = new AIMSService(pluginConfigService);
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException
    {
    	if (userManager != null) {

    		if (!CommonJiraPluginUtils.isAnAuthorizedJiraUser(req, userManager)) {
				CommonJiraPluginUtils.unauthorize(res, templateRenderer);
				return;
		    }

			JSONObject ciResponse = aimsService.ciAuthentication();

			if (ciResponse != null) {

				res.setContentType("application/json");
				PrintWriter out = res.getWriter();
				out.print(ciResponse);
				out.flush();

			} else {
				res.sendError(HttpServletResponse.SC_BAD_GATEWAY);
			}
    	}
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException
    {
    	doGet( req, res);
    }
}
