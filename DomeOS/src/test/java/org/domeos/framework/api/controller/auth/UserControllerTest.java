package org.domeos.framework.api.controller.auth;

import com.fasterxml.jackson.databind.DeserializationFeature;
import org.apache.shiro.util.ThreadContext;
import org.domeos.base.BaseTestCase;
import org.domeos.basemodel.ResultStat;
import org.domeos.framework.api.consolemodel.auth.ChangeUserPassword;
import org.domeos.framework.api.consolemodel.auth.UserPassword;
import org.domeos.framework.api.model.auth.User;
import org.domeos.framework.api.model.auth.related.LoginType;
import org.junit.Before;
import org.junit.FixMethodOrder;
import org.junit.Test;
import org.junit.runners.MethodSorters;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;

import java.io.FileInputStream;
import java.io.IOException;

import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.setup.MockMvcBuilders.webAppContextSetup;

/**
 * Created by zhenfengchen on 15-11-19.
 */
// run all test in lexicographic order according to the method name
@FixMethodOrder(MethodSorters.NAME_ASCENDING)
public class UserControllerTest extends BaseTestCase {
    @Autowired
    UserController userController;

    User user;
    String userStr;

    UserPassword userPassword;
    String userPasswordStr;

    ChangeUserPassword changeUserPassword;
    String changeUserPasswordStr;

    @Before
    public void setup() throws IOException {
        ThreadContext.bind(securityManager);
        objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        // User
        FileInputStream fileInputStream = new FileInputStream("./src/test/resources/auth/user.json");
        byte[] buff = new byte[fileInputStream.available()];
        fileInputStream.read(buff);
        user = objectMapper.readValue(buff, User.class);
        userStr = new String(buff);
        fileInputStream.close();
//        System.out.println(user);

        // UserPassword
        fileInputStream = new FileInputStream("./src/test/resources/auth/userpassword.json");
        buff = new byte[fileInputStream.available()];
        fileInputStream.read(buff);
        userPassword = objectMapper.readValue(buff, UserPassword.class);
        userPasswordStr = new String(buff);
        fileInputStream.close();
//        System.out.println(userPassword);

        // ChangePassword
        changeUserPassword = new ChangeUserPassword(userPassword.getUsername(),
                userPassword.getPassword(), userPassword.getPassword() + "new");
        changeUserPasswordStr = objectMapper.writeValueAsString(changeUserPassword);


        this.mockMvc = webAppContextSetup(this.wac).build();
    }

    @Test
    public void T000Login() throws Exception {
        mockMvc.perform(MockMvcRequestBuilders
                .post("/api/user/login").contentType(MediaType.APPLICATION_JSON).content(userPasswordStr))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
    }

    @Test
    public void T020ChangePassword() throws Exception {
        // 1. change to new password
//        login("admin", "admin");
        mockMvc.perform(MockMvcRequestBuilders
                .post("/api/user/changePassword").contentType(MediaType.APPLICATION_JSON).content(changeUserPasswordStr))
                .andDo(print()).andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode));
        // 2. use new password to login
        UserPassword tmp = new UserPassword(userPassword.getUsername(),
                userPassword.getPassword() + "new");
        tmp.setLoginType(LoginType.USER);
        userPasswordStr = objectMapper.writeValueAsString(tmp);
        System.out.println(userPasswordStr);
        mockMvc.perform(MockMvcRequestBuilders
                .post("/api/user/login").contentType(MediaType.APPLICATION_JSON).content(userPasswordStr))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
        // 3. change password back to old one
        changeUserPassword.setOldpassword(userPassword.getPassword() + "new");
        changeUserPassword.setNewpassword(userPassword.getPassword());
        changeUserPasswordStr = objectMapper.writeValueAsString(changeUserPassword);
        System.out.println(changeUserPasswordStr);
        mockMvc.perform(MockMvcRequestBuilders
                .post("/api/user/changePassword").contentType(MediaType.APPLICATION_JSON).content(changeUserPasswordStr))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode));
    }

    @Test
    public void T010AddUser() throws Exception {
        T000Login();

        mockMvc.perform(MockMvcRequestBuilders
                .post("/api/user/create").contentType(MediaType.APPLICATION_JSON).content(userStr))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
    }
}
