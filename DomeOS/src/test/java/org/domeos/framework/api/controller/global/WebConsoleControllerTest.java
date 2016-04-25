package org.domeos.framework.api.controller.global;

import com.fasterxml.jackson.databind.DeserializationFeature;
import org.apache.shiro.util.ThreadContext;
import org.domeos.base.BaseTestCase;
import org.domeos.basemodel.ResultStat;
import org.domeos.framework.api.model.global.WebSsh;
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
public class WebConsoleControllerTest extends BaseTestCase {
    WebSsh webSsh;
    String websshStr;

    @Before
    public void setup() throws IOException {
        ThreadContext.bind(securityManager);

        objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        FileInputStream fileInputStream = new FileInputStream("./src/test/resources/global/websetting.json");
        byte[] buff = new byte[fileInputStream.available()];
        fileInputStream.read(buff);
        webSsh = objectMapper.readValue(buff, WebSsh.class);
        websshStr = new String(buff);

        this.mockMvc = webAppContextSetup(this.wac).build();
        login("admin","admin");
    }

    @Test
    public void T010Set() throws Exception {
        mockMvc.perform(post("/api/global/webssh").contentType(MediaType.APPLICATION_JSON).content(websshStr))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
    }

    @Test
    public void T020Get() throws Exception {
        mockMvc.perform(get("/api/global/webssh"))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
    }

    @Test
    public void T030Update() throws Exception {
        mockMvc.perform(put("/api/global/webssh").contentType(MediaType.APPLICATION_JSON).content(websshStr))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
    }

    @Test
    public void T040Delete() throws Exception {
        mockMvc.perform(delete("/api/global/webssh"))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
    }
}
