package org.domeos.framework.api.controller.global;

import com.fasterxml.jackson.databind.DeserializationFeature;
import org.apache.shiro.util.ThreadContext;
import org.domeos.base.BaseTestCase;
import org.domeos.basemodel.ResultStat;
import org.domeos.framework.api.model.global.CiCluster;
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
public class CiClusterControllerTest extends BaseTestCase {
    CiCluster ciCluster;
    String ciClusterStr;

    @Before
    public void setup() throws IOException {
        ThreadContext.bind(securityManager);

        objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        //FileInputStream fileInputStream = new FileInputStream("./src/test/resources/global/cicluster.json");
        //FileInputStream fileInputStream = new FileInputStream("/home/luyue/CiCluster.json");
        FileInputStream fileInputStream = new FileInputStream("/home/luyue/CiClusterput.json");

        byte[] buff = new byte[fileInputStream.available()];
        fileInputStream.read(buff);
        ciCluster = objectMapper.readValue(buff, CiCluster.class);
        ciClusterStr = new String(buff);
        this.mockMvc = webAppContextSetup(this.wac).build();
        login("admin","admin");
    }

    @Test
    public void T010Set() throws Exception {
        mockMvc.perform(post("/api/global/ci/cluster").contentType(MediaType.APPLICATION_JSON).content(ciClusterStr))
                .andDo(print())
                .andExpect(status().isOk());
    }

    @Test
    public void T020Get() throws Exception {
        mockMvc.perform(get("/api/global/ci/cluster"))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
    }


    @Test
    public void T030Put() throws Exception {
        mockMvc.perform(put("/api/global/ci/cluster").contentType(MediaType.APPLICATION_JSON).content(ciClusterStr))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
    }

    @Test
    public void T040Delete() throws Exception {
        mockMvc.perform(delete("/api/global/ci/cluster"))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
    }

}