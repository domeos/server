package org.domeos.api.model.git;


import org.apache.commons.lang3.StringUtils;

/**
 * Created by feiliu206363 on 2015/11/17.
 */
public class Gitlab {
    int id;
    int userId;
    String name;
    String token;
    long createTime;

    public Gitlab() {}

    public Gitlab(int userId, String name, String token, long createTime) {
        this.userId = userId;
        this.name = name;
        this.token = token;
        this.createTime = createTime;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public int getUserId() {
        return userId;
    }

    public void setUserId(int userId) {
        this.userId = userId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public long getCreateTime() {
        return createTime;
    }

    public void setCreateTime(long createTime) {
        this.createTime = createTime;
    }

    public String checkLegality() {
        if (StringUtils.isBlank(name)) {
            return "git lab name is null";
        } else if (StringUtils.isBlank(token)) {
            return "git lab token is null";
        } else {
            return null;
        }
    }
}
