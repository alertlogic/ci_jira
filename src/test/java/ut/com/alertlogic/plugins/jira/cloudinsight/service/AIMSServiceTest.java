package ut.com.alertlogic.plugins.jira.cloudinsight.service;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNull;

import org.json.JSONObject;
import org.junit.Before;
import org.junit.Test;

import com.alertlogic.plugins.jira.cloudinsight.service.AIMSService;

public class AIMSServiceTest {

	private JSONObject responseSuccess;
	private JSONObject responseError;
	private AIMSService aimsService;

	@Before
    public void setUp() throws Exception
	{
		aimsService = new AIMSService(null,null);
		String json="{'authentication':{'user':{'id':'1'}, 'account':{'id':'2'},'token':'3'}}";
		responseSuccess = new JSONObject(json);
		responseError = null;
	}

    @Test
    public void testGetToken() throws Exception
    {
    	String token = aimsService.getToken(responseSuccess);
    	assertEquals(token,"3");

    	String tokenError = aimsService.getToken(responseError);
    	assertNull(tokenError);
    }

    @Test
    public void testGetAccount() throws Exception
    {
    	String account = aimsService.getAccount(responseSuccess);
    	assertEquals(account,"2");

    	String accountError = aimsService.getAccount(responseError);
    	assertNull(accountError);
    }

    @Test
    public void testGetUserId() throws Exception
    {
    	String token = aimsService.getUserId(responseSuccess);
    	assertEquals(token,"1");

    	String tokenError = aimsService.getUserId(responseError);
    	assertNull(tokenError);
    }
}