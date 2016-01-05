package com.alertlogic.plugins.jira.cloudinsight.util;

import com.atlassian.jira.blueprint.api.AddProjectHook;
import com.atlassian.jira.blueprint.api.ConfigureData;
import com.atlassian.jira.blueprint.api.ConfigureResponse;
import com.atlassian.jira.blueprint.api.ValidateData;
import com.atlassian.jira.blueprint.api.ValidateResponse;
import com.atlassian.jira.bc.project.ProjectService;
import com.atlassian.jira.component.ComponentAccessor;
import com.atlassian.jira.config.ConstantsManager;
import com.atlassian.jira.issue.CustomFieldManager;
import com.atlassian.jira.issue.fields.FieldManager;
import com.atlassian.jira.issue.fields.screen.FieldScreenManager;
import com.atlassian.jira.issue.fields.screen.FieldScreenSchemeManager;
import com.atlassian.jira.issue.fields.screen.issuetype.IssueTypeScreenSchemeManager;
import com.atlassian.jira.project.Project;
import com.atlassian.jira.project.ProjectManager;
import com.alertlogic.plugins.jira.cloudinsight.service.ScreenConfigService;

/**
 * This Hook is for configure a new project with specific screens.
 */
public class CustomProjectAddProjectHook implements AddProjectHook
{

	FieldManager fieldManager;
	IssueTypeScreenSchemeManager issueTypeScreenSchemeManager;
	ScreenConfigService screenConfigService;

	public CustomProjectAddProjectHook(
			CustomFieldManager customFieldManager,
			FieldScreenManager fieldScreenManager,
			ProjectService projectService,
			FieldScreenSchemeManager fieldScreenSchemeManager,
			FieldManager fieldManager,
			IssueTypeScreenSchemeManager issueTypeScreenSchemeManager,
			ConstantsManager constantsManager,
			ScreenConfigService scs
			) {

		this.fieldManager= fieldManager;
		this.issueTypeScreenSchemeManager=issueTypeScreenSchemeManager;
		this.screenConfigService=scs;
	}

    @Override
    public ValidateResponse validate(final ValidateData validateData)
    {
        ValidateResponse validateResponse = ValidateResponse.create();

        return validateResponse;
    }

    @Override
    public ConfigureResponse configure(final ConfigureData configureData)
    {
        ProjectManager projectManager = ComponentAccessor.getProjectManager();
        Project myProject = projectManager.getProjectByCurrentKey(configureData.project().getKey());

    	try {
    		screenConfigService.createProjectConfigurationTemplate(myProject);
		} catch (Exception e) {
			e.printStackTrace();
		}

    	ConfigureResponse configureResponse = ConfigureResponse.create().setRedirect("/browse/" + configureData.project().getKey());

        return configureResponse;
    }
}