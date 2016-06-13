package org.domeos.framework.api.controller.cluster;

import com.fasterxml.jackson.databind.DeserializationFeature;
import org.apache.shiro.util.ThreadContext;
import org.domeos.base.BaseTestCase;
import org.domeos.basemodel.ResultStat;
import org.domeos.framework.api.consolemodel.cluster.ClusterCreate;
import org.domeos.framework.api.consolemodel.cluster.ClusterInfo;
import org.domeos.framework.api.model.cluster.related.NodeLabel;
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
 * Created by baokangwang on 2016/4/6.
 */
@FixMethodOrder(MethodSorters.NAME_ASCENDING)
public class ClusterControllerTest extends BaseTestCase {

    ClusterCreate clusterCreate;
    String clusterCreateStr;

    ClusterInfo clusterInfo;
    String clusterInfoStr;

    NodeLabel nodeLabel;
    String nodeLabelStr;

    @Before
    public void setup() throws IOException {

        ThreadContext.bind(securityManager);
        objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

        FileInputStream clusterCreateInputStream = new FileInputStream("./src/test/resources/cluster/clusterCreate.json");
        byte[] clusterCreateBuff = new byte[clusterCreateInputStream.available()];
        clusterCreateInputStream.read(clusterCreateBuff);
        clusterCreate = objectMapper.readValue(clusterCreateBuff, ClusterCreate.class);
        clusterCreateStr = new String(clusterCreateBuff);

        FileInputStream clusterInfoInputStream = new FileInputStream("./src/test/resources/cluster/cluster.json");
        byte[] clusterInfoBuff = new byte[clusterInfoInputStream.available()];
        clusterInfoInputStream.read(clusterInfoBuff);
        clusterInfo = objectMapper.readValue(clusterInfoBuff, ClusterInfo.class);
        clusterInfoStr = new String(clusterInfoBuff);

        FileInputStream nodeLabelInputStream = new FileInputStream("./src/test/resources/cluster/nodeLabel.json");
        byte[] nodeLabelBuff = new byte[nodeLabelInputStream.available()];
        nodeLabelInputStream.read(nodeLabelBuff);
        nodeLabel = objectMapper.readValue(nodeLabelBuff, NodeLabel.class);
        nodeLabelStr = new String(nodeLabelBuff);

        this.mockMvc = webAppContextSetup(this.wac).build();
        login("test", "test");
    }

    @Test
    public void T010Create() throws Exception {
        mockMvc.perform(post("/api/cluster").contentType(MediaType.APPLICATION_JSON).content(clusterCreateStr))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
    }

    @Test
    public void T020Get() throws Exception {
        mockMvc.perform(get("/api/cluster/{id}", 2))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/cluster/{id}", 100))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.FORBIDDEN.responseCode))
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
        mockMvc.perform(put("/api/cluster").contentType(MediaType.APPLICATION_JSON).content(clusterInfoStr))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
    }

    @Test
    public void T050Delete() throws Exception {
        mockMvc.perform(delete("/api/cluster/{id}", 2))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
    }

    @Test
    public void T060GetNamespace() throws Exception {
        mockMvc.perform(post("/api/cluster").contentType(MediaType.APPLICATION_JSON).content(clusterCreateStr))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/cluster/{id}/namespace", 3))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
    }

    /*
    @Test
    public void T070AddNamespace() throws Exception {
        mockMvc.perform(post("/api/cluster/{id}/namespace", 3).contentType(MediaType.APPLICATION_JSON).content("[\"mytest2\"]"))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
    }*/

    @Test
    public void T080GetNodeList() throws Exception {
        mockMvc.perform(get("/api/cluster/{id}/nodelist", 3))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
    }

    @Test
    public void T090GetNodeInfo() throws Exception {
        mockMvc.perform(get("/api/cluster/{id}/node/{name}", 3, "test-host"))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
    }

    @Test
    public void T100GetNodeInstanceInfo() throws Exception {
        mockMvc.perform(get("/api/cluster/{id}/nodelist/{name}", 3, "test-host"))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
    }

    @Test
    public void T110GetLabels() throws Exception {
        mockMvc.perform(get("/api/cluster/{id}/labels", 3))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
    }

    @Test
    public void T120GetNodeByLabels() throws Exception {
        mockMvc.perform(get("/api/cluster/{id}/nodelistwithlabels", 3).param("labels", "{\"kubernetes.io/hostname\":\"test-host\"}"))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
    }

    @Test
    public void T130AddLabel() throws Exception {
        mockMvc.perform(post("/api/cluster/{id}/nodelabels", 3).contentType(MediaType.APPLICATION_JSON).content(nodeLabelStr))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
    }

    @Test
    public void T140DeleteLabel() throws Exception {
        mockMvc.perform(delete("/api/cluster/{id}/{nodeName}/{label}", 3, "test-host", "test-label"))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
    }

    @Test
    public void T150AddDisk() throws Exception {
        mockMvc.perform(post("/api/cluster/{id}/{nodeName}/disk", 3, "test-host").param("path", "pathOfDisk"))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
    }

    @Test
    public void T160DeleteDisk() throws Exception {
        mockMvc.perform(delete("/api/cluster/{id}/{nodeName}/disk", 3, "test-host"))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
    }
}
