package org.domeos.framework.api.model.auth.related;

import org.domeos.framework.api.model.auth.User;

/**
 * Created by KaiRen on 2017/1/18.
 */
public class UserInfo extends User {
    private boolean adminPrivilege;

    public UserInfo(User user, boolean adminPrivilege) {
        setUpdateTime(user.getUpdateTime());
        setCreateTime(user.getCreateTime());
        setId(user.getId());
        setPhone(user.getPhone());
        setEmail(user.getEmail());
        setLoginType(user.getLoginType());
        setState(user.getState());
        setUsername(user.getUsername());
        this.adminPrivilege = adminPrivilege;
    }

    public boolean isAdminPrivilege() {
        return adminPrivilege;
    }

    public void setAdminPrivilege(boolean adminPrivilege) {
        this.adminPrivilege = adminPrivilege;
    }
}
