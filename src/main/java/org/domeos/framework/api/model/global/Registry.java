package org.domeos.framework.api.model.global;

import org.domeos.util.StringUtils;
import org.domeos.framework.api.model.token.related.RegistryTokenInfo;
import org.domeos.util.CommonUtil;

/**
 * Created by feiliu206363 on 2015/7/30.
 */
public class Registry {

    private int id;
    private String url;
    private String description;
    private int status;
    private String certification;
    private long createTime;
    private long lastUpdate;
    private RegistryTokenInfo tokenInfo;

    public Registry() {
    }

    public Registry(int id, String url, String description, int status, String certification, long createTime, long lastUpdate) {
        this.id = id;
        this.url = url;
        this.description = description;
        this.status = status;
        this.certification = certification;
        this.createTime = createTime;
        this.lastUpdate = lastUpdate;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public int getStatus() {
        return status;
    }

    public void setStatus(int status) {
        this.status = status;
    }

    public String getCertification() {
        return certification;
    }

    public void setCertification(String certification) {
        this.certification = certification;
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

    public String registryDomain() {
        return CommonUtil.domainUrl(url);
    }

    public String fullRegistry() {
        return CommonUtil.fullUrl(url);
    }

    public RegistryTokenInfo getTokenInfo() {
        return tokenInfo;
    }

    public void setTokenInfo(RegistryTokenInfo tokenInfo) {
        this.tokenInfo = tokenInfo;
    }

    public String checkLegality() {
        if (StringUtils.isBlank(url)) {
            return  "url and host port cannot be null at the same time";
        }
        if (status == 0 && url.startsWith("https://")) {
            url = "http://" + CommonUtil.domainUrl(url);
        }
        if (status == 1 && url.startsWith("http://")) {
            url = "https://" + CommonUtil.domainUrl(url);
        }
        url = CommonUtil.fullUrl(url);
        return null;
    }
}
