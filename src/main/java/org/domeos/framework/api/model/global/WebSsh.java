package org.domeos.framework.api.model.global;

import org.domeos.util.StringUtils;
import org.domeos.util.CommonUtil;

/**
 * Created by feiliu206363 on 2016/1/19.
 */

public class WebSsh {

    private int id;
    private String url;
    private long createTime;
    private long lastUpdate;

    public WebSsh() {
    }

    public WebSsh(int id, String url, long createTime, long lastUpdate) {
        this.id = id;
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
        if (StringUtils.isBlank(url)) {
            return "url must be set";
        }
        url = CommonUtil.fullUrl(url);
        return null;
    }
}
