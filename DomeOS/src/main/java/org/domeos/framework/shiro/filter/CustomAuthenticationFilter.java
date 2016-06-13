package org.domeos.framework.shiro.filter;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.commons.lang3.StringUtils;
import org.apache.shiro.web.filter.authc.FormAuthenticationFilter;
import org.apache.shiro.web.util.WebUtils;
import org.domeos.framework.api.model.auth.related.LoginType;

import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import java.io.BufferedReader;
import java.io.IOException;

/**
 * Created by feiliu206363 on 2015/12/11.
 */

public class CustomAuthenticationFilter extends FormAuthenticationFilter {

    protected void redirectToLogin(final ServletRequest request, final ServletResponse response) throws IOException {
        final String loginUrl = getLoginUrl(request);
        WebUtils.issueRedirect(request, response, loginUrl);
    }

    private String getLoginUrl(final ServletRequest request) {
        // check login type
        final String loginType = getLoginType(request);
        // and return appropriate login url
        if (!StringUtils.isBlank(loginType) && loginType.equalsIgnoreCase(LoginType.LDAP.name())) {
            return "/api/user/login/ldap";
        } else {
            return "api/user/login/user";
        }
    }

    private String getLoginType(final ServletRequest request) {
        // get "User-Agent" header
        try {
            String jsonStr = "";
            String line;
            BufferedReader reader = request.getReader();
            while ((line = reader.readLine()) != null) {
                jsonStr += line;
            }
            if (jsonStr.length() <= 0) {
                return null;
            }
            ObjectMapper objectMapper = new ObjectMapper();
            JsonNode node = objectMapper.readValue(jsonStr, JsonNode.class);
            if (node.has("loginType")) {
                return node.get("loginType").asText();
            } else {
                return null;
            }
        } catch (IOException e) {
            return null;
        }
    }
}
