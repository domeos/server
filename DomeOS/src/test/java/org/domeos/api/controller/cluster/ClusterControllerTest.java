package org.domeos.api.controller.cluster;

import com.fasterxml.jackson.databind.DeserializationFeature;
import org.apache.shiro.util.ThreadContext;
import org.domeos.framework.api.consolemodel.cluster.ClusterInfo;
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
 * Created by feiliu206363 on 2015/12/17.
 */
@FixMethodOrder(MethodSorters.NAME_ASCENDING)
public class ClusterControllerTest extends BaseTestCase {
    ClusterInfo cluster;
    String clusterStr;
    String namespace = "[\"test1\",\"test2\"]";

    @Before
    public void setup() throws IOException {
        ThreadContext.bind(securityManager);

        objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        FileInputStream inputStream = new FileInputStream("./src/test/resources/cluster/cluster.json");
        byte[] buff = new byte[inputStream.available()];
        inputStream.read(buff);
        cluster = objectMapper.readValue(buff, ClusterInfo.class);
        clusterStr = new String(buff);

        this.mockMvc = webAppContextSetup(this.wac).build();
        login("admin","admin");
    }

    @Test
    public void T010Set() throws Exception {
        mockMvc.perform(post("/api/cluster").contentType(MediaType.APPLICATION_JSON).content(clusterStr))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
    }

    @Test
    public void T020Get() throws Exception {
        mockMvc.perform(get("/api/cluster/{id}", cluster.getId()))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
    }

    @Test
    public void T030List() throws Exception {
        mockMvc.perform(get("/api/cluster"))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
    }

    @Test
    public void T040Modify() throws Exception {
        mockMvc.perform(put("/api/cluster").contentType(MediaType.APPLICATION_JSON).content(clusterStr))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
    }

    @Test
    public void T050GetNamespace() throws Exception {
        mockMvc.perform(get("/api/cluster/{id}/namespace", cluster.getId()))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
    }

    @Test
    public void T060PutNamespace() throws Exception {
        mockMvc.perform(post("/api/cluster/{id}/namespace", cluster.getId()).contentType(MediaType.APPLICATION_JSON).content(namespace))
                .andDo(print())
                //.andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
    }

    @Test
    public void T070GetNodeList() throws Exception {
        mockMvc.perform(get("/api/cluster/{id}/nodelist", cluster.getId()))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
    }

    @Test
    public void T080GetNodeListWithLabels() throws Exception {
        mockMvc.perform(get("/api/cluster/{id}/labels", cluster.getId()).param("labels", "{\"test-anl\":\"hehehe\"}"))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
    }

    @Test
    public void T090GetLabels() throws Exception {
        mockMvc.perform(get("/api/cluster/{id}/labels", cluster.getId()))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
    }

    @Test
    public void T100DeleteLabels() throws Exception {
        mockMvc.perform(delete("/api/cluster/{id}/{nodeName}/{label}", cluster.getId(), "test-host", "aaa"))
                .andDo(print())
//                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
    }

    @Test
    public void T100Delete() throws Exception {
        mockMvc.perform(delete("/api/cluster/{id}", cluster.getId()))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
    }
}
