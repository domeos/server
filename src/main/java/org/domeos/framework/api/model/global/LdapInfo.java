package org.domeos.framework.api.model.global;

import org.domeos.util.StringUtils;

/**
 * Created by feiliu206363 on 2015/12/29.
 */
public class LdapInfo {

    private String emailSuffix;
    private String server;
    private long createTime;
    private long lastUpdate;

    public LdapInfo() {
    }

    public LdapInfo(String emailSuffix, String server, long createTime, long lastUpdate) {
        this.emailSuffix = emailSuffix;
        this.server = server;
        this.createTime = createTime;
        this.lastUpdate = lastUpdate;
    }

    public String getEmailSuffix() {
        return emailSuffix;
    }

    public void setEmailSuffix(String emailSuffix) {
        this.emailSuffix = emailSuffix;
    }

    public String getServer() {
        return server;
    }

    public void setServer(String server) {
        this.server = server;
    }

    public long getCreateTime() {
        return createTime;
    }

    public void setCreateTime(long createTime) {
        this.createTime = createTime;
    }

    public long getLastUpdate() {
        return lastUpdate;
    }

    public void setLastUpdate(long lastUpdate) {
        this.lastUpdate = lastUpdate;
    }

    public String checkLegality() {
        if (StringUtils.isBlank(server)) {
            return "ldap server must be set";
        }
        return null;
    }
}
