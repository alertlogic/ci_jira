package com.alertlogic.plugins.jira.cloudinsight.servlet;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.util.Map;

import javax.servlet.ServletException;

import com.alertlogic.plugins.jira.cloudinsight.util.CommonJiraPluginUtils;
import com.atlassian.plugin.osgi.bridge.external.PluginRetrievalService;
import com.atlassian.sal.api.user.UserManager;
import com.atlassian.templaterenderer.TemplateRenderer;
import com.atlassian.webresource.api.assembler.PageBuilderService;
import com.google.common.collect.Maps;
/**
 * Render a servlet to show a dispose page shown
 * when the user clicks on the dispose button
 * that appears on an CI issue.
 */
@SuppressWarnings("serial")
public class CloseIncidentServlet extends HttpServlet{

    private static final String CONFIG_BROWSER_TEMPLATE = "/js/partials/CloseIncident/CloseIncident.vm";
    private TemplateRenderer templateRenderer;
    private PageBuilderService pageBuilderService;
    private PluginRetrievalService pluginRetrievalService;
    private final UserManager userManager;

    public CloseIncidentServlet(TemplateRenderer templateRenderer, PageBuilderService pageBuilderService, PluginRetrievalService pluginRetrievalService, UserManager userManager)
    {
        this.templateRenderer = templateRenderer;
        this.pageBuilderService = pageBuilderService;
        this.pluginRetrievalService = pluginRetrievalService;
        this.userManager = userManager;
    }

    /**
     * Loads the web resources required by the dispose servlet.
     */
    private void loadWebResources() {
        String pluginKey = CommonJiraPluginUtils.getPluginKey(pluginRetrievalService);

        pageBuilderService.assembler().resources().requireWebResource(pluginKey+":cloud-insight-for-jira-resources");
        pageBuilderService.assembler().resources().requireWebResource(pluginKey+":ciServices");
        pageBuilderService.assembler().resources().requireWebResource(pluginKey+":closeIncidentController");
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException
    {
        if (userManager != null) {

            if (!CommonJiraPluginUtils.isAnAuthorizedJiraUser(req, userManager)) {
                CommonJiraPluginUtils.unauthorize(res, templateRenderer);
                return;
            }

            loadWebResources();

            Map<String, Object> context = Maps.newHashMap();
            context.put("jiraIssueId",req.getParameter("id"));

            templateRenderer.render(CONFIG_BROWSER_TEMPLATE, context, res.getWriter());
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException
    {
        doGet( req, res);
    }
}