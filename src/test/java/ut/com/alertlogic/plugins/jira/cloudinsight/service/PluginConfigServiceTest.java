package ut.com.alertlogic.plugins.jira.cloudinsight.service;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertTrue;
import net.java.ao.EntityManager;
import net.java.ao.test.junit.ActiveObjectsJUnitRunner;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;

import com.alertlogic.plugins.jira.cloudinsight.entity.Credential;
import com.alertlogic.plugins.jira.cloudinsight.entity.PluginConfig;
import com.alertlogic.plugins.jira.cloudinsight.service.CredentialService;
import com.alertlogic.plugins.jira.cloudinsight.service.PluginConfigService;
import com.atlassian.activeobjects.external.ActiveObjects;
import com.atlassian.activeobjects.test.TestActiveObjects;

@RunWith(ActiveObjectsJUnitRunner.class)
public class PluginConfigServiceTest {

	private EntityManager entityManager;
    private ActiveObjects activeObject;
    private PluginConfigService pluginConfigService;
    private CredentialService credentialService;

    private String ciUser = "ci test";
    private String ciAccessKeyId = "123";
    private String ciSecretKey = "123";
    private String ciUrl = "http://test.com";
    private String jiraUser = "jira test";
    @Before
    public void setUp() throws Exception
    {
        assertNotNull(entityManager);
        activeObject = new TestActiveObjects(entityManager);
        pluginConfigService = new PluginConfigService(activeObject);
        credentialService = new CredentialService(activeObject);
    }

    @SuppressWarnings("unchecked")
	@Test
    public void testAddConfiguration() throws Exception
    {
        activeObject.migrate(PluginConfig.class);

        assertEquals(0, activeObject.find(PluginConfig.class).length);

        Credential credential = credentialService.createOrUpdateCredential(-1, jiraUser, ciUser, ciUrl, ciAccessKeyId, ciSecretKey);
        PluginConfig add = pluginConfigService.createOrUpdateConfiguration(jiraUser, credential);
        assertFalse(add.getID() == 0);

        activeObject.flushAll();

        PluginConfig[] pluginConfig = activeObject.find(PluginConfig.class);
        assertEquals(1, pluginConfig.length);
        assertEquals(jiraUser, pluginConfig[0].getJiraUser());
     }

    @SuppressWarnings("unchecked")
    @Test
    public void testGetConfiguration() throws Exception
    {
        activeObject.migrate(PluginConfig.class);
        assertNull(pluginConfigService.getConfiguration(jiraUser));

        final PluginConfig pluginConfig = activeObject.create(PluginConfig.class);
        pluginConfig.setJiraUser(jiraUser);
        pluginConfig.save();

        activeObject.flushAll();

        PluginConfig plugin = pluginConfigService.getConfiguration(jiraUser);
        assertNotNull(plugin);
        assertEquals(pluginConfig.getID(), plugin.getID());
    }

    @SuppressWarnings("unchecked")
    @Test
    public void testHasConfiguration() throws Exception
    {
        activeObject.migrate(PluginConfig.class);
        assertFalse(pluginConfigService.hasConfiguration(jiraUser));

        final PluginConfig pluginConfig = activeObject.create(PluginConfig.class);
        pluginConfig.setJiraUser(jiraUser);
        pluginConfig.save();

        activeObject.flushAll();

        Boolean has = pluginConfigService.hasConfiguration(jiraUser);
        assertTrue(has);
    }
}
