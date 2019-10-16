Cloud Insight Add-on for JIRA
=============================

The Cloud Insight Add-on for JIRA integrates Cloud Insight remediations as JIRA issues, which allows you to configure, manage, and assign issues to JIRA teams. JIRA team members can use the add-on to review, and then dispose assigned remediations.

## Supported JIRA Versions
 * 7.0.0 the download link [jar file](https://github.com/alertlogic/ci_jira/tree/for_jira_version_7/download)

## Add-on Install User Guide

See [Install user guide here](INSTALL.md).

## Add-on Developer Environment Installation

Configure the environment as directed in the follow guide:
https://developer.atlassian.com/docs/getting-started/set-up-the-atlassian-plugin-sdk-and-build-a-project

* In the console, run the following command: 
    `atlas-mvn eclipse:eclipse`
* Open the Eclipse IDE, and import the project.
* In the Eclipse IDE, select "project" -> "clean."
* In the Eclipse IDE, select "project" -> "build project."
* In the eclipse IDE, select "project" -> "build automatically."
* In the console, run the following command:
    `atlas-run`

## Other commands:

* `atlas-run`: installs this add-on into the product, and starts it on localhost
* `atlas-debug`: same as `atlas-run,` and allows a debugger to attach at port 5005
* `atlas-cli`: after `atlas-run` or `atlas-debug,` this command opens a Maven command line window: `pi` reinstalls the add-on into the running product instance
* `atlas-help`: displays a description of all commands in the SDK.

The BSD License (BSD), Copyright (c) 2016 - Alert Logic
