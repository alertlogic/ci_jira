package com.alertlogic.plugins.jira.cloudinsight.util;

import com.atlassian.jira.project.template.hook.AddProjectHook;
import com.atlassian.jira.project.template.hook.ConfigureResponse;
import com.atlassian.jira.project.template.hook.ConfigureData;
import com.atlassian.jira.project.template.hook.ValidateData;
import com.atlassian.jira.project.template.hook.ValidateResponse;
import com.atlassian.jira.component.ComponentAccessor;
import com.atlassian.jira.project.Project;
import com.atlassian.jira.project.ProjectManager;
import com.alertlogic.plugins.jira.cloudinsight.service.ScreenConfigService;
/**
 * This Hook is for configure a new project with specific screens.
 */
public class CustomProjectAddProjectHook implements AddProjectHook
{

	ScreenConfigService screenConfigService;

	public CustomProjectAddProjectHook(
			ScreenConfigService scs
			) {
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