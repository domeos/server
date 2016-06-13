package org.domeos.api.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import org.apache.shiro.util.ThreadContext;
import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.framework.api.biz.auth.AuthBiz;
import org.domeos.framework.api.biz.resource.ResourceBiz;
import org.domeos.framework.api.model.auth.User;
import org.domeos.framework.api.model.auth.related.Role;
import org.domeos.framework.api.model.resource.Resource;
import org.domeos.framework.api.model.resource.related.ResourceOwnerType;
import org.domeos.framework.api.model.resource.related.ResourceType;
import org.domeos.framework.api.service.auth.UserGroupService;
import org.domeos.framework.api.service.auth.UserService;
import org.domeos.framework.engine.model.CustomObjectMapper;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.web.WebAppConfiguration;

/**
 * Created by zhenfengchen on 15-11-29.
 */
@WebAppConfiguration
@RunWith(org.domeos.base.JUnit4ClassRunner.class)
@ContextConfiguration(locations = {"file:src/main/webapp/WEB-INF/mvc-dispatcher-servlet.xml"})
public class ResourceServiceTest {
    @Autowired
    protected CustomObjectMapper objectMapper;
    @Autowired
    protected UserService userService;
    @Autowired
    protected UserGroupService userGroupService;
//    @Autowired
//    protected AuthUtil authUtil;
    @Autowired
    protected AuthBiz userGroupMapper;
    @Autowired
    protected ResourceBiz resourceMapper;
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
//        List<Resource> res2 = authUtil.getResourceList(userId, ResourceType.PROJECT);
        Resource res2 = null; // = resourceMapper.getResource(userId, ResourceOwnerType.USER.getOwnerTypeName(),
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
        int projectId = 14;
        int userId = 5;
        Resource resource = new Resource(projectId, ResourceType.PROJECT);
        resource.setOwnerId(userId);
        resource.setOwnerType(ResourceOwnerType.USER);
        resource.setUpdateTime(System.currentTimeMillis());
        resource.setRole(Role.MASTER);
//        AuthUtil.addResource(resource);
    }

    @Test
    public void T003ListNamespace() {
        User user = userService.getUser("test@test.com");
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
