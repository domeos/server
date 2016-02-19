package org.domeos.api.mapper;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.domeos.api.mapper.deployment.LoadBalanceMapper;
import org.domeos.api.model.deployment.LoadBalanceDBProto;
import org.domeos.api.model.deployment.LoadBalanceType;
import org.junit.FixMethodOrder;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.MethodSorters;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.web.WebAppConfiguration;

import java.util.List;

/**
 */
@WebAppConfiguration
@RunWith(org.domeos.base.JUnit4ClassRunner.class)
@ContextConfiguration(locations = {"file:src/main/webapp/WEB-INF/mvc-dispatcher-servlet.xml"})
@FixMethodOrder(MethodSorters.NAME_ASCENDING)
public class LoadBalanceTest {

    @Autowired
    LoadBalanceMapper loadBalanceMapper;

    @Autowired
    ObjectMapper objectMapper;

    @Test
    public void T010createLoadBalance() throws JsonProcessingException {
        LoadBalanceDBProto loadBalanceDraft = new LoadBalanceDBProto();
        loadBalanceDraft.setClusterName("test");
        loadBalanceDraft.setDeployId(0);
        loadBalanceDraft.setPort(7777);
        loadBalanceDraft.setExternalIPs("1.1.1.1,2.2.2.2");
        loadBalanceDraft.setTargetPort(8080);
        loadBalanceDraft.setType(LoadBalanceType.TCP);
        loadBalanceMapper.createLoadBalance(loadBalanceDraft);
        loadBalanceDraft = loadBalanceMapper.getLoadBalanceByDeployId(0).get(0);
        System.out.println(objectMapper.writeValueAsString(loadBalanceDraft));
    }

    @Test
    public void T020getHealthChecker() throws JsonProcessingException {
        LoadBalanceDBProto loadBalanceDraft = loadBalanceMapper.getLoadBalanceByDeployId(0).get(0);
        System.out.println(objectMapper.writeValueAsString(loadBalanceDraft));
        loadBalanceDraft = loadBalanceMapper.getLoadBalanceByClusterPort(7777, "test");
        System.out.println(objectMapper.writeValueAsString(loadBalanceDraft));
    }

    @Test
    public void T030modifyHealthChecker() throws JsonProcessingException {
        LoadBalanceDBProto loadBalanceDraft = new LoadBalanceDBProto();
        loadBalanceDraft.setClusterName("test");
        loadBalanceDraft.setDeployId(0);
        loadBalanceDraft.setPort(7777);
        loadBalanceDraft.setExternalIPs("1.1.1.1,2.2.2.2");
        loadBalanceDraft.setTargetPort(8080);
        loadBalanceDraft.setType(LoadBalanceType.HTTP);
        loadBalanceMapper.modifyLoadBalance(loadBalanceDraft);
        loadBalanceDraft = loadBalanceMapper.getLoadBalanceByDeployId(0).get(0);
        System.out.println("after modify:" + objectMapper.writeValueAsString(loadBalanceDraft));
    }

    @Test
    public void T040deleteHealthChecker() {
        loadBalanceMapper.deleteLoadBalance(0);
        List<LoadBalanceDBProto> loadBalanceDraft = loadBalanceMapper.getLoadBalanceByDeployId(0);
        System.out.println("after delete:" + loadBalanceDraft);
    }
}
