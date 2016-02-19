package org.domeos.api.model.global;

import org.apache.commons.lang3.StringUtils;
import org.domeos.util.CommonUtil;

/**
 * Created by feiliu206363 on 2015/11/17.
 */
public class GitConfig {
    int id;
    GlobalType type;
    String url;
    long createTime;
    long lastUpdate;

    public GitConfig() {
    }

    public GitConfig(int id, GlobalType type, String url, long createTime, long lastUpdate) {
        this.id = id;
        this.type = type;
        this.url = url;
        this.createTime = createTime;
        this.lastUpdate = lastUpdate;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public GlobalType getType() {
        return type;
    }

    public void setType(GlobalType type) {
        this.type = type;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
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
        if (type == null) {
            return "code type must be set";
        } else if (!type.equals(GlobalType.GITLAB) && !type.equals(GlobalType.GITHUB)) {
            return "code type not support, we only support github or gitlab for now";
        } else if (StringUtils.isBlank(url)) {
            return "code repository url must be set";
        }
        url = CommonUtil.fullUrl(url);
        return null;
    }
}
