package org.domeos.api.controller.ci;

import com.fasterxml.jackson.databind.DeserializationFeature;
import org.apache.shiro.util.ThreadContext;
import org.domeos.framework.api.model.image.BaseImage;
import org.domeos.base.BaseTestCase;
import org.domeos.basemodel.ResultStat;
import org.junit.Before;
import org.junit.FixMethodOrder;
import org.junit.Test;
import org.junit.runners.MethodSorters;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;

import java.io.FileInputStream;
import java.io.IOException;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.setup.MockMvcBuilders.webAppContextSetup;

/**
 * Created by feiliu206363 on 2015/11/18.
 */
@FixMethodOrder(MethodSorters.NAME_ASCENDING)
public class BaseImageControllerTest extends BaseTestCase {
    BaseImage baseImage;
    String baseImageStr;

    @Before
    public void setup() throws IOException {
        ThreadContext.bind(securityManager);

        objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        FileInputStream fileInputStream = new FileInputStream("./src/test/resources/ci/baseImage.json");
        byte[] buff = new byte[fileInputStream.available()];
        fileInputStream.read(buff);
        baseImage = objectMapper.readValue(buff, BaseImage.class);
        baseImageStr = new String(buff);
        this.mockMvc = webAppContextSetup(this.wac).build();
    }

    @Test
    public void T010Set() throws Exception {
        mockMvc.perform(MockMvcRequestBuilders
                .post("/api/ci/baseimage").contentType(MediaType.APPLICATION_JSON).content(baseImageStr))
                .andDo(print())
                .andExpect(status().isOk());
    }

    @Test
    public void T020Get() throws Exception {
        mockMvc.perform(get("/api/ci/baseimage/{id}", baseImage.getId()))
                .andDo(print())
//                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
    }

    @Test
    public void T030List() throws Exception {
        mockMvc.perform(get("/api/ci/baseimage"))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
    }

    @Test
    public void T040Delete() throws Exception {
        mockMvc.perform(MockMvcRequestBuilders
                .delete("/api/ci/baseimage/{id}", baseImage.getId()))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
    }
}
