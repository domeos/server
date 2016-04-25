package org.domeos.api.controller.global;

import com.fasterxml.jackson.databind.DeserializationFeature;
import org.apache.shiro.util.ThreadContext;
import org.domeos.framework.api.model.global.LdapInfo;
import org.domeos.base.BaseTestCase;
import org.domeos.basemodel.ResultStat;
import org.junit.Before;
import org.junit.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;

import java.io.FileInputStream;
import java.io.IOException;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.setup.MockMvcBuilders.webAppContextSetup;

/**
 * Created by feiliu206363 on 2015/12/30.
 */
public class LdapInfoControllerTest extends BaseTestCase {
    LdapInfo ldapInfo;
    String ldapInfoStr;
    String ldapLoginInfoStr;

    @Before
    public void setup() throws IOException {
        ThreadContext.bind(securityManager);

        objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        FileInputStream ldapInfoFileInputStream = new FileInputStream("./src/test/resources/global/ldapInfo.json");
        byte[] ldapInfoBuff = new byte[ldapInfoFileInputStream.available()];
        ldapInfoFileInputStream.read(ldapInfoBuff);
        ldapInfo = objectMapper.readValue(ldapInfoBuff, LdapInfo.class);
        ldapInfoStr = new String(ldapInfoBuff);

        FileInputStream ldapLoginInfoFileInputStream = new FileInputStream("./src/test/resources/global/loginInfo.json");
        byte[] ldapLoginInfoBuff = new byte[ldapLoginInfoFileInputStream.available()];
        ldapLoginInfoFileInputStream.read(ldapLoginInfoBuff);
        ldapLoginInfoStr = new String(ldapLoginInfoBuff);

        this.mockMvc = webAppContextSetup(this.wac).build();
        login("admin","admin");
    }

    @Test
    public void T010Set() throws Exception {
        mockMvc.perform(post("/api/global/ldapconfig").contentType(MediaType.APPLICATION_JSON).content(ldapInfoStr))
                .andDo(print())
                .andExpect(status().isOk());
    }

    @Test
    public void T020Get() throws Exception {
        mockMvc.perform(get("/api/global/ldapconfig"))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
    }

    @Test
    public void T030() throws Exception {
        mockMvc.perform(put("/api/global/ldapconfig").contentType(MediaType.APPLICATION_JSON).content(ldapInfoStr))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
    }

    @Test
    public void T040Login() throws Exception {
        mockMvc.perform(post("/api/global/ldapconfig/login").contentType(MediaType.APPLICATION_JSON).content(ldapLoginInfoStr))
                .andDo(print())
                .andExpect(status().isOk());
    }

    @Test
    public void T050Delete() throws Exception {
        mockMvc.perform(delete("/api/global/gitconfig/{id}", ldapInfo.getId()))
                .andDo(print())
                .andExpect(MockMvcResultMatchers.jsonPath("$.resultCode").value(ResultStat.OK.responseCode))
                .andExpect(status().isOk());
    }
}
