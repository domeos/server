package org.domeos.framework.api.consolemodel.alarm;

import org.domeos.framework.api.model.alarm.TemplateInfoBasic;
import org.domeos.framework.api.model.alarm.UserGroupBasic;
import org.domeos.framework.api.model.alarm.UserInfo;

import java.util.Comparator;
import java.util.List;

/**
 * Created by KaiRen on 2016/9/27.
 */
public class UserGroupDetail {
    private long id;
    private String userGroupName;
    private long creatorId;
    private String creatorName;
    private long createTime;
    private long updateTime;
    private List<UserInfo> userList;
    private List<TemplateInfoBasic> templateList;

    public UserGroupDetail() {
    }

    public UserGroupDetail(UserGroupBasic userGroupBasic) {
        this.id = userGroupBasic.getId();
        this.userGroupName = userGroupBasic.getUserGroupName();
        this.creatorId = userGroupBasic.getCreatorId();
        this.creatorName = userGroupBasic.getCreatorName();
        this.createTime = userGroupBasic.getCreateTime();
        this.updateTime = userGroupBasic.getUpdateTime();
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

    public List<UserInfo> getUserList() {
        return userList;
    }

    public void setUserList(List<UserInfo> userList) {
        this.userList = userList;
    }

    public List<TemplateInfoBasic> getTemplateList() {
        return templateList;
    }

    public void setTemplateList(List<TemplateInfoBasic> templateList) {
        this.templateList = templateList;
    }

    public static class UserGroupDetailComparator implements Comparator<UserGroupDetail> {
        @Override
        public int compare(UserGroupDetail t1, UserGroupDetail t2) {
            if (t2.getCreateTime() - t1.getCreateTime() > 0) {
                return 1;
            } else if (t2.getCreateTime() - t1.getCreateTime() < 0) {
                return -1;
            } else {
                return 0;
            }
        }
    }
}
