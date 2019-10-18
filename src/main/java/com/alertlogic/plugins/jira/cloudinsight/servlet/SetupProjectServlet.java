package com.alertlogic.plugins.jira.cloudinsight.servlet;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.alertlogic.plugins.jira.cloudinsight.service.ScreenConfigService;
import com.alertlogic.plugins.jira.cloudinsight.util.CommonJiraPluginUtils;
import com.atlassian.sal.api.user.UserManager;
import com.atlassian.templaterenderer.TemplateRenderer;

/**
 * This servlet setups the basic information required for a project in Jira, to allow
 * the use of CI Remediation issue types, if the project already has the workflow and
 * the issue type, then it ignores the initial setup.
 */
@SuppressWarnings("serial")
public class SetupProjectServlet extends HttpServlet{

	private static final Logger log = LoggerFactory.getLogger(SetupProjectServlet.class);

	private ScreenConfigService screenConfigService;
	private UserManager userManager;
	private TemplateRenderer templateRenderer;

	public SetupProjectServlet(ScreenConfigService screenConfigService, UserManager userManager,TemplateRenderer templateRenderer) {
		this.screenConfigService = screenConfigService;
		this.userManager = userManager;
		this.templateRenderer = templateRenderer;
	}

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException
    {
    	if (userManager != null) {
    		if (!CommonJiraPluginUtils.isAnAuthorizedJiraAdministrator(req, userManager)) {
    			CommonJiraPluginUtils.unauthorize(res, templateRenderer);
    			return;
    	    }
    	}

    	String project = req.getParameter("project");

    	if (project != null){
    		if (!project.isEmpty()) {
    			try {
					screenConfigService.configProjectById(Long.parseLong(project,10));
					res.setStatus(HttpServletResponse.SC_CREATED);
				} catch (Exception e) {
					e.printStackTrace();
					log.error(e.getMessage());
					res.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
				}
    		} else {
    			res.sendError(HttpServletResponse.SC_NO_CONTENT);
    		}
    	} else {
    		res.sendError(HttpServletResponse.SC_NO_CONTENT);
    	}
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException
    {
    	doGet( req, res);
    }
}