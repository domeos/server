package org.domeos.framework.api.model.alarm;

/**
 * Created by KaiRen on 2016/9/27.
 */
public class UserGroupBasic {
    private long id;
    private String userGroupName;
    private long creatorId;
    private String creatorName;
    private long createTime;
    private long updateTime;

    public UserGroupBasic() {
    }

    public UserGroupBasic(long id, String userGroupName, long creatorId, String creatorName, long createTime, long updateTime) {
        this.id = id;
        this.userGroupName = userGroupName;
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

    public String getUserGroupName() {
        return userGroupName;
    }

    public void setUserGroupName(String userGroupName) {
        this.userGroupName = userGroupName;
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

}
