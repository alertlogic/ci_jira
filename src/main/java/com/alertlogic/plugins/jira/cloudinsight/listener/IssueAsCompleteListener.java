package com.alertlogic.plugins.jira.cloudinsight.listener;

import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.DisposableBean;
import org.springframework.beans.factory.InitializingBean;
import com.alertlogic.plugins.jira.cloudinsight.service.JIRAService;
import com.alertlogic.plugins.jira.cloudinsight.service.RemediationsService;
import com.alertlogic.plugins.jira.cloudinsight.service.ScreenConfigService;
import com.atlassian.event.api.EventPublisher;
import com.atlassian.jira.event.issue.AbstractIssueEventListener;
import com.atlassian.jira.event.issue.IssueEvent;
import com.atlassian.jira.event.issue.IssueEventListener;
import com.atlassian.jira.issue.IssueFieldConstants;
import com.atlassian.jira.issue.fields.CustomField;
import com.atlassian.sal.api.message.I18nResolver;

/**
 * This class listen the issue workflow events, synchronizes the issue status
 * with a remediation status in Cloud Insight, based on issue events.
 */
public class IssueAsCompleteListener  extends AbstractIssueEventListener
	implements IssueEventListener, InitializingBean, DisposableBean {

	private static final Logger log = LoggerFactory.getLogger(IssueAsCompleteListener.class);
	private RemediationsService remediationService;
	private EventPublisher eventPublisher;
	private ScreenConfigService screenConfigService;
	private JIRAService jiraService;
	private final I18nResolver i18nResolver;

	/**
	 * Constructor, receives all parameters as an injection.
	 * @param eventPublisher		The EventPublisher reference
	 * @param aimsService			The AIMSService reference
	 * @param screenConfigService	The ScreenConfigService reference
	 * @param jiraService			The JiraService reference
	 * @param i18nResolver			The I18nResolver reference
	 * @param PluginConfigService	The PluginConfigService reference
	 */
	public IssueAsCompleteListener(EventPublisher eventPublisher, ScreenConfigService  screenConfigService, JIRAService jiraService, RemediationsService remediationService, I18nResolver i18nResolver) {
		this.eventPublisher = eventPublisher;
		this.screenConfigService = screenConfigService;
		this.jiraService = jiraService;
		this.i18nResolver = i18nResolver;
		this.remediationService = remediationService;
	}

	/**
	 * When the issue is closed or done  mark as complete in Cloud Insight
	 */
	@Override
	public void workflowEvent(IssueEvent issueEvent) {

		try{

			screenConfigService.assigValuesToVariables();

			//validate that the custom field has been created.
			CustomField customField = screenConfigService.getRemediationCustomFieldIfExists();
			if( customField == null ){
				return ;
			}

			//validate  that the issue have a custom field.
			if( issueEvent.getIssue().getCustomFieldValue( customField ) == null ){
				return ;
			}
			//validate that the custom field have a value.
			String remediationItem = customField.getValueFromIssue( issueEvent.getIssue() );
			if( remediationItem == null ){
				return ;
			}

			String status = issueEvent.getIssue().getStatusObject().getNameTranslation();

			//validate the status be of close or resolved
			if( status.equals(IssueFieldConstants.CLOSED_STATUS) || status.equals(IssueFieldConstants.RESOLVED_STATUS) )
			{
				String reporter = issueEvent.getIssue().getReporterUser().getName();
				try{
					String environment = remediationItem.split("/")[2].split(":")[1];
					log.debug("CI Plugin: Reporter : "+reporter);
					if (remediationService.markAsComplete( environment, remediationItem, reporter))
					{
						log.debug("CI Plugin: adding comment to issue");
						String commentMsg = i18nResolver.getText("ci.listener.markascomplete.msg.success");
						jiraService.commentIssue(issueEvent.getIssue(), issueEvent.getUser(), commentMsg);

					} else {

						JSONObject remediationsItemResponse = remediationService.getRemediationItem( environment, remediationItem, reporter);
				    	String remediationStatus = remediationService.getStatusRemediationItem( remediationsItemResponse, remediationItem );

				    	if(!remediationStatus.equals("disposed"))
						{

							log.debug("CI Plugin: adding comment to issue");
							String commentMsg = i18nResolver.getText("ci.listener.markascomplete.msg.error");
							jiraService.commentIssue(issueEvent.getIssue(), issueEvent.getUser(), commentMsg);

						}
					}
				}catch(Exception e){
					log.error("CI Plugin: error marking as complete");
					log.error("CI Plugin: "+e.toString());
					e.printStackTrace();
				}

			}

		} catch(Exception e) {
			log.error(e.toString());
			e.printStackTrace();
		}
	}

	/**
	 * When the add-on is destroyed. Unregister the listener
	 */
	@Override
	public void destroy() throws Exception {
		eventPublisher.unregister(this);
		log.debug("CI Plugin:---------Unregister listener-----");
	}

	/**
	 * When the add-on is installed. Register the listener
	 */
	@Override
	public void afterPropertiesSet() throws Exception {
		this.eventPublisher.register(this);
		log.debug("CI Plugin:---------Register CI events listener-----");
	}
}
