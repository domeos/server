package org.domeos.api.controller.dockerimage;

import org.apache.shiro.util.ThreadContext;
import org.domeos.base.BaseTestCase;
import org.junit.Before;
import org.junit.Test;

import java.io.IOException;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.setup.MockMvcBuilders.webAppContextSetup;

/**
 * Created by feiliu206363 on 2015/12/17.
 */
public class DockerImageControllerTest extends BaseTestCase {
    @Before
    public void setup() throws IOException {
        ThreadContext.bind(securityManager);

        this.mockMvc = webAppContextSetup(this.wac).build();
        login("admin", "admin");
    }

    @Test
    public void T010List() throws Exception {
        mockMvc.perform(get("/api/dockerimage"))
                .andDo(print())
//                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
    }

    @Test
    public void T020Get() throws Exception {
        mockMvc.perform(get("/api/dockerimage/detail").param("name", "test"))
                .andDo(print())
                //.andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
    }

    @Test
    public void T030ListAll() throws Exception {
        mockMvc.perform(get("/api/global/dockerimages"))
                .andDo(print())
//                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
    }

    @Test
    public void T030GetDockerImage() throws Exception {
        mockMvc.perform(get("/global/dockerimages/test"))
                .andDo(print())
//                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
    }
}
