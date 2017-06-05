package org.domeos.framework.api.model.global;

import org.domeos.util.StringUtils;
import org.domeos.global.GlobalConstant;
import org.domeos.util.CommonUtil;

/**
 * Created by feiliu206363 on 2015/8/28.
 */

public class Server {

    private int id;
    private String url;
    private long createTime;
    private long lastUpdate;

    public Server() {
    }

    public Server(int id, String url, long createTime, long lastUpdate) {
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

    public String serverInfo() {
        if (url.startsWith(GlobalConstant.HTTP_PREFIX) || url.startsWith(GlobalConstant.HTTPS_PREFIX) ) {
            return url;
        } else {
            return GlobalConstant.HTTP_PREFIX + url;
        }
    }

    public String checkLegality() {
        if (StringUtils.isBlank(url)) {
            return "please check server settings, url must be set";
        }
        url = CommonUtil.fullUrl(url);
        return null;
    }
}
