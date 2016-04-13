package org.domeos.framework.api.controller.project;

import com.fasterxml.jackson.databind.DeserializationFeature;
import org.apache.shiro.util.ThreadContext;
import org.domeos.base.BaseTestCase;
import org.domeos.basemodel.ResultStat;
import org.domeos.framework.api.consolemodel.project.ProjectCreate;
import org.domeos.framework.api.model.project.GitlabUser;
import org.domeos.framework.api.model.project.Project;
import org.domeos.framework.api.model.project.SubversionUser;
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
 * Created by feiliu206363 on 2016/4/7.
 */
@FixMethodOrder(MethodSorters.NAME_ASCENDING)
public class ProjectControllerTest extends BaseTestCase {

    ProjectCreate projectCreate;
    String projectCreateStr;

    Project project;
    String projectStr;

    GitlabUser gitlab;
    String gitlabStr;

    SubversionUser subversion;
    String subversionStr;

    @Before
    public void setup() throws IOException {
        ThreadContext.bind(securityManager);

        FileInputStream projectCreateStream = new FileInputStream("./src/test/resources/project/projectCreate.json");
        byte[] projectCreateStatus = new byte[projectCreateStream.available()];
        projectCreateStream.read(projectCreateStatus);
        projectCreate = objectMapper.readValue(projectCreateStatus, ProjectCreate.class);
        projectCreateStr = new String(projectCreateStatus);

        objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        FileInputStream projectInputStream = new FileInputStream("./src/test/resources/project/project.json");
        byte[] buffProject = new byte[projectInputStream.available()];
        projectInputStream.read(buffProject);
        project = objectMapper.readValue(buffProject, Project.class);
        projectStr = new String(buffProject);

        FileInputStream gitlabInputStream = new FileInputStream("./src/test/resources/project/gitlab.json");
        byte[] buffGitlab = new byte[gitlabInputStream.available()];
        gitlabInputStream.read(buffGitlab);
        gitlab = objectMapper.readValue(buffGitlab, GitlabUser.class);
        gitlabStr = new String(buffGitlab);

        FileInputStream subversionInputStream = new FileInputStream("./src/test/resources/project/subversion.json");
        byte[] buffSubversion = new byte[subversionInputStream.available()];
        subversionInputStream.read(buffSubversion);
        subversion = objectMapper.readValue(buffSubversion, SubversionUser.  class);
        subversionStr = new String(buffSubversion);

        this.mockMvc = webAppContextSetup(this.wac).build();
        login("test","test");
    }

    @Test
    public void T010Create() throws Exception {
        mockMvc.perform(post("/api/project").contentType(MediaType.APPLICATION_JSON).content(projectCreateStr))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
    }

    @Test
    public void T020Get() throws Exception {
        mockMvc.perform(get("/api/project/{id}", 1))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
    }

    @Test
    public void T030List() throws Exception {
        mockMvc.perform(get("/api/project"))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
    }

    @Test
    public void T040Modify() throws Exception {
        mockMvc.perform(put("/api/project").contentType(MediaType.APPLICATION_JSON).content(projectStr))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
    }

    @Test
    public void T050SetSvnInfo() throws Exception {
        mockMvc.perform(post("/api/project/git/subversioninfo").contentType(MediaType.APPLICATION_JSON).content(subversionStr))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
    }

    @Test
    public void T060SvnList() throws Exception {
        mockMvc.perform(get("/api/project/git/subversioninfo"))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
    }

    @Test
    public void T070GetBranches() throws Exception {
        mockMvc.perform(get("/api/project/branches/1"))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
    }

    @Test
    public void T080GetTags() throws Exception {
        mockMvc.perform(get("/api/project/tags/1"))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
    }

    @Test
    public void T080Delete() throws Exception {
        mockMvc.perform(delete("/api/project/{id}", project.getId()))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
    }
}