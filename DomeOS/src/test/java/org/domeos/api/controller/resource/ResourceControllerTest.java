package org.domeos.api.controller.resource;

import com.fasterxml.jackson.databind.DeserializationFeature;
import org.apache.shiro.util.ThreadContext;
import org.domeos.api.model.console.resource.ResourceInfo;
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
public class ResourceControllerTest extends BaseTestCase {
    ResourceInfo resourceInfo;
    String resourceInfoStr;

    @Before
    public void setup() throws IOException {
        ThreadContext.bind(securityManager);

        objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        FileInputStream inputStream = new FileInputStream("./src/test/resources/resource/resourceinfo.json");
        byte[] buff = new byte[inputStream.available()];
        inputStream.read(buff);
        resourceInfo = objectMapper.readValue(buff, ResourceInfo.class);
        resourceInfoStr = new String(buff);

        this.mockMvc = webAppContextSetup(this.wac).build();
        login("admin", "admin");
    }

    @Test
    public void T010Set() throws Exception {
        mockMvc.perform(post("/api/resource").contentType(MediaType.APPLICATION_JSON).content(resourceInfoStr))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
    }

    @Test
    public void T020Get() throws Exception {
        mockMvc.perform(get("/api/resource/{type}/{id}", resourceInfo.getResource_type(), resourceInfo.getResource_id()))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
    }

    @Test
    public void T040Modify() throws Exception {
        mockMvc.perform(put("/api/resource").contentType(MediaType.APPLICATION_JSON).content(resourceInfoStr))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
    }

    @Test
    public void T050Delete() throws Exception {
        mockMvc.perform(delete("/api/resource/{resourceType}/{resourceId}/{ownerType}/{ownerId}",
                resourceInfo.getResource_type(), resourceInfo.getResource_id(),
                resourceInfo.getOwnerInfos().get(0).getOwner_type(), resourceInfo.getOwnerInfos().get(0).getOwner_id()))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
    }
}
