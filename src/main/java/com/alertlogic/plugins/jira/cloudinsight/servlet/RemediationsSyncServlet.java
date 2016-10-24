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
 * This servlet shows the remediations assign sync page,
 * that allow to filter an assign remediations to teams and
 * users into Jira.
 */
@SuppressWarnings("serial")
public class RemediationsSyncServlet extends HttpServlet{

	private static final String VM_TEMPLATE = "/js/partials/RemediationSync/RemediationsSyncPage.vm";
    private TemplateRenderer templateRenderer;
    private PageBuilderService pageBuilderService;
    private PluginRetrievalService pluginRetrievalService;
    private UserManager userManager;

    public RemediationsSyncServlet(TemplateRenderer templateRenderer,PageBuilderService pageBuilderService,PluginRetrievalService pluginRetrievalService, UserManager userManager) {
	    this.templateRenderer = templateRenderer;
	    this.pageBuilderService = pageBuilderService;
	    this.pluginRetrievalService = pluginRetrievalService;
	    this.userManager = userManager;
	}

    /**
     * Loads the web resources required by the remediations sync page
     */
    private void loadWebResources() {
    	String pluginKey = CommonJiraPluginUtils.getPluginKey(pluginRetrievalService);
    	pageBuilderService.assembler().resources().requireWebResource(pluginKey+":cloud-insight-for-jira-resources");
    	pageBuilderService.assembler().resources().requireWebResource(pluginKey+":ciServices");
    	pageBuilderService.assembler().resources().requireWebResource("com.atlassian.auiplugin:aui-select2");
    	pageBuilderService.assembler().resources().requireWebResource(pluginKey+":remediationsSyncController");
    	pageBuilderService.assembler().resources().requireWebResource(pluginKey+":remediationSyncDetailsController");
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException
    {
    	if (userManager != null) {

    		if (!CommonJiraPluginUtils.isAnAuthorizedJiraAdministrator(req, userManager)) {
    			CommonJiraPluginUtils.unauthorize(resp, templateRenderer);
    			return;
    	    }

    		loadWebResources();

            resp.setContentType("text/html");
            Map<String, Object> context = Maps.newHashMap();

            String ruleId = req.getParameter("ruleId");
            if(ruleId != null){
            	context.put("ruleId",ruleId);
            }

            templateRenderer.render(VM_TEMPLATE, context, resp.getWriter());
    	}
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException
    {
    	doGet( req, resp);
    }
}