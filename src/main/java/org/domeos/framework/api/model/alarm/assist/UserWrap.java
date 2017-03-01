package org.domeos.framework.api.model.alarm.assist;

import java.util.List;

/**
 * Created by baokangwang on 2016/3/10.
 */
public class UserWrap {

    private String msg;
    private List<User> users;

    public UserWrap() {
    }

    public UserWrap(String msg, List<User> users) {
        this.msg = msg;
        this.users = users;
    }

    public String getMsg() {
        return msg;
    }

    public void setMsg(String msg) {
        this.msg = msg;
    }

    public List<User> getUsers() {
        return users;
    }

    public void setUsers(List<User> users) {
        this.users = users;
    }
}

