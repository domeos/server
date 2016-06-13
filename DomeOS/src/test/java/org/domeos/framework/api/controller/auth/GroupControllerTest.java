package org.domeos.framework.api.controller.auth;

import com.fasterxml.jackson.databind.DeserializationFeature;
import org.apache.shiro.util.ThreadContext;
import org.domeos.base.BaseTestCase;
import org.domeos.basemodel.ResultStat;
import org.domeos.framework.api.model.auth.Group;
import org.domeos.framework.api.model.auth.User;
import org.domeos.framework.api.model.auth.related.Role;
import org.junit.Before;
import org.junit.FixMethodOrder;
import org.junit.Test;
import org.junit.runners.MethodSorters;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;

import java.io.IOException;

import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.setup.MockMvcBuilders.webAppContextSetup;

/**
 * Created by zhenfengchen on 15-11-20.
 */
@FixMethodOrder(MethodSorters.NAME_ASCENDING)
public class GroupControllerTest extends BaseTestCase {
    @Autowired
    GroupController groupController;

    Group group;

    private String getRoleJsonStr(Role roleType) {
        String jsonStr = String.format("{\"role\":\"%s\"}", roleType.name());
        return jsonStr;
    }

    @Before
    public void setup() throws IOException {
        ThreadContext.bind(securityManager);
        objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        this.mockMvc = webAppContextSetup(this.wac).build();
    }

    @Test
    public void T000CreateGroup() throws Exception {
        login("test", "test");
        String jsonStr = readInJsonFromFile("./src/test/resources/auth/create_group.json");
        group = objectMapper.readValue(jsonStr.getBytes(), Group.class);
        mockMvc.perform(MockMvcRequestBuilders
            .post("/api/group/create").contentType(MediaType.APPLICATION_JSON).content(jsonStr))
            .andDo(print())
            .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
            .andExpect(status().isOk());
        jsonStr = readInJsonFromFile("./src/test/resources/auth/create_group2.json");
        group = objectMapper.readValue(jsonStr.getBytes(), Group.class);
        mockMvc.perform(MockMvcRequestBuilders
                .post("/api/group/create").contentType(MediaType.APPLICATION_JSON).content(jsonStr))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
    }

    @Test
    public void T001GetGroup() throws Exception {
        String apiStr = "/api/group/get/1";
        mockMvc.perform(MockMvcRequestBuilders
            .get(apiStr))
            .andDo(print())
            .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
            .andExpect(status().isOk());
    }

    @Test
    public void T002ListAllGroups() throws Exception {
        mockMvc.perform(MockMvcRequestBuilders
            .get("/api/group/list"))
            .andDo(print())
            .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
            .andExpect(status().isOk());
    }

    @Test
    public void T003AddUserToGroup() throws Exception {
        login("test", "test");
        String jsonStr = readInJsonFromFile("./src/test/resources/auth/user_group.json");
        String apiStr = "/api/group_members";
        mockMvc.perform(MockMvcRequestBuilders
            .post(apiStr).contentType(MediaType.APPLICATION_JSON).content(jsonStr))
            .andDo(print())
            .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
            .andExpect(status().isOk());
    }

    @Test
    public void T004DeleteGroup() throws Exception {
        login("test", "test");
        String jsonStr = readInJsonFromFile("./src/test/resources/auth/create_group.json");
        group = objectMapper.readValue(jsonStr.getBytes(), Group.class);
        String apiStr = "/api/group/delete/1";
        mockMvc.perform(MockMvcRequestBuilders
                .delete(apiStr))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
    }

    @Test
    public void T005DeleteUserFromGroup() throws Exception {
        login("admin", "admin");
//        HttpResponseTemp<?> res = userService.getUser("admin");
//        Assert.assertTrue(res.getResultCode() == ResultStat.OK.responseCode);
//        User user = (User) res.getResult();
        User user = userService.getUser("test");
        String jsonStr = readInJsonFromFile("./src/test/resources/auth/create_group2.json");

        group = objectMapper.readValue(jsonStr.getBytes(), Group.class);
        String apiStr = "/api/group_members/2/" + user.getId();
        mockMvc.perform(MockMvcRequestBuilders
            .delete(apiStr))
            .andDo(print())
            .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
            .andExpect(status().isOk());
    }
}
