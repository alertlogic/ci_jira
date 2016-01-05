package com.alertlogic.plugins.jira.cloudinsight.entity;

import net.java.ao.Entity;
import net.java.ao.Preload;

@Preload
public interface Filter extends Entity{

    void setKey(String key);

    String getKey();

    void setRule(RuleConfig rule);

    RuleConfig getRule();
}
