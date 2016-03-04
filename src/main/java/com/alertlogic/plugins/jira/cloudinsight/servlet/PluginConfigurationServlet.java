package com.alertlogic.plugins.jira.cloudinsight.servlet;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.util.Map;

import javax.servlet.ServletException;

import org.json.JSONObject;

import com.alertlogic.plugins.jira.cloudinsight.entity.PluginConfig;
import com.alertlogic.plugins.jira.cloudinsight.service.AIMSService;
import com.alertlogic.plugins.jira.cloudinsight.service.PluginConfigService;
import com.alertlogic.plugins.jira.cloudinsight.util.CommonJiraPluginUtils;
import com.atlassian.plugin.osgi.bridge.external.PluginRetrievalService;
import com.atlassian.sal.api.user.UserManager;
import com.atlassian.templaterenderer.TemplateRenderer;
import com.atlassian.webresource.api.assembler.PageBuilderService;
import com.google.common.collect.Maps;

import static com.google.common.base.Preconditions.checkNotNull;

/**
 * This servlet shows the CI plugin's configuration page,
 * in this page the user can store the CI credential data.
 */
@SuppressWarnings("serial")
public class PluginConfigurationServlet extends HttpServlet{

    private static final String CONFIG_BROWSER_TEMPLATE = "/js/partials/PluginConfiguration/PluginConfiguration.vm";

    private TemplateRenderer templateRenderer;
    private PageBuilderService pageBuilderService;
    private PluginRetrievalService pluginRetrievalService;

    private final PluginConfigService pluginConfigService;
    private final UserManager userManager;
    private final AIMSService aIMSService;

    public PluginConfigurationServlet(TemplateRenderer templateRenderer, PageBuilderService pageBuilderService, PluginRetrievalService pluginRetrievalService, PluginConfigService pluginConfigService, UserManager userManager, AIMSService aIMSService)
    {
        this.pluginConfigService = checkNotNull(pluginConfigService);
        this.userManager = checkNotNull(userManager);
        this.templateRenderer = templateRenderer;
        this.pageBuilderService = pageBuilderService;
        this.pluginRetrievalService = pluginRetrievalService;
        this.aIMSService = aIMSService;
    }

    /**
     * Loads the web resources required by user plugin configuration servlet.
     */
    private void loadWebResources() {
        String pluginKey = CommonJiraPluginUtils.getPluginKey(pluginRetrievalService);

        pageBuilderService.assembler().resources().requireWebResource(pluginKey+":cloud-insight-for-jira-resources");
        pageBuilderService.assembler().resources().requireWebResource(pluginKey+":ciServices");
        pageBuilderService.assembler().resources().requireWebResource(pluginKey+":pluginConfigurationController");
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException
    {
        if (userManager != null) {
            //validation user permissions
            if (!CommonJiraPluginUtils.isAnAuthorizedJiraAdministrator(req, userManager)) {
                CommonJiraPluginUtils.unauthorize(res, templateRenderer);
                return;
            }

            //load resources and show template
            loadWebResources();
            Map<String, Object> context = Maps.newHashMap();

            if (pluginConfigService.hasConfiguration()) {
                context.put( "ciUser", pluginConfigService.getConfiguration().getCiUser());
                context.put( "ciUrl", pluginConfigService.getConfiguration().getCiUrl());
                context.put( "ciAccessKeyId", pluginConfigService.getConfiguration().getCiAccessKeyId());
            }

            templateRenderer.render(CONFIG_BROWSER_TEMPLATE, context, res.getWriter());
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException
    {
        if (userManager != null) {
            //validation user permissions
            if (!CommonJiraPluginUtils.isAnAuthorizedJiraAdministrator(req, userManager)) {
                CommonJiraPluginUtils.unauthorize(res, templateRenderer);
                return;
            }

            //load resources and show template
            loadWebResources();

            //store if has data
            if( req.getParameterMap().size() > 0) {

                String jiraUser = userManager.getRemoteUsername(req);
                String ciUser = req.getParameter("ciUser");
                String ciUrl = req.getParameter("ciUrl");
                String ciAccessKeyId = req.getParameter("ciAccessKeyId");
                String ciSecretKey = req.getParameter("ciSecretKey");

                if(pluginConfigService.hasConfiguration()){
                	aIMSService.deleteAccessKeyId();
                }

                PluginConfig pluginConfig = pluginConfigService.createOrUpdateConfiguration(jiraUser, ciUser, ciUrl, ciAccessKeyId, ciSecretKey);

                if( pluginConfig != null ){
                    res.setContentType("application/json");
                    JSONObject obj=new JSONObject();
                    obj.put("success", "true");
                    res.getWriter().write(obj.toString());
                }
                else{
                    res.sendError(HttpServletResponse.SC_BAD_REQUEST);
                }
            }
        }
    }

    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException
    {
        if (userManager != null) {
            //validation user permissions
            if (!CommonJiraPluginUtils.isAnAuthorizedJiraAdministrator(req, userManager)) {
                CommonJiraPluginUtils.unauthorize(res, templateRenderer);
                return;
            }

            //load resources and show template
            loadWebResources();

            //if exist configuration delete the access key
            if(pluginConfigService.hasConfiguration()){
            	aIMSService.deleteAccessKeyId();
            }

            if( pluginConfigService.deleteConfiguration() ){
                res.setContentType("application/json");
                JSONObject obj=new JSONObject();
                obj.put("success", "true");
                res.getWriter().write( obj.toString() );
            }
            else{
                res.sendError(HttpServletResponse.SC_BAD_REQUEST);
            }

        }
    }
}