package org.domeos.framework.api.consolemodel.alarm;

/**
 * Created by baokangwang on 2016/3/31.
 */
public class UserGroupInfo {

    private long id;
    private String userGroupName;

    public UserGroupInfo() {
    }

    public UserGroupInfo(long id, String userGroupName) {
        this.id = id;
        this.userGroupName = userGroupName;
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
}
