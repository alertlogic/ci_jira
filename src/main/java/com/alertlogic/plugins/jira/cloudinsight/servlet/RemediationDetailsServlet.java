package com.alertlogic.plugins.jira.cloudinsight.servlet;

import java.io.IOException;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.alertlogic.plugins.jira.cloudinsight.util.CommonJiraPluginUtils;
import com.atlassian.plugin.osgi.bridge.external.PluginRetrievalService;
import com.atlassian.sal.api.user.UserManager;
import com.atlassian.templaterenderer.TemplateRenderer;
import com.atlassian.webresource.api.assembler.PageBuilderService;
import com.google.common.collect.Maps;

/**
 * This servlet shows the remediation details modal dialog,
 * that is shown when the user clicks on the view details button
 * inside a Jira CI issue.
 */
@SuppressWarnings("serial")
public class RemediationDetailsServlet extends HttpServlet{

	private static final String TEMPLATE = "/js/partials/RemediationDetails/RemediationDetails.vm";
	private TemplateRenderer templateRenderer;
	private PageBuilderService pageBuilderService;
	private PluginRetrievalService pluginRetrievalService;
	private final UserManager userManager;

	public RemediationDetailsServlet(TemplateRenderer templateRenderer, PageBuilderService pageBuilderService, PluginRetrievalService pluginRetrievalService,UserManager userManager)
	{
	    this.templateRenderer = templateRenderer;
	    this.pageBuilderService = pageBuilderService;
	    this.pluginRetrievalService = pluginRetrievalService;
	    this.userManager = userManager;
	}

	/**
	 * Loads the web resources required by servlet
	 */
	private void loadWebResources() {
		String pluginKey = CommonJiraPluginUtils.getPluginKey(pluginRetrievalService);

		pageBuilderService.assembler().resources().requireWebResource(pluginKey+":cloud-insight-for-jira-resources");
		pageBuilderService.assembler().resources().requireWebResource(pluginKey+":ciServices");
		pageBuilderService.assembler().resources().requireWebResource("com.atlassian.auiplugin:ui-experimental-expander");
		pageBuilderService.assembler().resources().requireWebResource("jira.webresources:jquery-livestamp");
		pageBuilderService.assembler().resources().requireWebResource(pluginKey+":remediationDetailsController");
	}

	@Override
	protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException
	{
    	if (userManager != null) {

			if (!CommonJiraPluginUtils.isAnAuthorizedJiraUser(req, userManager)) {
				CommonJiraPluginUtils.unauthorize(resp, templateRenderer);
				return;
		    }

	    	loadWebResources();

	        resp.setContentType("text/html");
	        Map<String, Object> context = Maps.newHashMap();
	        context.put("jiraIssueId",req.getParameter("id"));

	        templateRenderer.render( TEMPLATE, context, resp.getWriter());
    	}
	}

	@Override
	protected void doPost(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException
	{
		doGet( req, res);
	}
}