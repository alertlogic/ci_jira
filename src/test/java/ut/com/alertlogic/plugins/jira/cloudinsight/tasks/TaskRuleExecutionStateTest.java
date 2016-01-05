package ut.com.alertlogic.plugins.jira.cloudinsight.tasks;

import static org.junit.Assert.assertEquals;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import com.alertlogic.plugins.jira.cloudinsight.tasks.TaskRuleExecutionState;

public class TaskRuleExecutionStateTest {

    @Before
    public void setup() {}

    @After
    public void tearDown() {}

    @Test
    public void theStatesShouldNotChange() {
    	assertEquals("Scheduled",TaskRuleExecutionState.getStateName(0));
    	assertEquals("Error",TaskRuleExecutionState.getStateName(1));
    	assertEquals("Success",TaskRuleExecutionState.getStateName(2));
    	assertEquals("Blocked",TaskRuleExecutionState.getStateName(3));
    	assertEquals("Executing",TaskRuleExecutionState.getStateName(4));
    	assertEquals("",TaskRuleExecutionState.getStateName(-20));
    	assertEquals("",TaskRuleExecutionState.getStateName(10));
    }
    
}
