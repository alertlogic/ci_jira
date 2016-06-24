package com.alertlogic.plugins.jira.cloudinsight.servlet;

import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.ServletException;
import javax.servlet.ServletInputStream;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONArray;
import org.json.JSONObject;

import com.alertlogic.plugins.jira.cloudinsight.entity.Permission;
import com.alertlogic.plugins.jira.cloudinsight.service.PermissionService;
import com.alertlogic.plugins.jira.cloudinsight.util.CommonJiraPluginUtils;
import com.atlassian.sal.api.user.UserManager;
import com.atlassian.templaterenderer.TemplateRenderer;
import com.atlassian.webresource.api.assembler.PageBuilderService;

/**
 * This servlet is for providing the basic operation
 * for handle the permissions configuration
 */
@SuppressWarnings("serial")
public class PermissionConfigurationServlet extends HttpServlet{

    private final UserManager userManager;
    private TemplateRenderer templateRenderer;
	private PermissionService permissionService;

	public PermissionConfigurationServlet(UserManager userManager,PermissionService permissionService, PageBuilderService pageBuilderService)
    {
    	this.userManager = userManager;
    	this.permissionService = permissionService;
    }

    /**
     * Get the page of rules configuration
     */
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException
    {
    	if (userManager != null) {

        	userManager.getRemoteUsername(req);

            if (!CommonJiraPluginUtils.isAnAuthorizedJiraUser(req, userManager)) {
                CommonJiraPluginUtils.unauthorize(res, templateRenderer);
                return;
            }

            try{
            	JSONArray permissionsArray = permissionService.getPermmisionsJSON();
            	if( permissionsArray != null ){
		            res.setContentType("application/json");
		            PrintWriter out = res.getWriter();
		            out.print(permissionsArray.toString());
		            out.flush();
            	}
            	else{
            		res.setContentType("application/json");
		            PrintWriter out = res.getWriter();
		            out.print("[]");
		            out.flush();
            	}
            }
            catch(Exception e){
            	e.printStackTrace();
            	res.sendError(HttpServletResponse.SC_BAD_GATEWAY);
            }
        }
    }

    /**
     * Get the rules in json
     */
    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException
    {
    	doGet(req,res);
    }

    /**
     * Add a group to the permissions list
     */
    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException
    {
    	if (userManager != null) {

    		if (!CommonJiraPluginUtils.isAnAuthorizedJiraUser(req, userManager)) {
				CommonJiraPluginUtils.unauthorize(res, templateRenderer);
				return;
		    }
    		try{
	    		ServletInputStream inputStream = req.getInputStream();
	    		String string = CommonJiraPluginUtils.convertStreamToString(inputStream);
	    		JSONObject jsonArray= new JSONObject(string);
	    		String group = jsonArray.getString("group");

	    		Permission permission = permissionService.assignPermission(group);

		    	String outJson  =  new JSONObject().put( "permissions", permission ).toString();

				if (outJson != null) {
					res.setContentType("application/json");
					PrintWriter out = res.getWriter();
					out.print(outJson);
					out.flush();

				} else {
					res.sendError(HttpServletResponse.SC_BAD_GATEWAY);
				}
    		}
    		catch(Exception e){
    			res.sendError(HttpServletResponse.SC_BAD_REQUEST);
    		}
    	}
    }

    /**
     * Remove  a group to the permission list
     */
    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException 
    {
    	if (userManager != null) {

    		if (!CommonJiraPluginUtils.isAnAuthorizedJiraUser(req, userManager)) {
				CommonJiraPluginUtils.unauthorize(res, templateRenderer);
				return;
		    }
    		try{
    			ServletInputStream inputStream = req.getInputStream();
    			String string = CommonJiraPluginUtils.convertStreamToString( inputStream );
    			JSONObject jsonArray = new JSONObject( string );

	    		int id = (int) jsonArray.getInt( "id" );

	    		if ( permissionService.removePermision( id ) ) {
					res.setContentType( "application/json" );
					JSONObject obj = new JSONObject();
					obj.put( "success" , "true" );
					res.getWriter().write(obj.toString());
				} else {
					res.sendError(HttpServletResponse.SC_EXPECTATION_FAILED);
				}
    		}
    		catch(Exception e){
    			res.sendError(HttpServletResponse.SC_BAD_REQUEST);
    		}
    	}
    }
}
