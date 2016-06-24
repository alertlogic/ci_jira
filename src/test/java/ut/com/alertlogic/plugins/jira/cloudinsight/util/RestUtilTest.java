package ut.com.alertlogic.plugins.jira.cloudinsight.util;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNull;

import org.json.JSONObject;
import org.junit.Before;
import org.junit.Test;

import com.alertlogic.plugins.jira.cloudinsight.util.RestUtil;

public class RestUtilTest {

	private JSONObject responseSuccess;
	private JSONObject responseError;
	private RestUtil restUtil;

	@Before
    public void setUp() throws Exception
	{
		restUtil = new RestUtil(null, null);
		String json="{'authentication':{'user':{'id':'1'}, 'account':{'id':'2'},'token':'3'}}";
		responseSuccess = new JSONObject(json);
		responseError = null;
	}

    @Test
    public void testGetToken() throws Exception
    {
    	String token = restUtil.getToken(responseSuccess);
    	assertEquals(token,"3");

    	String tokenError = restUtil.getToken(responseError);
    	assertNull(tokenError);
    }

    @Test
    public void testGetAccount() throws Exception
    {
    	String account = restUtil.getAccount(responseSuccess);
    	assertEquals(account,"2");

    	String accountError = restUtil.getAccount(responseError);
    	assertNull(accountError);
    }

    @Test
    public void testGetUserId() throws Exception
    {
    	String token = restUtil.getUserId(responseSuccess);
    	assertEquals(token,"1");

    	String tokenError = restUtil.getUserId(responseError);
    	assertNull(tokenError);
    }
}