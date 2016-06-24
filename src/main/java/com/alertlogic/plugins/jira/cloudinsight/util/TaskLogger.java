package com.alertlogic.plugins.jira.cloudinsight.util;

import java.util.Date;

/**
 * Stores a simple log format with date and new line,
 * this format is used as the rule log after an execution.
 */
public class TaskLogger {

	private String logString;

	public TaskLogger()
	{
		logString = "";
	}

	public void log(String message)
	{
		logString += "[" + new Date() +"] "+ message + "\n";
	}

	public String toString(){
		return logString;
	}
}
