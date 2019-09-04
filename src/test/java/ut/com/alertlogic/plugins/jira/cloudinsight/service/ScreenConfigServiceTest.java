package ut.com.alertlogic.plugins.jira.cloudinsight.service;

import static org.junit.Assert.*;

import java.util.ArrayList;
import java.util.List;

import org.junit.Before;
import org.junit.Ignore;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mockito;
import org.mockito.runners.MockitoJUnitRunner;

import com.alertlogic.plugins.jira.cloudinsight.service.ScreenConfigService;
import com.atlassian.jira.avatar.AvatarManager;
import com.atlassian.jira.config.ConstantsManager;
import com.atlassian.jira.config.IssueTypeManager;
import com.atlassian.jira.exception.CreateException;
import com.atlassian.jira.issue.CustomFieldManager;
import com.atlassian.jira.issue.context.JiraContextNode;
import com.atlassian.jira.issue.customfields.CustomFieldSearcher;
import com.atlassian.jira.issue.customfields.CustomFieldType;
import com.atlassian.jira.issue.fields.CustomField;
import com.atlassian.jira.issue.fields.MockCustomField;
import com.atlassian.jira.issue.fields.config.FieldConfigScheme;
import com.atlassian.jira.issue.fields.config.MockFieldConfigScheme;
import com.atlassian.jira.issue.fields.config.manager.FieldConfigSchemeManager;
import com.atlassian.jira.issue.fields.config.manager.IssueTypeSchemeManager;
import com.atlassian.jira.issue.fields.screen.FieldScreenManager;
import com.atlassian.jira.issue.fields.screen.FieldScreenScheme;
import com.atlassian.jira.issue.fields.screen.FieldScreenSchemeManager;
import com.atlassian.jira.issue.fields.screen.issuetype.IssueTypeScreenSchemeManager;
import com.atlassian.jira.issue.issuetype.IssueType;
import com.atlassian.sal.api.message.I18nResolver;
import com.atlassian.jira.mock.component.MockComponentWorker;
import com.atlassian.jira.mock.ofbiz.MockOfBizDelegator;
import com.atlassian.jira.model.querydsl.IssueTypeDTO;
import com.atlassian.jira.project.Project;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.spy;

@RunWith(MockitoJUnitRunner.class)
public class ScreenConfigServiceTest {

	private ScreenConfigService screenConfigServiceMock;

	private ConstantsManager constantsManager;
	private CustomFieldManager customFieldManager;
	private I18nResolver i18nResolver;
	private FieldScreenSchemeManager fieldScreenSchemeManager;
	private IssueTypeSchemeManager issueTypeSchemeManager;
	private CustomField customFieldMock;
	private IssueType issueTypeMock;
	
	@SuppressWarnings("deprecation")
	@Before
    public void setUp() throws Exception
    {

		customFieldManager = mock(CustomFieldManager.class);
		constantsManager = mock(ConstantsManager.class);
		i18nResolver = mock(I18nResolver.class);
		fieldScreenSchemeManager = mock(FieldScreenSchemeManager.class);
		issueTypeSchemeManager = mock(IssueTypeSchemeManager.class);
		
		FieldScreenManager fieldScreenManager = mock(FieldScreenManager.class);
		IssueTypeScreenSchemeManager issueTypeScreenSchemeManager = mock(IssueTypeScreenSchemeManager.class);		
		IssueTypeManager issueTypeManager = mock(IssueTypeManager.class);
		FieldConfigSchemeManager fieldConfigSchemeManager = mock(FieldConfigSchemeManager.class);

		AvatarManager avatarManager = mock(AvatarManager.class);
		
		new MockComponentWorker()
		.addMock(ConstantsManager.class,constantsManager)
		.addMock(IssueTypeSchemeManager.class,issueTypeSchemeManager)
		.addMock(AvatarManager.class,avatarManager)
		.init();
		
		ScreenConfigService screenConfigService = new ScreenConfigService(
			 customFieldManager,
			 fieldScreenManager,
			 fieldScreenSchemeManager,
			 issueTypeScreenSchemeManager,
			 constantsManager,
			 issueTypeManager,
			 i18nResolver,
			 fieldConfigSchemeManager
			);

		screenConfigServiceMock = spy(screenConfigService);
		
		customFieldMock = new MockCustomField("1","name test", null);
    }

	@Ignore
	public void testCreateCustomField() throws Exception {

		when( customFieldManager.getCustomFieldObjectByName(
				Mockito.anyString() )).thenReturn(null);

		when( customFieldManager.createCustomField(
				Mockito.anyString(),
				Mockito.anyString(),
				Mockito.any(CustomFieldType.class),
				Mockito.any(CustomFieldSearcher.class),
				Mockito.anyList(),
				Mockito.anyList() ) ).thenReturn(customFieldMock);

		CustomField customField = screenConfigServiceMock.createCustomField("name test","type","search");

		assertEquals(customField.getName(),customFieldMock.getName());
		//assertEquals(customField.getDescription(),customFieldMock.getDescription());
	}

	@Ignore
	public void testGetRemediationItemCustomField() throws Exception {
		when(i18nResolver.getText("ci.constant.custom.remediationItem")).thenReturn("Remediation Item");

		verify(screenConfigServiceMock, never()).createCustomField(
				 "Remediation Item",
				 "com.atlassian.jira.plugin.system.customfieldtypes:readonlyfield",
				 "com.atlassian.jira.plugin.system.customfieldtypes:textsearcher"
				);

		screenConfigServiceMock.assigValuesToVariables();
		screenConfigServiceMock.getRemediationItemCustomField();

		verify(screenConfigServiceMock, times(1)).createCustomField(
				"Remediation Item",
				 "com.atlassian.jira.plugin.system.customfieldtypes:readonlyfield",
				 "com.atlassian.jira.plugin.system.customfieldtypes:textsearcher"
				);
	}

	@Ignore
	public void testGetGroupCustomField() throws Exception {
		when(i18nResolver.getText("ci.constant.custom.groupAssigned")).thenReturn("Group Assigned");

		verify(screenConfigServiceMock, never()).createCustomField(
				 "Group Assigned",
				 "com.atlassian.jira.plugin.system.customfieldtypes:grouppicker",
				 "com.atlassian.jira.plugin.system.customfieldtypes:textsearcher"
				);

		screenConfigServiceMock.assigValuesToVariables();
		screenConfigServiceMock.getGroupCustomField();

		verify(screenConfigServiceMock, times(1)).createCustomField(
				"Group Assigned",
				 "com.atlassian.jira.plugin.system.customfieldtypes:grouppicker",
				 "com.atlassian.jira.plugin.system.customfieldtypes:textsearcher"
				);
	}

	@Ignore
	public void testGetRemediationIdCustomField() throws Exception {
		when(i18nResolver.getText("ci.constant.custom.remediationId")).thenReturn("Remediation Id test");

		verify(screenConfigServiceMock, never()).createCustomField(
				 "Remediation Id test",
				 "com.atlassian.jira.plugin.system.customfieldtypes:readonlyfield",
				 "com.atlassian.jira.plugin.system.customfieldtypes:textsearcher"
				);

		screenConfigServiceMock.assigValuesToVariables();
		screenConfigServiceMock.getRemediationIdCustomField();

		verify(screenConfigServiceMock, times(1)).createCustomField(
				"Remediation Id test",
				 "com.atlassian.jira.plugin.system.customfieldtypes:readonlyfield",
				 "com.atlassian.jira.plugin.system.customfieldtypes:textsearcher"
				);
	}
	
	@Test
	public void testCreateSchema() {
		when(i18nResolver.getText("ci.constant.scheme.name")).thenReturn("Scheme");
		FieldScreenScheme fieldScreenScheme = screenConfigServiceMock.createSchema("KEY");

		assertEquals(fieldScreenScheme.getName(),"KEY : Scheme");
	}

	@Ignore
	public void testCreateIssueType() throws CreateException {
	
		when( constantsManager.insertIssueType(
				Mockito.anyString(),
				Mockito.anyLong(),
				Mockito.anyString(),
				Mockito.anyString(),
				Mockito.anyLong() ) ).thenReturn(issueTypeMock);
		IssueType issueType= screenConfigServiceMock.createIssueType( "issue type name test","description test");

		assertEquals(issueType.getDescription(), issueTypeMock.getDescription());
		assertEquals(issueType.getName(), issueTypeMock.getName());
		assertEquals(issueType.getSequence(), issueTypeMock.getSequence());
	}
	
	@Test
	public void testGetIssueTypeSchema() {
		List<FieldConfigScheme> issuTypeSchemas = new ArrayList<FieldConfigScheme>();
		MockFieldConfigScheme issueTypeSchema = new  MockFieldConfigScheme();
		issueTypeSchema.setName("issue type schema test");
		issuTypeSchemas.add(issueTypeSchema);

		when(issueTypeSchemeManager.getAllSchemes()).thenReturn(issuTypeSchemas);
		
		//found the issue type schema
		FieldConfigScheme fieldConfigScheme = screenConfigServiceMock.getIssueTypeSchema("issue type schema test");

		assertEquals(fieldConfigScheme.getName(),"issue type schema test");
		
		//not found the issue type schema
		FieldConfigScheme fieldConfigSchemeNull = screenConfigServiceMock.getIssueTypeSchema("issue type schema test 2");

		assertNull(fieldConfigSchemeNull);
	}
	
	@Test
	public void testGetFieldsCreateScreen() throws Exception {
		when(screenConfigServiceMock.getRemediationItemCustomField()).thenReturn(customFieldMock);
		when(screenConfigServiceMock.getRemediationIdCustomField()).thenReturn(customFieldMock);
		when(screenConfigServiceMock.getGroupCustomField()).thenReturn(customFieldMock);
		
		String[] fields = screenConfigServiceMock.getFieldsCreateScreen();
		assertEquals(fields.length,8);
	}

	@Test
	public void testGetFieldsViewScreen() {
		String[] fields = screenConfigServiceMock.getFieldsViewScreen();
		assertEquals(fields.length,5);
	}
	
	@Ignore
	public void testHasIssueTypeConfigurated() {
		
		when(screenConfigServiceMock.getIssueTypeCI()).thenReturn(issueTypeMock);
		Project project= mock(Project.class);
		List<IssueType> issueTypes = new ArrayList<IssueType>();
		
		when(issueTypeSchemeManager.getIssueTypesForProject(project)).thenReturn(issueTypes);
		boolean hasnot = screenConfigServiceMock.hasIssueTypeConfigurated(project);
		assertFalse(hasnot);
		
		issueTypes.add(issueTypeMock);
		when(issueTypeSchemeManager.getIssueTypesForProject(project)).thenReturn(issueTypes);
		boolean has = screenConfigServiceMock.hasIssueTypeConfigurated(project);		
		assertTrue(has);	
	}
}
