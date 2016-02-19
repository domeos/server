package org.domeos.api.model.global;

import org.apache.commons.lang3.StringUtils;

/**
 * Created by feiliu206363 on 2015/12/30.
 */
public class LdapLoginInfo {
    String server;
    String emailSuffix;
    String username;
    String password;

    public String getServer() {
        return server;
    }

    public void setServer(String server) {
        this.server = server;
    }

    public String getEmailSuffix() {
        return emailSuffix;
    }

    public void setEmailSuffix(String emailSuffix) {
        this.emailSuffix = emailSuffix;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String checkLegality() {
        if (StringUtils.isBlank(server)) {
            return "server must be set";
        }
        if (StringUtils.isBlank(username)) {
            return "username must be set";
        }
        if (StringUtils.isBlank(password)) {
            return "password must be set";
        }
        return null;
    }
}
