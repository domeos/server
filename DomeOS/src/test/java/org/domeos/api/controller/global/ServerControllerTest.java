package org.domeos.api.controller.global;

import com.fasterxml.jackson.databind.DeserializationFeature;
import org.apache.shiro.util.ThreadContext;
import org.domeos.api.model.global.Server;
import org.domeos.base.BaseTestCase;
import org.domeos.basemodel.ResultStat;
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
 * Created by feiliu206363 on 2015/11/26.
 */
@FixMethodOrder(MethodSorters.NAME_ASCENDING)
public class ServerControllerTest extends BaseTestCase {
    Server server;
    String serverStr;

    @Before
    public void setup() throws IOException {
        ThreadContext.bind(securityManager);

        objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        FileInputStream fileInputStream = new FileInputStream("./src/test/resources/global/server.json");
        byte[] buff = new byte[fileInputStream.available()];
        fileInputStream.read(buff);
        server = objectMapper.readValue(buff, Server.class);
        serverStr = new String(buff);

        this.mockMvc = webAppContextSetup(this.wac).build();
        login("admin","admin");
    }

    @Test
    public void T010Set() throws Exception {
        mockMvc.perform(post("/api/global/serverconfig").contentType(MediaType.APPLICATION_JSON).content(serverStr))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
    }

    @Test
    public void T020Get() throws Exception {
        mockMvc.perform(get("/api/global/serverconfig"))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
    }

    @Test
    public void T030Update() throws Exception {
        mockMvc.perform(put("/api/global/serverconfig").contentType(MediaType.APPLICATION_JSON).content(serverStr))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
    }

    @Test
    public void T040Delete() throws Exception {
        mockMvc.perform(delete("/api/global/serverconfig"))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
    }
}
