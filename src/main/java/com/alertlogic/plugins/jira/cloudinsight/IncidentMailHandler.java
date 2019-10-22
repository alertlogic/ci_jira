package com.alertlogic.plugins.jira.cloudinsight;

import com.atlassian.jira.service.util.handler.MessageHandler;
import com.atlassian.jira.service.util.handler.MessageHandlerContext;
import com.atlassian.jira.service.util.handler.MessageHandlerErrorCollector;

import java.util.Map;
import javax.mail.Message;
import javax.mail.MessagingException;

// https://www.programcreek.com/java-api-examples/?code=bcopy%2FJMH%2FJMH-master%2Fsrc%2Fmain%2Fjava%2Fcern%2Fenice%2Fjira%2Femailhandler%2FAdvancedCreateOrCommentHandler.java#


public class IncidentMailHandler implements MessageHandler {


    private static final String KEY_PROJECT = "project";
    private static final String KEY_ISSUETYPE = "issuetype";

    private static final String KEY_JIRAEMAIL = "jiraemail";
    private static final String KEY_JIRAALIAS = "jiraalias";

    @Override
    public void init(Map<String, String> params, MessageHandlerErrorCollector monitor) {

        if (params.containsKey(KEY_PROJECT)) {
            defaultProjectKey = (String) params.get(KEY_PROJECT);
        }

        if (params.containsKey(KEY_ISSUETYPE)) {
            defaultIssueType = (String) params.get(KEY_ISSUETYPE);
        }


        if (params.containsKey(KEY_JIRAEMAIL)) {
            jiraEmail = (String) params.get(KEY_JIRAEMAIL);
        }

        if (params.containsKey(KEY_JIRAALIAS)) {
            jiraEmailAlias = (String) params.get(KEY_JIRAALIAS);
        } else {
            jiraEmailAlias = jiraEmail;
        }


    }

    @Override
    public boolean handleMessage(Message message, MessageHandlerContext context) throws MessagingException {

        final String body = MailUtils.getBody(message);

        //extract out the link

        //add customerid to issue custom field
        //addincidentId to issue custom field


        // create issue

        context.createIssue()

        return true;
    }
}
