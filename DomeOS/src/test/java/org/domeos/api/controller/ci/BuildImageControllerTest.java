package org.domeos.api.controller.ci;

import com.fasterxml.jackson.databind.DeserializationFeature;
import org.apache.shiro.util.ThreadContext;
import org.domeos.framework.api.model.image.BuildImage;
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

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.setup.MockMvcBuilders.webAppContextSetup;

/**
 * Created by feiliu206363 on 2015/12/1.
 */
@FixMethodOrder(MethodSorters.NAME_ASCENDING)
public class BuildImageControllerTest extends BaseTestCase {
    BuildImage buildImage;
    String buildImageStr;

    @Before
    public void setup() throws IOException {
        ThreadContext.bind(securityManager);

        objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        FileInputStream fileInputStream = new FileInputStream("./src/test/resources/ci/buildImage.json");
        byte[] buff = new byte[fileInputStream.available()];
        fileInputStream.read(buff);
        buildImage = objectMapper.readValue(buff, BuildImage.class);
        buildImageStr = new String(buff);
        this.mockMvc = webAppContextSetup(this.wac).build();
        login("admin", "admin");
    }

    @Test
    public void T010Set() throws Exception {
        mockMvc.perform(post("/api/ci/buildimage").contentType(MediaType.APPLICATION_JSON).content(buildImageStr))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
    }

    @Test
    public void T020Get() throws Exception {
        mockMvc.perform(get("/api/ci/buildimage"))
                .andDo(print())
                .andExpect(status().isOk());
    }
}
