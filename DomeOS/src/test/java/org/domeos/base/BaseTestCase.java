package org.domeos.base;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import junit.framework.TestCase;
import org.apache.shiro.SecurityUtils;
import org.apache.shiro.UnavailableSecurityManagerException;
import org.apache.shiro.mgt.SecurityManager;
import org.apache.shiro.subject.Subject;
import org.apache.shiro.subject.support.SubjectThreadState;
import org.apache.shiro.util.LifecycleUtils;
import org.apache.shiro.util.ThreadState;
import org.domeos.api.model.user.UserLoginType;
import org.domeos.api.model.user.UserPassword;
import org.domeos.api.service.user.UserService;
import org.domeos.basemodel.HttpResponseTemp;
import org.junit.AfterClass;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.context.web.WebAppConfiguration;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.context.WebApplicationContext;

import java.io.FileInputStream;

/**
 * Created by feiliu206363 on 2015/11/13.
 */
@RunWith(SpringJUnit4ClassRunner.class)
@WebAppConfiguration(value = "src/main/webapp")
//@ContextConfiguration(loader = WebContextLoader.class, value ={"classpath:/META-INF/test-config.xml"})
@ContextConfiguration(locations = {"file:src/main/webapp/WEB-INF/mvc-dispatcher-servlet.xml"})


//@Transactional  // this is for mysql rollback
public class BaseTestCase extends TestCase {
    public MockMvc mockMvc;
    protected static ThreadState subjectThreadState;

    @SuppressWarnings("SpringJavaAutowiringInspection")
    @Autowired
    public WebApplicationContext wac;

    @Autowired
    public ObjectMapper objectMapper;

    @Autowired
    protected org.apache.shiro.mgt.SecurityManager securityManager;

    @Autowired
    protected UserService userService;

    protected void setSubject(Subject subject) {
        clearSubject();
        subjectThreadState = createThreadState(subject);
        subjectThreadState.bind();
    }

    protected Subject getSubject() {
        return SecurityUtils.getSubject();
    }

    protected ThreadState createThreadState(Subject subject) {
        return new SubjectThreadState(subject);
    }

    /**
     * Clears Shiro's thread state, ensuring the thread remains clean for future test execution.
     */
    protected void clearSubject() {
        doClearSubject();
    }

    private static void doClearSubject() {
        if (subjectThreadState != null) {
            subjectThreadState.clear();
            subjectThreadState = null;
        }
    }

    protected static void setSecurityManager(SecurityManager securityManager) {
        SecurityUtils.setSecurityManager(securityManager);
    }

    protected static SecurityManager getSecurityManager() {
        return SecurityUtils.getSecurityManager();
    }

    @AfterClass
    public static void tearDownShiro() {
        doClearSubject();
        try {
            SecurityManager securityManager = getSecurityManager();
            LifecycleUtils.destroy(securityManager);
        } catch (UnavailableSecurityManagerException e) {
            //we don't care about this when cleaning up the test environment
            //(for example, maybe the subclass is a unit test and it didn't
            // need a SecurityManager instance because it was using only
            // mock Subject instances)
        }
        setSecurityManager(null);
    }

    // helper method
    protected String readInJsonFromFile(String filePath) {
        try {
            FileInputStream fileInputStream = new FileInputStream(filePath);
            byte[] buff = new byte[fileInputStream.available()];
            fileInputStream.read(buff);
            return new String(buff);
        } catch (Exception e) {
            return null;
        }
    }

    protected void displayInfo(HttpResponseTemp<?> response) {
        String body = null;
        try {
            body = objectMapper.writeValueAsString(response);
        } catch (JsonProcessingException e1) {
            body = "json translate error when handle exception:" + response.getResultMsg();
        }
        System.out.println(body);
    }

    protected void login(String username, String password) {
        UserPassword userPassword = new UserPassword(username, password);
        userPassword.setLoginType(UserLoginType.USER);
        HttpResponseTemp<?> res = userService.normalLogin(userPassword);
        displayInfo(res);
    }
}
