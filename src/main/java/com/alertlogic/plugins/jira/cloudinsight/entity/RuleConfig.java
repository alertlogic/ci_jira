package com.alertlogic.plugins.jira.cloudinsight.entity;

import net.java.ao.Entity;
import net.java.ao.OneToMany;
import net.java.ao.Preload;
import net.java.ao.schema.StringLength;

import java.util.Date;

/**
 * Represent a rule configuration
 * it is to store the conditions to run an automatic task
 */
@Preload
public interface RuleConfig extends Entity{

	public void setName( String name );
	public String getName();

	public int getProject();
	public void setProject( int project );

	public String getGroup();
	public void setGroup( String group );

	public String getEnvironment();
	public void setEnvironment( String environment );

	//the user should have permmissions to create issues
	public String getUser();
	public void setUser(String user);

	public Date getLastExecution();
	public void setLastExecution( Date lastExecution );

	public int getLastStatus();
	public void setLastStatus( int status );

	@StringLength(StringLength.UNLIMITED)
	public String getLastLog();
	@StringLength(StringLength.UNLIMITED)
	public void setLastLog(String lastLog);

	@StringLength(StringLength.UNLIMITED)
	public String getLastImportantLog();
	@StringLength(StringLength.UNLIMITED)
	public void setLastImportantLog(String lastImportantLog);

	@OneToMany
	public Filter[] getFilters();

}
