package org.domeos.api.controller.ci;

import com.fasterxml.jackson.databind.DeserializationFeature;
import org.apache.shiro.util.ThreadContext;
import org.domeos.base.BaseTestCase;
import org.domeos.basemodel.ResultStat;
import org.domeos.framework.api.model.ci.related.BuildResult;
import org.domeos.framework.api.model.image.BaseImageCustom;
import org.junit.Before;
import org.junit.Test;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;

import java.io.FileInputStream;
import java.io.IOException;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.setup.MockMvcBuilders.webAppContextSetup;

/**
 * Created by kairen on 02/03/16.
 */
public class BaseImageCustomControllerTest extends BaseTestCase {
    BaseImageCustom baseImageCustom;
    String baseImageCustomStr;
    BaseImageCustom dfileBaseImageCustom;
    String dfileBaseImageCustomStr;
    BuildResult buildStatus;
    String buildStatusStr;
    @Before
    public void setup() throws IOException {
        ThreadContext.bind(securityManager);
        objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

        FileInputStream buildStatusStream = new FileInputStream("./src/test/resources/ci/buildStatusBaseImage.json");
        byte[] buffStatus = new byte[buildStatusStream.available()];
        buildStatusStream.read(buffStatus);
        buildStatus = objectMapper.readValue(buffStatus, BuildResult.class);
        buildStatusStr = new String(buffStatus);

        FileInputStream dFileInputStream = new FileInputStream("./src/test/resources/ci/baseImageCustomDfile.json");
        byte[] dfileBuff = new byte[dFileInputStream.available()];
        dFileInputStream.read(dfileBuff);
        dfileBaseImageCustom = objectMapper.readValue(dfileBuff, BaseImageCustom.class);
        dfileBaseImageCustomStr = new String(dfileBuff);


        FileInputStream fileInputStream = new FileInputStream("./src/test/resources/ci/baseImageCustom.json");
        byte[] buff = new byte[fileInputStream.available()];
        fileInputStream.read(buff);
        baseImageCustom = objectMapper.readValue(buff, BaseImageCustom.class);
        baseImageCustomStr = new String(buff);
        this.mockMvc = webAppContextSetup(this.wac).build();
        login("admin", "admin");
    }

    @Test
    public void T010Add() throws Exception {
        mockMvc.perform(MockMvcRequestBuilders
                .post("/api/ci/custom").contentType(MediaType.APPLICATION_JSON).content(baseImageCustomStr))
                .andDo(print())
                .andExpect(status().isOk());
    }

    @Test
    public void T020getFileJson() throws Exception {
        mockMvc.perform(
                get("/api/ci/custom/download/1/c8e5ace8a9a8c524542d360b6dda5939?secret=1111"))
                .andDo(print());
    }

    @Test
    public void T030List() throws Exception {
        mockMvc.perform(get("/api/ci/custom"))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
    }

    @Test
    public void T040StartBuild() throws Exception {
        mockMvc.perform(post("/api/ci/custom/build/{imageId}", 2))
                .andDo(print())
                .andExpect(status().isOk());
    }

    @Test
    public void T050UploadLogfile() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "./src/test/resources/ci/test.txt", null, "test".getBytes());
        mockMvc.perform(fileUpload("/api/ci/custom/upload/{imageId}", 2).file(file).param("secret", "d4b89764-84b4-4d95-8f08-a973f6779597"))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
    }

    @Test
    public void T060SetBuildStatus() throws Exception {
        mockMvc.perform(
                post("/api/ci/custom/status?secret=d4b89764-84b4-4d95-8f08-a973f6779597").contentType(MediaType.APPLICATION_JSON).content(buildStatusStr))
                .andDo(print())
                .andExpect(status().isOk());
    }

    @Test
    public void T070GetBaseImageCustom() throws Exception {
        mockMvc.perform(
                get("/api/ci/custom/{id}",22)).andDo(print())
                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
    }

    @Test
    public void T080GetValidate() throws Exception {
        mockMvc.perform(
                post("/api/ci/custom/validate").param("imageName", "admin/test").param("imageTag","1")).andDo(print())
                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
    }

    @Test
    public void T090AddDfile() throws Exception {
        mockMvc.perform(MockMvcRequestBuilders
                .post("/api/ci/custom").contentType(MediaType.APPLICATION_JSON).content(dfileBaseImageCustomStr))
                .andDo(print())
                .andExpect(status().isOk());
    }

    @Test
    public void T0100Delete() throws Exception {
        mockMvc.perform(MockMvcRequestBuilders
                .delete("/api/ci/custom/24"))
                .andDo(print())
                .andExpect(status().isOk());
    }

}
