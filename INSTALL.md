Cloud Insight Add-on for JIRA - Installation and Configuration Guide
====================================================================

The Cloud Insight add-on for JIRA integrates Cloud Insight remediations as JIRA issues, which allows you to configure, manage, and assign issues to JIRA teams. JIRA team members can use the add-on to review, and then dispose assigned remediations.

##Install the Add-on

You must have **JIRA System Administrator permissions** (jira-system-administrators) to activate the "Upload add-on" link and install the add-on. 

To install the Cloud Insight add-on for JIRA, log into your JIRA account, and then perform the following steps:

1.	Click the Settings icon, and then select "Add-ons."
2.	In the left navigation pane, select "Manage add-ons."
3.	Click "Upload add-on."
4.	On the Upload add-on window, select the Cloud Insight add-on for JIRA file.
5.	Click "Upload."

##Configure the Add-on

After installation, you must add and configure accounts for one or more Cloud Insight administrators to assign issues or schedule rules in JIRA. After you add credentials, you can select any account to assign issues or schedule rules.

To add a new credential from which to choose:

1.	On the JIRA menu bar, select "Cloud Insight," and then "Add-on Configuration."  
2.	Click "Handle Credentials."
3.	In the Credentials window, enter the following information:
  *	Your Cloud Insight URL
    - UK API: `https://api.cloudinsight.alertlogic.co.uk`
    - US API: `https://api.cloudinsight.alertlogic.com`
  *	Your Cloud Insight user name
  * Your Cloud Insight password
4.	Click "Test" to verify the credentials.
5.	Click "Save."
6.  Click "Close."
  
To configure the Cloud Insight add-on for JIRA:

1.	On the JIRA menu bar, select "Cloud Insight," and then "Add-on Configuration."
2.	On the Add-on Configuration page, click the Credentials tab, and then select the account to use to assign issues or schedule rules.
3.	Click "Save."

**Note:** Ensure you select the correct administrator credential. If you assigned issues from a credential, do not delete the credential or select another, or all the issues and the rules configured by the credential are going to be broken.



##Create JIRA Cloud Insight Projects

JIRA Cloud Insight projects allow you to assign a Cloud Insight project type to projects you create specifically JIRA issues for Cloud Insight remediations. To create a Cloud Insight Project:

1.	On the JIRA menu bar, select "Projects," and then select "Create Project."
2.	On the Select Project Type screen, click "Cloud Insight Project," and then click "Next."
3.	Enter the name of the project, and then click "Submit."

Use JIRA Issues to Manage Cloud Insight Remediations
====================================================
After you configure the Cloud Insight for JIRA add-on and create one or more projects, you can create JIRA issues to assign and address Cloud Insight remediation steps. 

##Assign an Issue

To assign Cloud Insight remediation steps as JIRA issues:
	
1.	From the JIRA menu bar, click "Cloud Insight," and then select "Remediations."
2.	From the drop-down menu on the Remediations page, select a Cloud Insight environment. You can use filters on the left navigation to narrow the list of remediation steps. 
3.	Select a project, and then select the project team you want to address the remediation step.
  **Note:** You can select "No Group" to assign the issue to the project owner.
4.	Select a remediation to assign to the project team.
5.	Click "Assign." 
	
##Review Issue Details

JIRA creates an issue for each remediation step assigned to a project team. To review the issue:
	
1.	From the JIRA menu bar, click "Projects," and then select the project you created.
2.	Access the issue report, and then select an issue.
3.	Click "Details" to learn more about the issue and, if desired, to download the information details to a CSV file.
4.	Click "Close."
	
##Dispose an Issue

If you dispose an issue using the add-on, Cloud Insight marks the related remediation step as disposed. To dispose an issue:
	
1.	On the issue details page, click "Dispose."
2.	In the Dispose window, select a reason for disposal, and an expiration date for the disposal. 
3.	Type any required comments about the disposal. 
4.	Click "Dispose."

	
##Close an Issue

When you close an issue, Cloud Insight marks the related remediation step as complete. To close an issue:
	
1.	On the issue details page, click "Workflow," and then select "Close Issue."
2.	In the Close Issue window, enter the details of the solution.
3.	Click "Close Issue."


Automatic Assignment of Cloud Insight Remediation Steps as JIRA Issues Using Rules
==================================================================================
You can use rules (available with the add-on) to create JIRA issues to automatically assign Cloud Insight remediation steps. 

##Create a Rule

To create a rule:
	
1.	From the JIRA menu bar, click "Cloud Insight," and then select "Remediations."
2.	Fill the “Rule Name” field.
3.	From the drop-down menu on the Remediations page, select a Cloud Insight environment. You can use filters on the left navigation to narrow the list of remediation steps. 
4.	Select a project, and then select the project team you want to address the remediation step.
  **Note:** To assign the issue to the project owner, select "No Group." 
5.	Click “Save.” 
	

##Viewing a Rule

To view the details of a specific rule: 

1.	On the JIRA menu bar, click "Cloud Insight," and then select “Rules Configuration.”
2.	Click the row containing the rule.

##Rule States

Each rule runs periodically, and logs with the last significant execution (successfully assigned or error) and the last execution (any). You can review the logs of a rule by viewing the details of the rule. For more information about viewing rule details, see "Viewing a Rule."

Cloud Insight Add-on for JIRA includes the following rule states:

*	**Error**: The rule failed in the last execution. For example, a network service error occurred. Check the rule log for error details. If the error occurred only once, JIRA schedules the rule again.
*	**Blocked**: The rule failed twice in a row. If the rule is blocked, you can use the unblock feature to reactivate the rule. For more information about the unblock feature. see "Unblocking Rules."
*	**Success**: The rule executed successfully, but did not, necessarily produce an assignment. The the rule creates an assignment, the add-on stores the information in the log as last significant execution.
*	**Scheduled**: The rule is scheduled, and is waiting to run.
*	**Executing**: The rule is running.

##Unblocking Rules
	
If a rule fails twice in a row, JIRA marks the rule as "Blocked." To unblock a rule:

1.	On the JIRA menu bar, click "Cloud Insight," and then select “Rules Configuration.”
2.	Select a blocked rule.
3.	Click “Unblock.” 

When you unblock a rule, JIRA schedules the rule to run again. 

##Deleting Rules
	
To delete rules you no longer need:

1.	On the JIRA menu bar, click "Cloud Insight," and then select “Rules Configuration.”
2.	Select a rule.
3.	Click “Delete.” 
