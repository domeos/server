package org.domeos.api.service;


import com.fasterxml.jackson.core.JsonProcessingException;
import org.apache.shiro.util.ThreadContext;
import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.basemodel.ResultStat;
import org.domeos.framework.api.consolemodel.auth.ChangeUserPassword;
import org.domeos.framework.api.consolemodel.auth.UserPassword;
import org.domeos.framework.api.model.auth.User;
import org.domeos.framework.api.service.auth.UserService;
import org.domeos.framework.engine.model.CustomObjectMapper;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.web.WebAppConfiguration;

/**
 * Created by zhenfengchen on 15-11-16.
 */
@WebAppConfiguration
//@RunWith(SpringJUnit4ClassRunner.class)
@RunWith(org.domeos.base.JUnit4ClassRunner.class)
@ContextConfiguration(locations = {"file:src/main/webapp/WEB-INF/mvc-dispatcher-servlet.xml"})

//@Transactional
//@TransactionConfiguration(transactionManager = "transactionManager", defaultRollback = false)
public class UserServiceTest {
    private Logger logger = LoggerFactory.getLogger(this.getClass());

    @Autowired
    protected CustomObjectMapper objectMapper;
    @Autowired
    protected UserService userService;

    @Autowired
    protected org.apache.shiro.mgt.SecurityManager securityManager;

    protected User u1;
    protected String password = "admin";

    @Before
    public void setUp() {
        ThreadContext.bind(securityManager);
        // create admin user
        u1 = new User("admin", "admin");
        u1.setEmail("zhenfengchen@sohu-inc.com");
        u1.setPhone("17710878607");
        logger.info(u1.toString());
        userService.createUser(1, u1, false);
//        roleService.createAdminRole(u1);

    }

    private void displayInfo(HttpResponseTemp<?> response) {
        String body = null;
        try {
            body = objectMapper.writeValueAsString(response);
        } catch (JsonProcessingException e1) {
            logger.error("failed to translate response to json", e1);
            body = "json translate error when handle exception:" + response.getResultMsg();
        }
        System.out.println(body);
    }

    @Test
    public void testGetExistUser() {
        HttpResponseTemp<?> res = userService.getUserInfo("admin");
        displayInfo(res);
        Assert.assertTrue(res.getResultCode() == ResultStat.OK.responseCode);
    }

    @Test
    public void testGetExistUserInfo() {
        HttpResponseTemp<?> res = userService.getUserInfo("admin");
        displayInfo(res);
        Assert.assertTrue(res.getResultCode() == ResultStat.OK.responseCode);
    }

    @Test
    public void testGetAllUserInfo() {
        HttpResponseTemp<?> res = userService.listAllUserInfo();
        displayInfo(res);
        Assert.assertTrue(res.getResultCode() == ResultStat.OK.responseCode);
    }

    @Test
    public void testAddUser() {
        User user = new User("csf", "csf");
        user.setEmail("zhenfengchen@sohu-inc.com");
        HttpResponseTemp<?> res = userService.createUser(-1 ,user, false);
        displayInfo(res);
        Assert.assertTrue(res.getResultCode() == ResultStat.OK.responseCode);
    }

    @Test
    public void testDeleteUser() {
        testLogin();
        HttpResponseTemp<?> res = userService.deleteUser(0, "csf");
        displayInfo(res);
        Assert.assertTrue(res.getResultCode() == ResultStat.OK.responseCode);
    }


    @Test
    public void testGetNotExistUser() {
        HttpResponseTemp<?> res = userService.getUserInfo("csf");
        displayInfo(res);
        Assert.assertTrue(res.getResultCode() == ResultStat.USER_NOT_EXIST.responseCode);
    }

    @Test
    public void testLogin() {
        UserPassword userPassword = new UserPassword("admin", "admin");
        HttpResponseTemp<?> res = userService.normalLogin(userPassword);
        displayInfo(res);
    }

    @Test
    public void testModifyUser() {
        testLogin();
//        HttpResponseTemp<?> res = userService.getUser("csf");
//        u1 = (User) res.getResult();
        User u1 = userService.getUser("csf");
        if (u1 != null) {
            u1.setEmail("526962311@qq.com");
            u1.setPhone("17710878607");
            HttpResponseTemp<?> res2 = userService.modifyUser(u1);
            displayInfo(res2);
        }
    }

    @Test
    public void testChangePasswordByUser() {
        testLogin();

        ChangeUserPassword changeUserPassword = new ChangeUserPassword("csf3", "csf3", "newcsf3");
        HttpResponseTemp<?> res = userService.changePassword(changeUserPassword);
        displayInfo(res);
    }

    @Test
    public void testChangePasswordByAdmin() {
        testLogin();
        UserPassword userPassword = new UserPassword("csf", "csf");
        HttpResponseTemp<?> res = userService.changePasswordByAdmin(0, userPassword);
        displayInfo(res);
        Assert.assertTrue(res.getResultCode() == ResultStat.OK.responseCode);
    }

}
