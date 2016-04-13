package org.domeos.framework.api.controller.global;

import com.fasterxml.jackson.databind.DeserializationFeature;
import org.apache.shiro.util.ThreadContext;
import org.domeos.base.BaseTestCase;
import org.domeos.basemodel.ResultStat;
import org.domeos.framework.api.model.global.GitConfig;
import org.junit.Before;
import org.junit.FixMethodOrder;
import org.junit.Test;
import org.junit.runners.MethodSorters;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;

import java.io.FileInputStream;
import java.io.IOException;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.setup.MockMvcBuilders.webAppContextSetup;

/**
 * Created by baokangwang on 2016/4/7.
 */
@FixMethodOrder(MethodSorters.NAME_ASCENDING)
public class GitConfigControllerTest extends BaseTestCase {

    GitConfig gitConfig;
    String gitConfigStr;

    @Before
    public void setup() throws IOException {

        ThreadContext.bind(securityManager);
        objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

        FileInputStream gitConfigInputStream = new FileInputStream("./src/test/resources/global/gitConfig.json");
        byte[] gitConfigBuff = new byte[gitConfigInputStream.available()];
        gitConfigInputStream.read(gitConfigBuff);
        gitConfig = objectMapper.readValue(gitConfigBuff, GitConfig.class);
        gitConfigStr = new String(gitConfigBuff);

        this.mockMvc = webAppContextSetup(this.wac).build();
        login("admin", "admin");
    }

    @Test
    public void T010Create() throws Exception {
        mockMvc.perform(post("/api/global/gitconfig").contentType(MediaType.APPLICATION_JSON).content(gitConfigStr))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
    }

    @Test
    public void T020Get() throws Exception {
        mockMvc.perform(get("/api/global/gitconfig/{id}", 3))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
    }

    @Test
    public void T030List() throws Exception {
        mockMvc.perform(get("/api/global/gitconfig"))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
    }

    @Test
    public void T040Modify() throws Exception {
        mockMvc.perform(put("/api/global/gitconfig").contentType(MediaType.APPLICATION_JSON).content(gitConfigStr))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
    }

    @Test
    public void T050Delete() throws Exception {
        mockMvc.perform(delete("/api/global/gitconfig/{id}", 3))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
    }

}
