package com.alertlogic.plugins.jira.cloudinsight.entity;

import net.java.ao.Entity;
//this preload call Active Objects
import net.java.ao.Preload;

/**
 * POJO that represent the information used
 * in the the plugin's configuration to connect with cloud insight.
 */
@Preload
public interface PluginConfig extends Entity
{
    public void setJiraUser(String jiraUser);
    public String getJiraUser();

    public void setCiUser(String ciUser);
    public String getCiUser();

    public void setCiUrl(String ciUrl);
    public String getCiUrl();

    public void setCiAccessKeyId(String ciAccessKeyId);
    public String getCiAccessKeyId();

    public void setCiSecretKey(String setCiSecretKey);
    public String getCiSecretKey();
}
