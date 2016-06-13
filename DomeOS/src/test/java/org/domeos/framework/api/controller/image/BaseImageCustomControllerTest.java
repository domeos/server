package org.domeos.framework.api.controller.image;

import com.fasterxml.jackson.databind.DeserializationFeature;
import org.apache.shiro.util.ThreadContext;
import org.domeos.base.BaseTestCase;
import org.domeos.basemodel.ResultStat;
import org.domeos.framework.api.model.ci.related.BuildResult;
import org.domeos.framework.api.model.global.CiCluster;
import org.domeos.framework.api.model.image.BaseImageCustom;
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
public class BaseImageCustomControllerTest extends BaseTestCase {

    BaseImageCustom baseImageCustom;
    String baseImageCustomStr;

    CiCluster ciCluster;
    String ciClusterStr;

    @Before
    public void setup() throws IOException {

        ThreadContext.bind(securityManager);
        objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

        FileInputStream fileInputStream = new FileInputStream("./src/test/resources/ci/baseImageCustom.json");
        byte[] buff = new byte[fileInputStream.available()];
        fileInputStream.read(buff);
        baseImageCustom = objectMapper.readValue(buff, BaseImageCustom.class);
        baseImageCustomStr = new String(buff);

        FileInputStream fileInputStream2 = new FileInputStream("./src/test/resources/global/cicluster.json");
        byte[] buff2 = new byte[fileInputStream2.available()];
        fileInputStream2.read(buff2);
        ciCluster = objectMapper.readValue(buff2, CiCluster.class);
        ciClusterStr = new String(buff2);

        this.mockMvc = webAppContextSetup(this.wac).build();
        login("admin", "admin");
    }

    @Test
    public void T010Add() throws Exception {
        mockMvc.perform(post("/api/image/custom").contentType(MediaType.APPLICATION_JSON).content(baseImageCustomStr))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
    }

    @Test
    public void T020Get() throws Exception {
        mockMvc.perform(get("/api/image/custom/{id}", 1))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
    }

    @Test
    public void T030List() throws Exception {
        mockMvc.perform(post("/api/global/ci/cluster").contentType(MediaType.APPLICATION_JSON).content(ciClusterStr))
                .andDo(print())
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/image/custom"))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
    }

    @Test
    public void T050GetLog() throws Exception {
        mockMvc.perform(get("/api/image/custom/download/{imageId}", 1))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
    }

    @Test
    public void T060PreviewLog() throws Exception {
        mockMvc.perform(get("/api/image/custom/preview/{docMD5}", "34").contentType(MediaType.APPLICATION_JSON).content(baseImageCustomStr))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
    }

    @Test
    public void T070Validate() throws Exception {
        mockMvc.perform(post("/api/image/custom/validate").param("imageName", "aaa").param("imageTag", "bbb"))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
    }

    @Test
    public void T080Build() throws Exception {
        mockMvc.perform(post("/api/image/custom/build/{imageId}", 1))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
    }

    @Test
    public void T090Delete() throws Exception {
        mockMvc.perform(delete("/api/image/custom/{id}", 1))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
    }






}
