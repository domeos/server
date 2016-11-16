package org.domeos.framework.api.controller.project;

import com.fasterxml.jackson.databind.DeserializationFeature;
import org.apache.shiro.util.ThreadContext;
import org.domeos.base.BaseTestCase;
import org.domeos.basemodel.ResultStat;
import org.domeos.framework.api.model.ci.BuildHistory;
import org.domeos.framework.api.model.ci.related.BuildResult;
import org.domeos.framework.api.model.project.Project;
import org.domeos.framework.engine.coderepo.GitWebHook;
import org.domeos.framework.engine.coderepo.WebHook;
import org.junit.Before;
import org.junit.FixMethodOrder;
import org.junit.Test;
import org.junit.runners.MethodSorters;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;

import java.io.FileInputStream;
import java.io.IOException;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.setup.MockMvcBuilders.webAppContextSetup;

/**
 * Created by feiliu206363 on 2015/11/25.
 */
@FixMethodOrder(MethodSorters.NAME_ASCENDING)
public class BuildControllerTest extends BaseTestCase {
    BuildHistory buildInfo;
    String buildInfoStr;

    BuildResult buildStatus;
    String buildStatusStr;

    WebHook webHooks;
    String webHooksStr;

    String projectCollectionConsoleStr;
    Project project;
    String projectStr;

    @Before
    public void setup() throws IOException {
        ThreadContext.bind(securityManager);

        objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        FileInputStream buildInfoStream = new FileInputStream("./src/test/resources/project/buildInfo.json");
        byte[] buffInfo = new byte[buildInfoStream.available()];
        buildInfoStream.read(buffInfo);
        buildInfo = objectMapper.readValue(buffInfo, BuildHistory.class);
        buildInfoStr = new String(buffInfo);

        FileInputStream buildStatusStream = new FileInputStream("./src/test/resources/project/buildStatus.json");
        byte[] buffStatus = new byte[buildStatusStream.available()];
        buildStatusStream.read(buffStatus);
        buildStatus = objectMapper.readValue(buffStatus, BuildResult.class);
        buildStatusStr = new String(buffStatus);

        FileInputStream webhookStream = new FileInputStream("./src/test/resources/project/webhook.json");
        byte[] webhookStatus = new byte[webhookStream.available()];
        webhookStream.read(webhookStatus);
        webHooks = objectMapper.readValue(webhookStatus, GitWebHook.class);
        webHooksStr = new String(webhookStatus);

        FileInputStream projectCollectionConsoleStream = new FileInputStream("./src/test/resources/project/projectCollection.json");
        byte[] projectCollectionConsole = new byte[projectCollectionConsoleStream.available()];
        projectCollectionConsoleStream.read(projectCollectionConsole);
        projectCollectionConsoleStr = new String(projectCollectionConsole);

        FileInputStream projectStream = new FileInputStream("./src/test/resources/project/project.json");
        byte[] projectStatus = new byte[projectStream.available()];
        projectStream.read(projectStatus);
        project = objectMapper.readValue(projectStatus, Project.class);
        projectStr = new String(projectStatus);

        this.mockMvc = webAppContextSetup(this.wac).build();

        login("admin", "admin");
    }

    @Test
    public void T010Start() throws Exception {
        mockMvc.perform(post("/api/projectcollection").contentType(MediaType.APPLICATION_JSON).content(projectCollectionConsoleStr))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
        mockMvc.perform(post("/api/projectcollection/1/project").contentType(MediaType.APPLICATION_JSON).content(projectStr))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
        mockMvc.perform(
                post("/api/ci/build/start").contentType(MediaType.APPLICATION_JSON).content(buildInfoStr))
                .andDo(print())
                //.andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
    }

    @Test
    public void T020GetDockerfile() throws Exception {
        mockMvc.perform(get("/api/ci/build/dockerfile/{projectId}", buildInfo.getProjectId()))
                .andDo(print())
                .andExpect(status().isOk());
    }

    @Test
    public void T030SetBuildStatus() throws Exception {
        mockMvc.perform(
                post("/api/ci/build/status?secret=test").contentType(MediaType.APPLICATION_JSON).content(buildStatusStr))
                .andDo(print())
                .andExpect(status().isOk());
    }

    @Test
    public void T040StartAutoBuild() throws Exception {
        mockMvc.perform(
                post("/api/ci/build/autobuild").contentType(MediaType.APPLICATION_JSON).content(webHooksStr))
                .andDo(print())
                .andExpect(status().isOk());
    }

    @Test
    public void T050DockerfilePreview() throws Exception {
        mockMvc.perform(post("/api/ci/build/dockerfile", buildInfo.getProjectId(), buildInfo.getId())
                .contentType(MediaType.APPLICATION_JSON).content(projectStr))
                .andDo(print())
                //.andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
    }

    @Test
    public void T060StartAutoBuild() throws Exception {
        mockMvc.perform(get("/api/ci/build/dockerfile/{projectId}/{buildId}", project.getId(), buildInfo.getId()))
                .andDo(print())
                .andExpect(status().isOk());
    }

    @Test
    public void T070UploadLogfile() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "test.txt", null, "test".getBytes());
        mockMvc.perform(fileUpload("/api/ci/build/upload/{projectId}/{buildId}", project.getId(), buildInfo.getId()).file(file).param("secret", "fortest"))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
    }

    @Test
    public void T080ListBuildInfo() throws Exception {
        mockMvc.perform(get("/api/ci/build/{projectId}", project.getId()))
                .andDo(print())
                .andExpect(status().isOk());
    }
}
