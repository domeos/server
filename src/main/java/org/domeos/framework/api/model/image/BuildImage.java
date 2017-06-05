package org.domeos.framework.api.model.image;

import org.domeos.util.StringUtils;
import org.domeos.util.CommonUtil;

/**
 * Created by feiliu206363 on 2015/8/26.
 */
public class BuildImage {

    private int id;
    private String name;
    private long createTime;
    private long lastUpdate;

    public BuildImage() {
    }

    public BuildImage(int id, String name, long createTime, long lastUpdate) {
        this.id = id;
        this.name = name;
        this.createTime = createTime;
        this.lastUpdate = lastUpdate;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
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
        if (StringUtils.isBlank(name)) {
            return "build image must be set";
        }
        name = CommonUtil.domainUrl(name);
        return null;
    }
}
