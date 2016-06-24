
package com.alertlogic.plugins.jira.cloudinsight.servlet;

import static com.google.common.base.Preconditions.checkNotNull;

import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.ServletException;
import javax.servlet.ServletInputStream;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONArray;
import org.json.JSONObject;

import com.alertlogic.plugins.jira.cloudinsight.entity.Credential;
import com.alertlogic.plugins.jira.cloudinsight.service.AIMSService;
import com.alertlogic.plugins.jira.cloudinsight.service.CredentialService;
import com.alertlogic.plugins.jira.cloudinsight.util.CommonJiraPluginUtils;
import com.atlassian.plugin.osgi.bridge.external.PluginRetrievalService;
import com.atlassian.sal.api.user.UserManager;
import com.atlassian.templaterenderer.TemplateRenderer;
import com.atlassian.webresource.api.assembler.PageBuilderService;

/**
 * This servlet shows the CI plugin's configuration page,
 * in this page the user can store the CI credential data.
 */
@SuppressWarnings("serial")
public class CredentialServlet extends HttpServlet{

    private TemplateRenderer templateRenderer;
    private PageBuilderService pageBuilderService;
    private PluginRetrievalService pluginRetrievalService;

    private final CredentialService credentialService;
    private final UserManager userManager;
    private final AIMSService aIMSService;

    public CredentialServlet(TemplateRenderer templateRenderer, PageBuilderService pageBuilderService, PluginRetrievalService pluginRetrievalService, CredentialService credentialService, UserManager userManager, AIMSService aIMSService)
    {
        this.credentialService = checkNotNull(credentialService);
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

        	JSONArray credentialArray = credentialService.getCredentialsJSONArray();
        	res.setContentType("application/json");
	        PrintWriter out = res.getWriter();

	        if( credentialArray != null){
	        	out.print(credentialArray.toString());
	            out.flush();
        	}
        	else{
        	    out.print("[]");
	            out.flush();
        	}
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
                String idCredential = req.getParameter("idCredential");

                int id = -1;
                if( !idCredential.equals("") ){
                	id = Integer.parseInt(idCredential);
                	Credential credentialToDelete = credentialService.getCredentialById( id );
                	aIMSService.deleteAccessKeyId( credentialToDelete );
                }

                if( credentialService.hasCredentials( ciUser ) ){
                	Credential credentialToDelete = credentialService.getCredentialByUser(ciUser );
                	aIMSService.deleteAccessKeyId( credentialToDelete );
                }

                Credential credential = credentialService.createOrUpdateCredential( id, jiraUser, ciUser, ciUrl, ciAccessKeyId, ciSecretKey);

                if( credential != null ){
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
            ServletInputStream inputStream = req.getInputStream();
			String string = CommonJiraPluginUtils.convertStreamToString(inputStream);
			JSONObject jsonArray= new JSONObject(string);

    		int id = (int) jsonArray.getInt("id");
    		Credential credential = credentialService.getCredentialById(id);
            //if exist configuration delete the access key
    		if (credentialService.canBeDeleted(id) ){
	    		if( credential != null ){
	            	aIMSService.deleteAccessKeyId( credential );
	            }

	            if( credentialService.deleteCredential(id) ){
	                res.setContentType("application/json");
	                JSONObject obj=new JSONObject();
	                obj.put("success", "true");
	                res.getWriter().write( obj.toString() );
	            }
	            else{
	                res.sendError(HttpServletResponse.SC_BAD_REQUEST);
	            }
    		}
    		else{
                res.sendError(HttpServletResponse.SC_PRECONDITION_FAILED);
            }
        }
    }
}