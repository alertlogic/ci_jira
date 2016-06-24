
package com.alertlogic.plugins.jira.cloudinsight.servlet;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import javax.servlet.ServletException;
import javax.servlet.ServletInputStream;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONArray;
import org.json.JSONObject;

import com.alertlogic.plugins.jira.cloudinsight.entity.RuleConfig;
import com.alertlogic.plugins.jira.cloudinsight.service.RuleConfigService;
import com.alertlogic.plugins.jira.cloudinsight.tasks.TaskRuleExecutionState;
import com.alertlogic.plugins.jira.cloudinsight.util.CommonJiraPluginUtils;
import com.atlassian.plugin.osgi.bridge.external.PluginRetrievalService;
import com.atlassian.sal.api.user.UserManager;
import com.atlassian.templaterenderer.TemplateRenderer;
import com.atlassian.webresource.api.assembler.PageBuilderService;
import com.google.common.collect.Maps;

/**
 * This servlet is for providing the basic operation
 * for handle the rules configuration
 */
@SuppressWarnings("serial")
public class RuleConfigurationServlet extends HttpServlet{

	private static final String VM_TEMPLATE = "/js/partials/RuleConfiguration/RuleConfigurationPage.vm";
    private PageBuilderService pageBuilderService;
    private PluginRetrievalService pluginRetrievalService;
    private final UserManager userManager;
    private TemplateRenderer templateRenderer;
	private RuleConfigService ruleConfigService;

	/**
	 * Constructor
	 * @param userManager
	 * @param templateRenderer
	 * @param ruleConfigService
	 * @param pageBuilderService
	 * @param pluginRetrievalService
	 */
    public RuleConfigurationServlet(UserManager userManager,TemplateRenderer templateRenderer,RuleConfigService ruleConfigService, PageBuilderService pageBuilderService, PluginRetrievalService pluginRetrievalService)
    {
    	this.templateRenderer = templateRenderer;
    	this.pageBuilderService = pageBuilderService;
    	this.pluginRetrievalService = pluginRetrievalService;
    	this.userManager = userManager;
    	this.ruleConfigService = ruleConfigService;
    }

    /**
     * Loads the web resources required by the remediations sync page
     */
    private void loadWebResources() {
    	String pluginKey = CommonJiraPluginUtils.getPluginKey(pluginRetrievalService);

    	pageBuilderService.assembler().resources().requireWebResource(pluginKey+":cloud-insight-for-jira-resources");
    	pageBuilderService.assembler().resources().requireWebResource(pluginKey+":ciServices");
    	pageBuilderService.assembler().resources().requireWebResource("com.atlassian.auiplugin:aui-select2");
    	pageBuilderService.assembler().resources().requireWebResource(pluginKey+":ruleConfigurationController");
    }

    /**
     * Get the page of rules configuration
     */
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException
    {
    	if (userManager != null) {

    		if (!CommonJiraPluginUtils.isAnAuthorizedJiraAdministrator(req, userManager)) {
    			CommonJiraPluginUtils.unauthorize(res, templateRenderer);
    			return;
    	    }

    		loadWebResources();

            res.setContentType("text/html");
            Map<String, Object> context = Maps.newHashMap();
            templateRenderer.render(VM_TEMPLATE, context, res.getWriter());
    	}
    }

    /**
     * Get the rules in json
     */
    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException
    {
        if (userManager != null) {

        	userManager.getRemoteUsername(req);

            if (!CommonJiraPluginUtils.isAnAuthorizedJiraUser(req, userManager)) {
                CommonJiraPluginUtils.unauthorize(res, templateRenderer);
                return;
            }

            try{
            	String option=req.getParameter("option");
            	if( option.equals("all") ){
	            	JSONArray rulesArray = ruleConfigService.getRulesConfigured();
	            	if(rulesArray!=null){
			            res.setContentType("application/json");
			            PrintWriter out = res.getWriter();
			            out.print(rulesArray.toString());
			            out.flush();
	            	}
	            	else{
	            		res.setContentType("application/json");
			            PrintWriter out = res.getWriter();
			            out.print("[]");
			            out.flush();
	            	}
            	}
            	if( option.equals("one") ){
            		int ruleId = (int) Integer.parseInt(req.getParameter("id"));
            		JSONObject ruleObject=ruleConfigService.getRuleByIdJSON(ruleId);
            		if(ruleObject!=null){
			            res.setContentType("application/json");
			            PrintWriter out = res.getWriter();
			            out.print(ruleObject.toString());
			            out.flush();
	            	}
	            	else{
	            		res.setContentType("application/json");
			            PrintWriter out = res.getWriter();
			            out.print("{}");
			            out.flush();
	            	}
            	}

            }
            catch(Exception e){
            	e.printStackTrace();
            	res.sendError(HttpServletResponse.SC_BAD_GATEWAY);
            }
        }
    }

    /**
     * Create new rules or unblocked
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
	    		String option = jsonArray.getString("option");

	    		if( option.equals("unblock") ){
	    			int id = jsonArray.getInt("id");
	    			boolean result = ruleConfigService.updateLog(id, "", null, TaskRuleExecutionState.SCHEDULED);

	    			if (result) {
						res.setContentType("application/json");
						PrintWriter out = res.getWriter();
						out.print(result);
						out.flush();

					} else {
						res.sendError(HttpServletResponse.SC_BAD_REQUEST);
					}
	    		}
	    		if( option.equals("create") ){
		    		String group = jsonArray.getString("group");
		        	String environment = jsonArray.getString("environment");
		        	String name = jsonArray.getString("name");
		        	JSONArray filtersArray = jsonArray.getJSONArray("filters");

		        	List<String> list = new ArrayList<String>();
		        	for(int i = 0; i < filtersArray.length(); i++){
		        	    list.add(filtersArray.getString(i));
		        	}
		        	String[] filters= list.toArray(new String[list.size()]);
		        	int project = (int) jsonArray.getInt("project");

		        	String userName = userManager.getRemoteUsername(req);

		        	RuleConfig rule = ruleConfigService.createRule(group, project, name, environment, filters, userName);

		    		String rulesJson  =  new JSONObject().put( "rules", rule ).toString();

					if (rulesJson != null) {
						res.setContentType("application/json");
						PrintWriter out = res.getWriter();
						out.print(rulesJson);
						out.flush();

					} else {
						res.sendError(HttpServletResponse.SC_BAD_GATEWAY);
					}
	    		}
	    		if( option.equals("update") ){
	    			int id = jsonArray.getInt("id");
		    		String group = jsonArray.getString("group");
		        	String environment = jsonArray.getString("environment");
		        	String name = jsonArray.getString("name");
		        	JSONArray filtersArray = jsonArray.getJSONArray("filters");

		        	List<String> list = new ArrayList<String>();
		        	for(int i = 0; i < filtersArray.length(); i++){
		        	    list.add(filtersArray.getString(i));
		        	}
		        	String[] filters= list.toArray(new String[list.size()]);
		        	int project = (int) jsonArray.getInt("project");

		        	String userName = userManager.getRemoteUsername(req);

		        	boolean result = ruleConfigService.updateRule(id, group, project, name, environment, filters, userName);

		        	if (result) {
						res.setContentType("application/json");
						PrintWriter out = res.getWriter();
						out.print(result);
						out.flush();

					} else {
						res.sendError(HttpServletResponse.SC_BAD_REQUEST);
					}
	    		}
    		}
    		catch(Exception e){
    			res.sendError(HttpServletResponse.SC_BAD_REQUEST);
    		}
    	}
    }

    /**
     * Delete schedules rules
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
    			String string = CommonJiraPluginUtils.convertStreamToString(inputStream);
    			JSONObject jsonArray= new JSONObject(string);

	    		int id = (int) jsonArray.getInt("id");
	    		RuleConfig rule = ruleConfigService.getRuleById( id );

	    		if( rule != null ) {
		    		if (ruleConfigService.deleteConfiguration(id)) {
						res.setContentType("application/json");
						JSONObject obj=new JSONObject();
						obj.put("success", "true");
						res.getWriter().write(obj.toString());

					} else {
						res.sendError(HttpServletResponse.SC_EXPECTATION_FAILED);
					}
	    		} else {
					res.sendError(HttpServletResponse.SC_NOT_FOUND);
				}
    		}
    		catch(Exception e){
    			res.sendError(HttpServletResponse.SC_BAD_REQUEST);
    		}
    	}
    }
}
