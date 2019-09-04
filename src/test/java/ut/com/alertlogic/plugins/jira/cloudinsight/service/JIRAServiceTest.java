package ut.com.alertlogic.plugins.jira.cloudinsight.service;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertSame;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mockito;
import org.mockito.runners.MockitoJUnitRunner;

import com.alertlogic.plugins.jira.cloudinsight.service.JIRAService;
import com.alertlogic.plugins.jira.cloudinsight.service.ScreenConfigService;
import com.atlassian.jira.issue.comments.CommentManager;
import com.atlassian.jira.mock.component.MockComponentWorker;
import com.atlassian.jira.security.JiraAuthenticationContext;
import com.atlassian.jira.user.MockApplicationUser;
import com.atlassian.jira.user.MockUser;
import com.atlassian.jira.user.util.UserManager;

@RunWith(MockitoJUnitRunner.class)
public class JIRAServiceTest {
	private JIRAService jiraService;
	private CommentManager commentManager;
	private UserManager userManager;
	private JiraAuthenticationContext jiraAuthenticationContext;
	
	@Before
    public void setUp() throws Exception
    {
        jiraAuthenticationContext = mock(JiraAuthenticationContext.class);
        userManager = mock(UserManager.class);
        commentManager = mock(CommentManager.class);
		
		ScreenConfigService screenConfigService = new ScreenConfigService(
			 null,
			 null,
			 null,
			 null,
			 null,
			 null,
			 null,
			 null
		);
		
		new MockComponentWorker()
		.addMock(CommentManager.class,commentManager)
		.addMock(UserManager.class,userManager)
        .addMock(JiraAuthenticationContext.class, jiraAuthenticationContext)
		.init();

		jiraService = new JIRAService(screenConfigService);
	}

	@Test
	public void testGetTextLeveld() {
		String high = jiraService.getTextLevel(3);
		assertEquals(high,"high");
		
		String medium =jiraService.getTextLevel(2);
		assertEquals(medium,"medium");
		
		String low =jiraService.getTextLevel(1);
		assertEquals(low,"low");
		
		String info =jiraService.getTextLevel(0);
		assertEquals(info,"info");
	}

	@SuppressWarnings("deprecation")
	@Test
	public void testGetUserByName() {
		MockApplicationUser appUser = new MockApplicationUser("fred");
		
		//user not exist
		when(userManager.getUserByName(Mockito.anyString())).thenReturn(null);
		assertNull(jiraService.getUserByName("fred"));
        
		//user exists and is activate
		when(userManager.getUserByName(Mockito.anyString())).thenReturn(appUser);
		assertSame(jiraService.getUserByName("fred"),appUser);
    }

	@SuppressWarnings("deprecation")
	@Test
	public void testLogginUser() {
		MockApplicationUser appUser = new MockApplicationUser("fred");
		jiraService.logginUser(appUser);
		verify(jiraAuthenticationContext, times(1)).setLoggedInUser(appUser);
    }
}
