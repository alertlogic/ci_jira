Cloud Insight Add-on for Jira - Installation and Configuration Guide
====================================================================

The Cloud Insight add-on for Jira integrates Cloud Insight remediations as Jira issues, which allows you to configure, manage, and assign issues to Jira teams. Jira team members can use the add-on to review, and then dispose assigned remediations.

##Install the Add-on

After you log into your Jira account, perform the following steps to install the Cloud Insight add-on for Jira:

1.	Click the Settings icon, and then select "Add-ons."
2.	In the left navigation pane, select "Manage add-ons."
3.	Click "Upload add-on."
4.	On the Upload add-on window, select the Cloud Insight add-on for Jira file.
5.	Click "Upload."

##Configure the Add-on

After installation, you must configure the add-on. To configure the Cloud Insight add-on for Jira:

1.	Under User-installed add-ons on the Jira Administration page, click to expand "jira-cloud-insight," and then click "Configure."
2.	On the Jira menu bar, click "Cloud Insight," and then select "Add-on configuration."
3.	On the Add-on Configuration page, fill out the form using the following information:
  *	Your Cloud Insight deployment URL
    - UK API: `https://api.cloudinsight.alertlogic.co.uk`
    - US API: `https://api.cloudinsight.alertlogic.com`
  *	Your Cloud Insight username
  * Your Cloud Insight password
4.	Click "Test" to verify your credentials.
5.	Click "Save."

##Create Jira Cloud Insight Projects

If you don´t want to use your existing projects (with your custom workflow or issue types) to assign Jira issues for Cloud Insight remediations, you can create a project of type "Cloud Insight Project". To create a Cloud Insight Project:

1.	On the Jira menu bar, select "Project," and then select "Create Project."
2.	On the Select Project Type screen, select "Cloud Insight Project," and then click "Next."
3.	Enter the name of the project, and then click "Submit."

Use Jira Issues to Manage Cloud Insight Remediations
====================================================
After you configure the Cloud Insight for Jira add-on and create one or more projects, you can create Jira issues to assign and address Cloud Insight remediations through Jira issues. 

##Assign an Issue

To assign Cloud Insight remediations as Jira issues:
	
1.	From the Jira menu bar, click "Cloud Insight," and then "Remediations."
2.	From the drop-down menu on the Remediations page, select a Cloud Insight environment. You can use filters on the left navigation to narrow the list of remediations. 
3.	Select a project, and then select the project team you want to address the remediation.
  **Note:** You can select "No Group" to assign the issue to the project owner.
4.	Select a remediation to assign to the project team.
5.	Click "Assign." 
	
##Review Issue Details

Jira creates an issue for each remediation task assigned to a project team. To review the issue:
	
1.	From the Jira menu bar, select "Projects," and then select the project you created.
2.	Access the issue report, and then select an issue.
3.	Click "Details" to learn more about the issue, and to download the information details to a CSV file, if desired.
4.	Click "Close."
	
##Dispose an Issue

If you dispose an issue using the add-on, Cloud Insight marks the related remediation task as disposed. To dispose an issue:
	
1.	On the issue details page, click "Dispose."
2.	In the Dispose window, select a reason for disposal, and an expiration date for the disposal. 
3.	Type any required comments about the disposal. 
4.	Click "Dispose."
	
The issue details page shows the status as Disposed.
	
##Close an Issue

When you close an issue, Cloud Insight marks the related remediation as complete. To close an issue:
	
1.	On the issue details page, click "Workflow," and then select "Close Issue."
2.	In the Close Issue window, enter the details of the solution.
3.	Click "Close Issue."
	
The issue details page shows the status as Closed.

Automatic Assignment of Cloud Insight Remediations as Jira Issues Using Rules
=================================================================================
You can create Jira issues to assign and address Cloud Insight remediations through Jira issues automatically using Rules (Available with the Add-on).

##Create a Rule
	
1.	From the Jira menu bar, click "Cloud Insight," and then "Remediations."
2.	Fill the “Rule Name” field.
3.	From the drop-down menu on the Remediations page, select a Cloud Insight environment. You can use filters on the left navigation to narrow the list of remediations. 
4.	Select a project, and then select the project team you want to address the remediation.
  **Note:** You can select "No Group" to assign the issue to the project owner.
5.	Click “Save” to store this as a new Assign Rule.
	
The remediations page shows a successfully stored rule message.

##Viewing a Rule

1.	On the Jira menu bar, click "Cloud Insight," and then select “Rules Configuration.”
2.	Click on a Rule Row to see details.

##Rules States

Each Rule runs periodically, the last important execution (successfully assign or error) and the last execution (any) are stored as logs, you can check this logs on the Rule details (see Viewing a Rule).

*	**Error**: The Rule has failed in the last execution (For example A network service error), please check the rule log for error details. If is the first time the rule fails will be scheduled once more.
*	**Blocked**: The Rule has failed twice in a row, this caused the rule to change to a Blocked state. If the rule is blocked the user can activate it back again using the unblock feature (see Unblocking Rules).
*	**Success**: The rule execution was success, but not necessary produced any assignment, if an assignment is produced this information will be stored as in the last important execution log field.
*	**Scheduled**: The rule has been scheduled and is waiting for Jira to be executed.
*	**Executing**: The rule is running.

##Unblocking Rules
	
If a Rule has failed twice in a row the Add-on marks this Rule as Blocked, to schedule again a blocked rule (Unblock) follow this steps:

1.	On the Jira menu bar, click "Cloud Insight," and then select “Rules Configuration.”
2.	Select a rule.
3.	Click “Unblock.” 

##Deleting Rules
	
If a Rule is not longer need it or simply the Rule does not apply anymore follow this steps to delete it:

1.	On the Jira menu bar, click "Cloud Insight," and then select “Rules Configuration.”
2.	Select a rule.
3.	Click “Delete.” 
