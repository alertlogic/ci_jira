package ut.com.alertlogic.plugins.jira.cloudinsight.service;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertTrue;
import net.java.ao.EntityManager;
import net.java.ao.test.junit.ActiveObjectsJUnitRunner;
import java.util.Date;
import org.json.JSONArray;
import org.json.JSONObject;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import com.alertlogic.plugins.jira.cloudinsight.entity.Filter;
import com.alertlogic.plugins.jira.cloudinsight.entity.RuleConfig;
import com.alertlogic.plugins.jira.cloudinsight.service.RuleConfigService;
import com.alertlogic.plugins.jira.cloudinsight.tasks.TaskRuleExecutionState;
import com.atlassian.activeobjects.external.ActiveObjects;
import com.atlassian.activeobjects.test.TestActiveObjects;

@RunWith(ActiveObjectsJUnitRunner.class)
public class RuleConfigServiceTest {

	private EntityManager entityManager;
    private ActiveObjects activeObject;
    private RuleConfigService ruleConfigService;

    private String group = "gruop-jira-users";
    private int project = 1;
    private String environment = "ABCD";
    private String[] filters = new String[]{"region:oregon","aplication:ssh"};
    private String userName="admin";
    private String ruleName="rule-test";

    @Before
    public void setUp() throws Exception
    {
        assertNotNull(entityManager);
        activeObject = new TestActiveObjects(entityManager);
        ruleConfigService = new RuleConfigService(activeObject);
    }

    @SuppressWarnings("unchecked")
	@Test
    public void testCreateRule() throws Exception
    {
        activeObject.migrate(RuleConfig.class);
        activeObject.migrate(Filter.class);

        assertEquals(0, activeObject.find(RuleConfig.class).length);

        RuleConfig add = ruleConfigService.createRule(group, project, ruleName, environment, filters, userName);
        assertFalse(add.getID() == 0);

        activeObject.flushAll();

        RuleConfig[] ruleConfig = activeObject.find(RuleConfig.class);
        assertEquals(1, ruleConfig.length);
        assertEquals(group, ruleConfig[0].getGroup());
        assertEquals(project, ruleConfig[0].getProject());
        assertEquals(ruleName, ruleConfig[0].getName());
        assertEquals(environment, ruleConfig[0].getEnvironment());
        assertEquals(userName, ruleConfig[0].getUser());
        assertEquals(2, ruleConfig[0].getFilters().length);
        assertNull(ruleConfig[0].getLastExecution());
        assertNull(ruleConfig[0].getLastLog());
        assertEquals(ruleConfig[0].getLastStatus(),TaskRuleExecutionState.SCHEDULED);
        assertFalse(ruleConfig[0].getFilters().length == 0);
     }

    @SuppressWarnings("unchecked")
    @Test
    public void testUpdateRule() throws Exception
    {
    	activeObject.migrate(RuleConfig.class);
    	activeObject.migrate(Filter.class);

        assertEquals(0, activeObject.find(RuleConfig.class).length);

        RuleConfig add = ruleConfigService.createRule(group, project, ruleName, environment, filters, userName);
        assertFalse(add.getID() == 0);

        activeObject.flushAll();

        boolean resultTrue = ruleConfigService.updateLog(add.getID(), "log wirh data", new Date(), TaskRuleExecutionState.SUCCESS);
        assertTrue(resultTrue);

        RuleConfig[] ruleConfig = activeObject.find(RuleConfig.class);
        assertEquals(1, ruleConfig.length);
        assertEquals(group, ruleConfig[0].getGroup());
        assertEquals(project, ruleConfig[0].getProject());
        assertEquals(ruleName, ruleConfig[0].getName());
        assertEquals(environment, ruleConfig[0].getEnvironment());
        assertEquals(userName, ruleConfig[0].getUser());
        assertEquals(2, ruleConfig[0].getFilters().length);
        assertNotNull(ruleConfig[0].getLastExecution());
        assertNotNull(ruleConfig[0].getLastLog());
        assertEquals(ruleConfig[0].getLastStatus(),TaskRuleExecutionState.SUCCESS);

        boolean resultFalse = ruleConfigService.updateLog(-1, "log wirh data", new Date(), TaskRuleExecutionState.SUCCESS);
        assertFalse(resultFalse);
    }

    @SuppressWarnings("unchecked")
    @Test
    public void testGetRules() throws Exception
    {
        activeObject.migrate(RuleConfig.class);
        activeObject.migrate(Filter.class);
        assertNull(ruleConfigService.getRules());

        RuleConfig add = ruleConfigService.createRule(group, project, ruleName, environment, filters, userName);
        assertFalse(add.getID() == 0);

        RuleConfig[] rules = ruleConfigService.getRules();
        assertNotNull(ruleConfigService.getRules());
        assertTrue(rules.length>0);
    }

    @SuppressWarnings("unchecked")
	@Test
    public void testGetRuleById() throws Exception
    {
    	activeObject.migrate(RuleConfig.class);
        activeObject.migrate(Filter.class);

        RuleConfig add = ruleConfigService.createRule(group, project, ruleName, environment, filters, userName);
        assertFalse(add.getID() == 0);

        RuleConfig ruleConfig = ruleConfigService.getRuleById(add.getID());
        assertEquals(group, ruleConfig.getGroup());
        assertEquals(project, ruleConfig.getProject());
        assertEquals(ruleName, ruleConfig.getName());
        assertEquals(environment, ruleConfig.getEnvironment());
        assertEquals(userName, ruleConfig.getUser());
        assertEquals(2, ruleConfig.getFilters().length);
        assertNull(ruleConfig.getLastExecution());
        assertNull(ruleConfig.getLastLog());
        assertEquals(ruleConfig.getLastStatus(),TaskRuleExecutionState.SCHEDULED);
        assertFalse(ruleConfig.getFilters().length == 0);
    }

    @SuppressWarnings("unchecked")
	@Test
    public void testDeleteConfiguration() throws Exception
    {
    	activeObject.migrate(RuleConfig.class);
        activeObject.migrate(Filter.class);

        RuleConfig add = ruleConfigService.createRule(group, project, ruleName, environment, filters, userName);
        assertFalse(add.getID() == 0);
        RuleConfig[] ruleConfigBefore = activeObject.find(RuleConfig.class);
        assertTrue(ruleConfigBefore.length > 0);

        boolean result = ruleConfigService.deleteConfiguration(add.getID());
        assertTrue(result);

        RuleConfig[] ruleConfigAfter = activeObject.find(RuleConfig.class);
        assertTrue(ruleConfigAfter.length == 0);
    }

    @SuppressWarnings("unchecked")
	@Test
    public void testGetRulesConfiguredConfiguration() throws Exception
    {
    	activeObject.migrate(RuleConfig.class);
        activeObject.migrate(Filter.class);

        RuleConfig add = ruleConfigService.createRule(group, project, ruleName, environment, filters, userName);
        assertFalse(add.getID() == 0);
        RuleConfig[] ruleConfigBefore = activeObject.find(RuleConfig.class);
        assertTrue(ruleConfigBefore.length > 0);

        JSONArray jsonResult = ruleConfigService.getRulesConfigured();
        assertNotNull(jsonResult);
        assertTrue(jsonResult.length()==1);
        JSONObject jsonObj = (JSONObject) jsonResult.get(0);
        assertNotNull(jsonObj);
        assertTrue(jsonObj.has("id"));
        assertTrue(jsonObj.has("name"));
        assertTrue(jsonObj.has("environment"));
        assertTrue(jsonObj.has("project"));
        assertTrue(jsonObj.has("group"));
        assertTrue(jsonObj.has("user"));
        assertTrue(jsonObj.has("lastStatus"));
        //assertFalse(jsonObj.has("lastStatusName"));
        //assertFalse(jsonObj.has("lastExecution"));
        //assertFalse(jsonObj.has("lastLog"));
        assertTrue(jsonObj.has("filters"));
    }
}
