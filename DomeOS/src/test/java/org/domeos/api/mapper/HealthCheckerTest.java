package org.domeos.api.mapper;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.domeos.api.mapper.deployment.HealthCheckerMapper;
import org.domeos.api.model.deployment.HealthChecker;
import org.domeos.api.model.deployment.HealthCheckerType;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.web.WebAppConfiguration;

/**
 */
@WebAppConfiguration
@RunWith(org.domeos.base.JUnit4ClassRunner.class)
@ContextConfiguration(locations = {"file:src/main/webapp/WEB-INF/mvc-dispatcher-servlet.xml"})
public class HealthCheckerTest {

    @Autowired
    HealthCheckerMapper healthCheckerMapper;

    @Autowired
    ObjectMapper objectMapper;

    @Test
    public void createHealthChecker() throws JsonProcessingException {
        HealthChecker healthChecker = new HealthChecker();
        healthChecker.setDeployId(0);
        healthChecker.setPort(8080);
        healthChecker.setTimeout(30);
        healthChecker.setType(HealthCheckerType.TCP);
        healthCheckerMapper.createHealthChecker(healthChecker);
        healthChecker = healthCheckerMapper.getHealthCheckerByDeployId(0);
        System.out.println(objectMapper.writeValueAsString(healthChecker));
    }

    @Test
    public void getHealthChecker() throws JsonProcessingException {
        HealthChecker healthChecker = healthCheckerMapper.getHealthCheckerByDeployId(0);
        System.out.println(objectMapper.writeValueAsString(healthChecker));
    }

    @Test
    public void modifyHealthChecker() throws JsonProcessingException {
        HealthChecker healthChecker = new HealthChecker();
        healthChecker.setDeployId(0);
        healthChecker.setType(HealthCheckerType.PROCESS);
        healthCheckerMapper.modifyHealthChecker(healthChecker);
        healthChecker = healthCheckerMapper.getHealthCheckerByDeployId(0);
        System.out.println(objectMapper.writeValueAsString(healthChecker));
    }

    @Test
    public void deleteHealthChecker() {
        healthCheckerMapper.deleteHealthChecker(0);
        HealthChecker checker = healthCheckerMapper.getHealthCheckerByDeployId(0);
        System.out.println(checker);
    }
}
