package org.domeos.framework.api.model.alarm;

import org.domeos.util.StringUtils;

/**
 * Created by baokangwang on 2016/3/31.
 */
public class HostGroupInfoBasic {

    private long id;
    private String hostGroupName;
    private long creatorId;
    private String creatorName;
    private long createTime;
    private long updateTime;

    public HostGroupInfoBasic() {
    }

    public HostGroupInfoBasic(long id, String hostGroupName, long creatorId, String creatorName, long createTime, long updateTime) {
        this.id = id;
        this.hostGroupName = hostGroupName;
        this.creatorId = creatorId;
        this.creatorName = creatorName;
        this.createTime = createTime;
        this.updateTime = updateTime;
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public String getHostGroupName() {
        return hostGroupName;
    }

    public void setHostGroupName(String hostGroupName) {
        this.hostGroupName = hostGroupName;
    }

    public long getCreatorId() {
        return creatorId;
    }

    public void setCreatorId(long creatorId) {
        this.creatorId = creatorId;
    }

    public String getCreatorName() {
        return creatorName;
    }

    public void setCreatorName(String creatorName) {
        this.creatorName = creatorName;
    }

    public long getCreateTime() {
        return createTime;
    }

    public void setCreateTime(long createTime) {
        this.createTime = createTime;
    }

    public long getUpdateTime() {
        return updateTime;
    }

    public void setUpdateTime(long updateTime) {
        this.updateTime = updateTime;
    }

    public String checkLegality() {
        if (StringUtils.isBlank(hostGroupName)) {
            return "host group name is blank";
        }
        return null;
    }
}
