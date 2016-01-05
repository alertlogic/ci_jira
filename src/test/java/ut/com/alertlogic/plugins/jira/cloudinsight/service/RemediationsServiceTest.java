package ut.com.alertlogic.plugins.jira.cloudinsight.service;

import static org.junit.Assert.assertEquals;

import java.io.File;
import java.util.Scanner;
import org.json.JSONObject;
import org.junit.Before;
import org.junit.Test;
import com.alertlogic.plugins.jira.cloudinsight.service.RemediationsService;

public class RemediationsServiceTest {

	RemediationsService remediationsService;
	@Before
	public void setUp() throws Exception {
		remediationsService = new RemediationsService(null, null);		
	}
	
	@Test
	public void testGetStatusRemediationItem() throws Exception{
		File file = new File("src/test/resources/mocks/remediationItems.json");
		@SuppressWarnings("resource")
		Scanner scanner = new Scanner(file).useDelimiter("\\Z");
		String content = scanner.next();
		scanner.close();
				
		JSONObject jsonObject = new JSONObject(content);

		String remediationItemKeyIncomplete = "/al/67000001:3AB3B78C-3C35-4274-B227-047145769ACC/remediation-item/FAE897DE2813F9E9BC774CB4451E0099";
		String stateIncomplete = remediationsService.getStatusRemediationItem( jsonObject, remediationItemKeyIncomplete );
		assertEquals(stateIncomplete,"incomplete");
		
		String remediationItemKeyPlanned = "/al/67000001:3AB3B78C-3C35-4274-B227-047145769ACC/remediation-item/6E1626310FE4DCF10A7E8C08D7BF1EB7";
		String statePlanned = remediationsService.getStatusRemediationItem( jsonObject, remediationItemKeyPlanned );
		assertEquals(statePlanned,"planned");
		
		String stateEmpty = remediationsService.getStatusRemediationItem( jsonObject, "ABC" );
		assertEquals(stateEmpty,"");
	}
}
