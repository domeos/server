package org.domeos.api.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.shiro.util.ThreadContext;
import org.domeos.api.mapper.group.UserGroupMapper;
import org.domeos.api.mapper.resource.ResourceMapper;
import org.domeos.api.model.resource.Resource;
import org.domeos.api.model.resource.ResourceType;
import org.domeos.api.model.user.ResourceOwnerType;
import org.domeos.api.model.user.RoleType;
import org.domeos.api.model.user.User;
import org.domeos.api.service.group.UserGroupService;
import org.domeos.api.service.resource.ResourceService;
import org.domeos.api.service.user.UserService;
import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.shiro.AuthUtil;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.web.WebAppConfiguration;

import java.util.Date;
import java.util.List;

/**
 * Created by zhenfengchen on 15-11-29.
 */
@WebAppConfiguration
@RunWith(org.domeos.base.JUnit4ClassRunner.class)
@ContextConfiguration(locations = {"file:src/main/webapp/WEB-INF/mvc-dispatcher-servlet.xml"})
public class ResourceServiceTest {
    @Autowired
    protected ObjectMapper objectMapper;
    @Autowired
    protected UserService userService;
    @Autowired
    protected ResourceService resourceService;
    @Autowired
    protected UserGroupService userGroupService;
    @Autowired
    protected AuthUtil authUtil;
    @Autowired
    protected UserGroupMapper userGroupMapper;
    @Autowired
    protected ResourceMapper resourceMapper;
    @Autowired
    protected org.apache.shiro.mgt.SecurityManager securityManager;

    @Before
    public void setUp() {
        ThreadContext.bind(securityManager);
    }

    @Test
    public void T001GetResource() {
//        HttpResponseTemp<?> res = resourceService.getResource(1);
//        displayInfo(res);

        long userId = 5;
        long resourceId = 14;
//        List<Long> groupIds = userGroupMapper.getGroupIds(userId);
        List<Resource> res2 = authUtil.getResourceList(userId, ResourceType.PROJECT);
//        Resource res2 = resourceMapper.getResource(userId, ResourceOwnerType.USER.getOwnerTypeName(),
//            resourceId, ResourceType.PROJECT.getResourceName());
        try {
            System.out.println(objectMapper.writeValueAsString(res2));
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void displayInfo(HttpResponseTemp<?> response) {
        String body = null;
        try {
            body = objectMapper.writeValueAsString(response);
        } catch (JsonProcessingException e1) {
            body = "json translate error when handle exception:" + response.getResultMsg();
        }
        System.out.println(body);
    }

    @Test
    public void T002AddResource() {
        long projectId = 14;
        long userId = 5;
        Resource resource = new Resource(projectId, ResourceType.PROJECT);
        resource.setOwner_id(userId);
        resource.setOwner_type(ResourceOwnerType.USER);
        resource.setUpdate_time(new Date());
        resource.setRole(RoleType.MASTER.getRoleName());
        AuthUtil.addResource(resource);
    }

    @Test
    public void T003ListNamespace() {
//        User user = userService.getUser("zhenfengchen@sohu-inc.com");
        User user = userService.getUser("donwu@sohu-inc.com");
        HttpResponseTemp<?> res = userGroupService.getNamespace(user);
        displayInfo(res);
    }

    @Test
    public void T004() throws Exception {
        String jsonStr = "{\"resource_id\":13,\"resource_type\":\"PROJECT\",\"owner_id\":8,\"owner_type\":\"GROUP\",\"role\":\"owner\"}";
        Resource resource = objectMapper.readValue(jsonStr.getBytes(), Resource.class);
        System.out.println(resource);
    }
}
