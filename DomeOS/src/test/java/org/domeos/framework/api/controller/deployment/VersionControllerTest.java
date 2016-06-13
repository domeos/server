package org.domeos.framework.api.controller.deployment;

import org.apache.shiro.util.ThreadContext;
import org.domeos.base.BaseTestCase;
import org.domeos.basemodel.ResultStat;
import org.domeos.framework.api.service.deployment.impl.InstanceServiceImpl;
import org.junit.Before;
import org.junit.FixMethodOrder;
import org.junit.Test;
import org.junit.runners.MethodSorters;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;

import java.io.FileInputStream;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.setup.MockMvcBuilders.webAppContextSetup;

/**
 * Created by xxs on 16/4/10.
 */
@FixMethodOrder(MethodSorters.NAME_ASCENDING)
public class VersionControllerTest extends BaseTestCase {
    private static org.slf4j.Logger logger = LoggerFactory.getLogger(InstanceServiceImpl.class);


    @Before
    public void setup() throws Exception {
        ThreadContext.bind(securityManager);
        this.mockMvc = webAppContextSetup(this.wac).build();
        login("admin", "admin");

        FileInputStream deploymentDraftInputStream = new FileInputStream("./src/test/resources/deployment/deploymentDraft3.json");
        byte[] deploymentDraftBuff = new byte[deploymentDraftInputStream.available()];
        deploymentDraftInputStream.read(deploymentDraftBuff);
        String deploymentDraftStr = new String(deploymentDraftBuff);
        logger.info("\n----deploymentDraftStr----\n" + deploymentDraftStr);
        mockMvc.perform(post("/api/deploy/create").contentType(MediaType.APPLICATION_JSON).content(deploymentDraftStr))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
    }


    @Test
    public void T001CreateVersion() throws Exception {
        FileInputStream versionInputStream = new FileInputStream("./src/test/resources/deployment/version1.json");
        byte[] versionBuff = new byte[versionInputStream.available()];
        versionInputStream.read(versionBuff);
        String versionStr = new String(versionBuff);
        logger.info("\n----versionStr----\n" + versionStr);
        mockMvc.perform(post("/api/version/create").param("deployId", "1").contentType(MediaType.APPLICATION_JSON).content(versionStr))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
    }


    @Test
    public void T002GetVersion() throws Exception {
        mockMvc.perform(get("/api/version/id/{deployId}/{versionId}", 1, 1))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
    }


    @Test
    public void T003ListVersion() throws Exception {
        mockMvc.perform(get("/api/version/list").param("deployId", "1"))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
    }
}
