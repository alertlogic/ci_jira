package com.alertlogic.plugins.jira.cloudinsight.service;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import org.ofbiz.core.entity.GenericEntityException;
import org.ofbiz.core.entity.GenericValue;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.atlassian.jira.avatar.Avatar;
import com.atlassian.jira.component.ComponentAccessor;
import com.atlassian.jira.config.ConstantsManager;
import com.atlassian.jira.config.IssueTypeManager;
import com.atlassian.jira.exception.CreateException;
import com.atlassian.jira.issue.CustomFieldManager;
import com.atlassian.jira.issue.IssueFieldConstants;
import com.atlassian.jira.issue.context.GlobalIssueContext;
import com.atlassian.jira.issue.context.JiraContextNode;
import com.atlassian.jira.issue.context.manager.JiraContextTreeManager;
import com.atlassian.jira.issue.customfields.CustomFieldUtils;
import com.atlassian.jira.issue.fields.ConfigurableField;
import com.atlassian.jira.issue.fields.CustomField;
import com.atlassian.jira.issue.fields.FieldManager;
import com.atlassian.jira.issue.fields.config.FieldConfigScheme;
import com.atlassian.jira.issue.fields.config.manager.FieldConfigSchemeManager;
import com.atlassian.jira.issue.fields.screen.FieldScreen;
import com.atlassian.jira.issue.fields.screen.FieldScreenImpl;
import com.atlassian.jira.issue.fields.screen.FieldScreenManager;
import com.atlassian.jira.issue.fields.screen.FieldScreenScheme;
import com.atlassian.jira.issue.fields.screen.FieldScreenSchemeImpl;
import com.atlassian.jira.issue.fields.screen.FieldScreenSchemeItemImpl;
import com.atlassian.jira.issue.fields.screen.FieldScreenSchemeManager;
import com.atlassian.jira.issue.fields.screen.FieldScreenTab;
import com.atlassian.jira.issue.fields.screen.issuetype.IssueTypeScreenScheme;
import com.atlassian.jira.issue.fields.screen.issuetype.IssueTypeScreenSchemeEntity;
import com.atlassian.jira.issue.fields.screen.issuetype.IssueTypeScreenSchemeEntityImpl;
import com.atlassian.jira.issue.fields.screen.issuetype.IssueTypeScreenSchemeImpl;
import com.atlassian.jira.issue.fields.screen.issuetype.IssueTypeScreenSchemeManager;
import com.atlassian.jira.issue.issuetype.IssueType;
import com.atlassian.jira.issue.operation.IssueOperations;
import com.atlassian.jira.issue.operation.ScreenableIssueOperation;
import com.atlassian.jira.project.Project;
import com.atlassian.jira.project.ProjectManager;
import com.atlassian.jira.scheme.Scheme;
import com.atlassian.jira.workflow.JiraWorkflow;
import com.atlassian.jira.workflow.WorkflowSchemeManager;
import com.atlassian.sal.api.message.I18nResolver;

/**
 * Create an screen and associate it to a project.
 */
public class ScreenConfigService {

    private final CustomFieldManager customFieldManager;
    private final FieldScreenManager fieldScreenManager;
    private final ConstantsManager constantsManager;
    private final FieldScreenSchemeManager fieldScreenSchemeManager;
    private final IssueTypeScreenSchemeManager issueTypeScreenSchemeManager;
    private final I18nResolver i18n;
    private String GENERIC_NAME_SCREEN;
    private String REMEDIATION_ITEM_CUSTOM_FIELD_NAME;
	private String REMEDIATION_ID_CUSTOM_FIELD_NAME;
	private String GROUP_CUSTOM_FIELD_NAME;
	private static final Logger log = LoggerFactory.getLogger(ScreenConfigService.class);
	private FieldConfigSchemeManager  fieldConfigSchemeManager;
	private final IssueTypeManager issueTypeManager;

	public ScreenConfigService(
			CustomFieldManager customFieldManager,
			FieldScreenManager fieldScreenManager,
			FieldScreenSchemeManager fieldScreenSchemeManager,
			IssueTypeScreenSchemeManager issueTypeScreenSchemeManager,
			ConstantsManager constantsManager,
			IssueTypeManager issueTypeManager,
			I18nResolver i18n,
			FieldConfigSchemeManager  fieldConfigSchemeManager
			) {
		this.customFieldManager = customFieldManager;
        this.fieldScreenManager = fieldScreenManager;
        this.fieldScreenSchemeManager = fieldScreenSchemeManager;
		this.issueTypeScreenSchemeManager = issueTypeScreenSchemeManager;
		this.constantsManager = constantsManager;
		this.issueTypeManager = issueTypeManager;
		this.i18n = i18n;
		this.fieldConfigSchemeManager = fieldConfigSchemeManager;
	}

	/**
	 * Creates a custom field or get if exists.
	 * @param name			The name of the custom field
	 * @param type			The type of the custom field
	 * @param search		The search key to find the custom field
	 * @return	CustomField The custom field
	 * @throws Exception
	 */
	public CustomField createCustomField( String name, String  type, String search) throws Exception{
		CustomField existField = customFieldManager.getCustomFieldObjectByName( name );

		if ( existField == null ) {
		 	//Create a list of issue types for which the custom field needs to be available
	        List<IssueType> issueTypes = new ArrayList<IssueType>();
	        issueTypes.add(null);

	        //Create a list of project contexts for which the custom field needs to be available
	        List<JiraContextNode> contexts = new ArrayList<JiraContextNode>();
	        contexts.add(GlobalIssueContext.getInstance());

			CustomField customField = customFieldManager.createCustomField(
					name,
					null,//Description to show on the forms (null to hide)
					this.customFieldManager.getCustomFieldType( type ),
					this.customFieldManager.getCustomFieldSearcher( search ),
		            contexts, issueTypes);
			return customField;
		}
		return existField;
	}

	/**
	 * Get a remediation item Custom Field (create or get)
	 * @return	CustomField	The custom field to return
	 * @throws Exception
	 */
	public CustomField getRemediationItemCustomField() throws Exception{
		return createCustomField(REMEDIATION_ITEM_CUSTOM_FIELD_NAME,
				 "com.atlassian.jira.plugin.system.customfieldtypes:readonlyfield",
				 "com.atlassian.jira.plugin.system.customfieldtypes:textsearcher");
	}

	/**
	 * Get a remediation Custom Field (create or get)
	 * @return	CustomField	The custom field to return
	 * @throws Exception
	 */
	public CustomField getGroupCustomField() throws Exception{
		return createCustomField(GROUP_CUSTOM_FIELD_NAME,
				 "com.atlassian.jira.plugin.system.customfieldtypes:grouppicker",
				 "com.atlassian.jira.plugin.system.customfieldtypes:textsearcher");
	}

	/**
	 * Get a remediation Custom Field (create or get)
	 * @throws GenericEntityException
	 * @return CustomField
	 */
	public CustomField getRemediationIdCustomField() throws Exception{
		return createCustomField(REMEDIATION_ID_CUSTOM_FIELD_NAME,
				 "com.atlassian.jira.plugin.system.customfieldtypes:readonlyfield",
				 "com.atlassian.jira.plugin.system.customfieldtypes:textsearcher");
	}

	/**
	 * Get a remediation Custom Field (only if it exits)
	 * @return	CustomField The custom field to return
	 * @throws Exception
	 */
	public CustomField getRemediationCustomFieldIfExists() throws Exception{
		return customFieldManager.getCustomFieldObjectByName(REMEDIATION_ITEM_CUSTOM_FIELD_NAME);
	}

	/**
	 * Create a new screen
	 * @param name 		The name of the screen
     * @param fields 	The fields to add to the screen
     * @return FieldScreen	The field screen to return
     */
	public FieldScreen createScreen(String name, String[] fields){

		FieldScreen myScreen = new FieldScreenImpl(fieldScreenManager);
		myScreen.setName(name);
		myScreen.store();

		FieldScreenTab myTab = myScreen.addTab("admin.field.screen.default");

		for(String fieldId : fields)
	    {
			myTab.addFieldScreenLayoutItem(fieldId);
	    }

		return myScreen;
	}

	/**
	 * Create a new schema
	 * @return FieldScreenScheme
	 */
	public FieldScreenScheme createSchema(String projectKey){

		FieldScreenScheme myScheme = new FieldScreenSchemeImpl( fieldScreenSchemeManager, null );

		myScheme.setName( projectKey +" : "+ i18n.getText("ci.constant.scheme.name") ); 
		myScheme.setDescription( i18n.getText("ci.constant.scheme.description") ); 
		myScheme.store();

		return myScheme;
	}

	/**
	 * Add screen to a schema
	 * @param FieldScreenScheme scheme
	 * @param ScreenableIssueOperation operation
	 * @param Long screenId
     */
	public void addScreenToScheme(FieldScreenScheme scheme, ScreenableIssueOperation operation, Long screenId)
    {
        FieldScreenSchemeItemImpl fieldScreenSchemeItem = new FieldScreenSchemeItemImpl(fieldScreenSchemeManager, fieldScreenManager);
        fieldScreenSchemeItem.setIssueOperation(operation);
        fieldScreenSchemeItem.setFieldScreen(fieldScreenManager.getFieldScreen(screenId));
        scheme.addFieldScreenSchemeItem(fieldScreenSchemeItem);
    }

	/**
	 * Create issue type scheme
	 * @param FieldScreenScheme scheme
	 * @param String name of issue type
	 * @param String description of issue type
	 * @return IssueTypeScreenScheme
	 */
	public IssueTypeScreenScheme createIssueTypeScreenScheme(FieldScreenScheme myScheme, String projectKey){

		IssueTypeScreenScheme myIssueTypeScreenScheme = new IssueTypeScreenSchemeImpl(issueTypeScreenSchemeManager, null);
		myIssueTypeScreenScheme.setName( projectKey + " : "+ i18n.getText("ci.constant.issuetypescreen.name")  );
		myIssueTypeScreenScheme.setDescription( i18n.getText("ci.constant.issuetypescreen.description") );
		myIssueTypeScreenScheme.store();

		IssueTypeScreenSchemeEntity myEntity = createIssueTypeScreenSchemeEntity(myScheme);
		myIssueTypeScreenScheme.addEntity( myEntity );

		return myIssueTypeScreenScheme;
	}

	/**
	 * Associate schema with project
	 * @param Project project
	 * @param IssueTypeScreenScheme issueTypeScreenScheme
	 * @return IssueTypeScreenScheme
	 */
	public void associationProjectScreen(Project myProject,IssueTypeScreenScheme myIssueTypeScreenScheme){
		issueTypeScreenSchemeManager.addSchemeAssociation(myProject, myIssueTypeScreenScheme);
	}

	/**
	 * Read the properties and assign it to constant variables
	 */
	public void assigValuesToVariables(){
		REMEDIATION_ID_CUSTOM_FIELD_NAME = i18n.getText("ci.constant.custom.remediationId");
		REMEDIATION_ITEM_CUSTOM_FIELD_NAME = i18n.getText("ci.constant.custom.remediationItem");
		GROUP_CUSTOM_FIELD_NAME = i18n.getText("ci.constant.custom.groupAssigned");
		GENERIC_NAME_SCREEN = i18n.getText("ci.constant.screen.name");
	}

	/**
	 * Get issue type Cloud insight or create if not exists
	 * @return IssueType
	 */
	public IssueType getIssueTypeCI() {
		Collection<IssueType> issueTypes = issueTypeManager.getIssueTypes();

		for(IssueType issueType : issueTypes) {
			if( issueType.getName().equals( i18n.getText("ci.constant.issuetype.name") ) ){
            	return issueType;
            }
	    }

		try{
			return createIssueType( i18n.getText("ci.constant.issuetype.name") , i18n.getText("ci.constant.issuetype.description") );
		}catch(Exception e){
			log.error("CI Plugin: Creating issue type");
		}

		return null;
	}

	/**
	 * Create issue type
	 * @param name          For name the new issue type
	 * @param description   The description of the new issue type
	 * @return IssueType
	 * @throws CreateException
	 */
	public IssueType createIssueType(String name, String description) throws CreateException {
		return ComponentAccessor.getConstantsManager().insertIssueType(
				name,
				20L,
				null,
				description,
				ComponentAccessor.getAvatarManager().getDefaultAvatarId( Avatar.Type.ISSUETYPE ) );
	}

	/**
	 * Get an issue type scheme
	 * @param name   The name to search for
	 * @return FieldConfigScheme
	 */
	public FieldConfigScheme getIssueTypeSchema( String name ){
		Collection<FieldConfigScheme> issuTypeSchemas = ComponentAccessor.getIssueTypeSchemeManager().getAllSchemes();

		for(FieldConfigScheme issuTypeSchema : issuTypeSchemas){
			if( issuTypeSchema.getName().equals(name) ){
				return issuTypeSchema;
			}
		}

		return null;
	}

	/**
	 * Create issue type schema
	 * @param projectKey Is for create the new issue type scheme with a custom name to the project
	 * @return FieldConfigScheme return the FieldConfigScheme
	 * @throws CreateException
	 */
	public FieldConfigScheme createIssueTypeSchema(String projectKey) throws CreateException {
		IssueType issueType = getIssueTypeCI();

		List<String> issueTypeList = new ArrayList<String>();
		issueTypeList.add( issueType.getId() );
		return ComponentAccessor.getIssueTypeSchemeManager().create(
				projectKey+" : "+i18n.getText("ci.constant.issuetypeschema.name"),
				i18n.getText("ci.constant.issuetypeschema.description"), 
				issueTypeList);
	}

	/**
	 * Associate a issue type scheme with a new project
	 * @param fieldConfigScheme
	 * @param project
	 */
	public void associateIssueTypeSchemeWithProject(FieldConfigScheme fieldConfigScheme,Project project){

		FieldManager fieldManager = ComponentAccessor.getFieldManager();

		@SuppressWarnings("deprecation")
		JiraContextTreeManager jiraContextTreeManager = new JiraContextTreeManager(ComponentAccessor.getProjectManager(), constantsManager);
		@SuppressWarnings("deprecation")
		List<JiraContextNode> contexts = CustomFieldUtils.buildJiraIssueContexts(false, null, new Long[]{project.getId()}, jiraContextTreeManager);

		@SuppressWarnings("rawtypes")
		ConfigurableField configurableField = fieldManager.getConfigurableField( IssueFieldConstants.ISSUE_TYPE);
		fieldConfigScheme = fieldConfigSchemeManager.updateFieldConfigScheme( fieldConfigScheme, contexts, configurableField);

        fieldManager.refresh();
	}

	/**
	 * Return an IssueTypeScreenSchemeEntity configuring a issue type and a schema
	 * @param myScheme
	 * @return
	 */
	public IssueTypeScreenSchemeEntity createIssueTypeScreenSchemeEntity(FieldScreenScheme myScheme){

		IssueTypeScreenSchemeEntity myEntity = new IssueTypeScreenSchemeEntityImpl( 
				issueTypeScreenSchemeManager, (GenericValue) null, fieldScreenSchemeManager, constantsManager);
		IssueType issueType = getIssueTypeCI();
		myEntity.setIssueTypeId( issueType.getId() );
		myEntity.setFieldScreenScheme( myScheme );

		return myEntity;
	}

	/**
	 * Associate a new issue type with a existent project
	 * @param project
	 * @param issueTypeScheme
	 */
	public void updateIssueTypeSchemeForProject(Project project, FieldConfigScheme issueTypeScheme){
		Collection<IssueType> associatedIssueTypeIds =  ComponentAccessor.getIssueTypeSchemeManager().getIssueTypesForProject( project );

		List<String> newIssueTypes = new ArrayList<String>();

		for(IssueType associatedIssueTypeId : associatedIssueTypeIds) {
			newIssueTypes.add(associatedIssueTypeId.getId());
		}

		IssueType issueType = getIssueTypeCI();

		newIssueTypes.add(issueType.getId());

		ComponentAccessor.getIssueTypeSchemeManager().update( issueTypeScheme, newIssueTypes);
	}

	/**
	 * Return the fields necessary for a create screen
	 * @return String[] array with fields
	 */
	public String[] getFieldsCreateScreen(){
		String[] fieldsCreateScreen = new String[8];

		try {
			CustomField remediationItemCustomField = getRemediationItemCustomField();
			CustomField groupCustomField = getGroupCustomField();
			CustomField remediationIdCustomField = getRemediationIdCustomField();

			fieldsCreateScreen[0] = IssueFieldConstants.SUMMARY;
			fieldsCreateScreen[1] = IssueFieldConstants.PRIORITY;
			fieldsCreateScreen[2] = IssueFieldConstants.DESCRIPTION;
			fieldsCreateScreen[3] = IssueFieldConstants.STATUS;
			fieldsCreateScreen[4] = IssueFieldConstants.ASSIGNEE;
			fieldsCreateScreen[5] = remediationItemCustomField.getId();//250 characters is the limit
			fieldsCreateScreen[6] = remediationIdCustomField.getId();
			fieldsCreateScreen[7] = groupCustomField.getId();
			//fieldsCreateScreen[8] = IssueFieldConstants.CREATOR;

		} catch (Exception e) {
			e.printStackTrace();
			log.error("CI Plugin: get Fiel screen");
		}

		return fieldsCreateScreen;
	}

	/**
	 * Return the fields necessary for a view screen
	 * @return String[] array with fields
	 */
	public String[] getFieldsViewScreen(){

		String[] fieldsCreateScreen = new String[5];
		fieldsCreateScreen[0] = IssueFieldConstants.SUMMARY;
		fieldsCreateScreen[1] = IssueFieldConstants.PRIORITY;
		fieldsCreateScreen[2] = IssueFieldConstants.DESCRIPTION;
		fieldsCreateScreen[3] = IssueFieldConstants.STATUS;
		fieldsCreateScreen[4] = IssueFieldConstants.ASSIGNEE;

		return fieldsCreateScreen;
	}

	/**
	 * Add the default workflow to project for a CI issue type
	 * @param project	The project reference
	 */
	public void workflowConfiguration(Project project) {

		IssueType issueType = getIssueTypeCI();

		//Get the JIRA default workflow
		JiraWorkflow workflow = ComponentAccessor.getWorkflowManager().getDefaultWorkflow();

		//Configure workflow
		WorkflowSchemeManager workflowSchemeManager = ComponentAccessor.getWorkflowSchemeManager();

		//Get the workflow scheme for this project
		Scheme scheme = workflowSchemeManager.getSchemeFor(project);

        try {
        	@SuppressWarnings("deprecation")
			GenericValue schemeGV = workflowSchemeManager.getScheme(scheme.getId());
			workflowSchemeManager.addWorkflowToScheme(schemeGV, workflow.getName(),issueType.getId());
		} catch (GenericEntityException e) {
			log.error("CI Plugin: configuring workflow");
			log.error(e.getMessage());
		}
	}

	/**
	 * Review if a project has the issue type Cloud insight configured
	 * @param project
	 * @return if  a project has the issue type configured
	 */
	public boolean hasIssueTypeConfigurated(Project project) {
		IssueType issueType = getIssueTypeCI();
		Collection<IssueType> associatedIssueTypeIds =  ComponentAccessor.getIssueTypeSchemeManager().getIssueTypesForProject( project );

		for (IssueType associatedIssueType : associatedIssueTypeIds) {
			if (associatedIssueType.getId() == issueType.getId()) {
				return true;
			}
		}
		return false;
	}

	/**
	 * Add the screens to a existing project
	 * @param projectKey
	 * @throws Exception
	 */
	public void configProject(Long projectId) throws Exception{

		ProjectManager projectManager = ComponentAccessor.getProjectManager();
		Project project = projectManager.getProjectObj(projectId);

		log.debug( i18n.getText("ci.service.screen.msg.log.debug.configuring.projectid") + projectId);
		log.debug( i18n.getText("ci.service.screen.msg.log.debug.configuring.project") + project.getKey());

		if( !hasIssueTypeConfigurated(project) ){
			log.debug( i18n.getText("ci.service.screen.msg.log.debug.get.project.config") );

			FieldConfigScheme fieldConfigScheme = ComponentAccessor.getIssueTypeSchemeManager().getConfigScheme( project );
			IssueTypeScreenSchemeManager issueTypeScreenSchemeManager = ComponentAccessor.getIssueTypeScreenSchemeManager();
			IssueTypeScreenScheme issueTypeScreenScheme = issueTypeScreenSchemeManager.getIssueTypeScreenScheme(project);

			assigValuesToVariables();
			log.debug( i18n.getText("ci.service.screen.msg.log.debug.get.field") );

			String[] fieldsCreateScreen = getFieldsCreateScreen();
			String[] fieldsEditScreen = getFieldsCreateScreen();
			String[] fieldsViewScreen = getFieldsViewScreen();

			// creating screens
			log.debug( i18n.getText("ci.service.screen.msg.log.debug.create.screen") );
			FieldScreen myCreateScreen = createScreen( project.getKey() + " : " + GENERIC_NAME_SCREEN + " Create", fieldsCreateScreen);
			FieldScreen myEditSreen = createScreen( project.getKey() + " : " + GENERIC_NAME_SCREEN + " Edit", fieldsEditScreen);//the same fields
			FieldScreen myViewScreen = createScreen( project.getKey() + " : " + GENERIC_NAME_SCREEN + " View", fieldsViewScreen);

			//creating schema
			log.debug( i18n.getText("ci.service.screen.msg.log.debug.create.scheme") );
			FieldScreenScheme myScheme = createSchema( project.getKey() );

			//add screen to schema
			log.debug( i18n.getText("ci.service.screen.msg.log.debug.association.screen.scheme") );
			addScreenToScheme( myScheme, IssueOperations.CREATE_ISSUE_OPERATION, myCreateScreen.getId());
			addScreenToScheme( myScheme, IssueOperations.EDIT_ISSUE_OPERATION, myEditSreen.getId());
			addScreenToScheme( myScheme, IssueOperations.VIEW_ISSUE_OPERATION, myViewScreen.getId());

			log.debug( i18n.getText("ci.service.screen.msg.log.debug.create.entity") );
			IssueTypeScreenSchemeEntity myEntity = createIssueTypeScreenSchemeEntity(myScheme);
			issueTypeScreenScheme.addEntity( myEntity );

			log.debug( i18n.getText("ci.service.screen.msg.log.debug.update.fieldconfigscheme") );			
			updateIssueTypeSchemeForProject(project, fieldConfigScheme);

			log.debug("ci.service.screen.msg.log.debug.add.workflow");
			workflowConfiguration( project );

		}else{
			log.debug("ci.service.screen.msg.log.debug.project.configured");
		}
	}

	/**
	 * Create all the configuration for a project
	 * @param myProject		The project reference
	 */
	public void createProjectConfigurationTemplate(Project myProject) throws Exception{

		assigValuesToVariables();
		// creating issue type and schemes
		log.debug("CI Plugin: Creating issue type scheme");

		//configuring fields
		log.debug( i18n.getText("ci.service.screen.msg.log.debug.get.field") );

		String[] fieldsCreateScreen = getFieldsCreateScreen();
		String[] fieldsEditScreen = getFieldsCreateScreen();
		String[] fieldsViewScreen = getFieldsViewScreen();

		// creating screens
		log.debug( i18n.getText("ci.service.screen.msg.log.debug.create.screen") );
		FieldScreen myCreateScreen = createScreen( myProject.getKey() + " : " + GENERIC_NAME_SCREEN + " Create", fieldsCreateScreen);
		FieldScreen myEditSreen = createScreen( myProject.getKey() + " : " + GENERIC_NAME_SCREEN + " Edit", fieldsEditScreen);//the same fields
		FieldScreen myViewScreen = createScreen( myProject.getKey() + " : " + GENERIC_NAME_SCREEN + " View", fieldsViewScreen);

		//creating scheme
		log.debug( i18n.getText("ci.service.screen.msg.log.debug.create.scheme") );
		FieldScreenScheme myScheme = createSchema( myProject.getKey() );

		//add screen to schema
		log.debug( i18n.getText("ci.service.screen.msg.log.debug.association.screen.scheme") );
		addScreenToScheme( myScheme, IssueOperations.CREATE_ISSUE_OPERATION, myCreateScreen.getId());
		addScreenToScheme( myScheme, IssueOperations.EDIT_ISSUE_OPERATION, myEditSreen.getId());
		addScreenToScheme( myScheme, IssueOperations.VIEW_ISSUE_OPERATION, myViewScreen.getId());

		//Creating issue type
		log.debug( i18n.getText("ci.service.screen.msg.log.debug.create.issuetype") );
		IssueTypeScreenScheme myIssueTypeScreenScheme = createIssueTypeScreenScheme( myScheme, myProject.getKey() );

		//Association to project
		log.debug( i18n.getText("ci.service.screen.msg.log.debug.association.project.screen") );
		associationProjectScreen(myProject,myIssueTypeScreenScheme);

		FieldConfigScheme fieldConfigScheme = createIssueTypeSchema( myProject.getKey() );

		log.debug( i18n.getText("ci.service.screen.msg.log.debug.association.project.issuetype") );
		associateIssueTypeSchemeWithProject( fieldConfigScheme, myProject);
	}
}
