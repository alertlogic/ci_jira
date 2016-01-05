Cloud Insight Add-on for Jira
=============================

The Cloud Insight add-on for Jira integrates Cloud Insight remediations as Jira issues, which allows you to configure, manage, and assign issues to Jira teams. Jira team members can use the add-on to review, and then dispose assigned remediations.

##Add-on Install User Guide

See [Install user guide here](INSTALL.md).

##Add-on Developer Environment Installation

Configure the enviroment like indicates the follow guide:
https://developer.atlassian.com/docs/getting-started/set-up-the-atlassian-plugin-sdk-and-build-a-project

* In console run the following command: 
    `atlas-mvn eclipse:eclipse`
* Open the eclipse IDE and import the project.
* In eclipse IDE select "project" -> "clean".
* In eclipse IDE select "project" -> "build project".
* In eclipse IDE select "project" -> "build automatically".
* In console run the following command:
    `atlas-run`

##Other commands:

* `atlas-run`: installs this plugin into the product and starts it on localhost
* `atlas-debug`: same as atlas-run, but allows a debugger to attach at port 5005
* `atlas-cli`: after atlas-run or atlas-debug, opens a Maven command line window: `pi` reinstalls the plugin into the running product instance
* `atlas-help`: prints description for all commands in the SDK

The MIT License (MIT), Copyright (c) 2016 - Alert Logic
