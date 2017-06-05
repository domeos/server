package org.domeos.framework.api.model.global;

import org.domeos.util.StringUtils;

/**
 * Created by KaiRen on 2017/4/20.
 */
public class SsoInfo {
    private String casServerUrl;
    private String loginUrl;
    private String logoutUrl;
    private long createTime;
    private long lastUpdate;

    public SsoInfo() {
    }

    public SsoInfo(String casServerUrl, String loginUrl, String logoutUrl) {
        this.casServerUrl = casServerUrl;
        this.loginUrl = loginUrl;
        this.logoutUrl = logoutUrl;
    }

    public String getCasServerUrl() {
        return casServerUrl;
    }

    public long getCreateTime() {
        return createTime;
    }

    public void setCreateTime(long createTime) {
        this.createTime = createTime;
    }

    public void setCasServerUrl(String casServerUrl) {
        this.casServerUrl = casServerUrl;
    }

    public String getLoginUrl() {
        return loginUrl;
    }

    public void setLoginUrl(String loginUrl) {
        this.loginUrl = loginUrl;
    }

    public String getLogoutUrl() {
        return logoutUrl;
    }

    public void setLogoutUrl(String logoutUrl) {
        this.logoutUrl = logoutUrl;
    }

    public long getLastUpdate() {
        return lastUpdate;
    }

    public void setLastUpdate(long lastUpdate) {
        this.lastUpdate = lastUpdate;
    }

    public String checkLegality() {

        if (StringUtils.isBlank(casServerUrl)) {
            return "casServerUrl is not set";
        }
        if (StringUtils.isBlank(loginUrl)) {
            loginUrl = "/login";
        }
        if (StringUtils.isBlank(logoutUrl)) {
            logoutUrl = "/logout";
        }
        return null;
    }

}
