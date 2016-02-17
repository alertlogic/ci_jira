package com.alertlogic.plugins.jira.cloudinsight.entity;
import net.java.ao.Entity;
import net.java.ao.Preload;

@Preload
public interface Permission extends Entity{

	void setGroup(String grup);

    String getGroup();
}
