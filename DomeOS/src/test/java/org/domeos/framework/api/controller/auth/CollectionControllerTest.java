package org.domeos.framework.api.controller.auth;

import com.fasterxml.jackson.databind.DeserializationFeature;
import org.apache.shiro.util.ThreadContext;
import org.domeos.base.BaseTestCase;
import org.domeos.basemodel.ResultStat;
import org.junit.Before;
import org.junit.FixMethodOrder;
import org.junit.Test;
import org.junit.runners.MethodSorters;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;

import java.io.IOException;

import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.setup.MockMvcBuilders.webAppContextSetup;

/**
 * Created by KaiRen on 2016/9/22.
 */
@FixMethodOrder(MethodSorters.NAME_ASCENDING)

public class CollectionControllerTest extends BaseTestCase {
    @Autowired
    CollectionController collectionController;

    @Before
    public void setup() throws IOException {
        ThreadContext.bind(securityManager);
        objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        this.mockMvc = webAppContextSetup(this.wac).build();
        login("admin", "admin");
    }

    @Test
    public void T010AddCollectionMember() throws Exception {
        String jsonStr = readInJsonFromFile("./src/test/resources/auth/collection_member.json");
        String apiStr = "/api/collection_members/single";
        mockMvc.perform(MockMvcRequestBuilders
                .post(apiStr).contentType(MediaType.APPLICATION_JSON).content(jsonStr))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
    }

    @Test
    public void T020AddCollectionMembers() throws Exception {
        String jsonStr = readInJsonFromFile("./src/test/resources/auth/collection_members.json");
        String apiStr = "/api/collection_members/multiple";
        mockMvc.perform(MockMvcRequestBuilders
                .post(apiStr).contentType(MediaType.APPLICATION_JSON).content(jsonStr))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
    }

    @Test
    public void T030ListCollectionMembers() throws Exception {
        String apiStr = "/api/collection_members/{collectionId}/{resourceType}";
        mockMvc.perform(MockMvcRequestBuilders
                .get(apiStr, 991, "PROJECT_COLLECTION"))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
    }

    @Test
    public void T040DeleteCollectionMember() throws Exception {
        String apiStr = "/api/collection_members/{collectionId}/{userId}/{resourceType}";
        mockMvc.perform(MockMvcRequestBuilders
                .delete(apiStr, 991, 991, "PROJECT_COLLECTION"))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
    }


}
