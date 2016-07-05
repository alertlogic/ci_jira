package com.alertlogic.plugins.jira.cloudinsight.tasks;

/**
 * The possible states of an CI Add-on Task
 */
public class TaskRuleExecutionState {
	/**
	 * Process states
	 */
	public final static int SCHEDULED = 0;//Ready to execute
	public final static int ERROR     = 1;//Something bad happened
	public final static int SUCCESS   = 2;//Execution OK
	public final static int BLOCKED   = 3;//Blocked after two continuous error states
	public final static int EXECUTING = 4;//Executing

	/**
	 * Get the canonical name of the state
	 * @param state	The state
	 * @return	String
	 */
	public static String getStateName(int state)
	{
		switch(state)
		{
			case SCHEDULED: return "Scheduled";
			case ERROR: 	return "Error";
			case SUCCESS: 	return "Success";
			case BLOCKED: 	return "Blocked";
			case EXECUTING: return "Executing";
		}
		return "";
	}
}
