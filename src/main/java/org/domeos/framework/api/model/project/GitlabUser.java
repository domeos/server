package org.domeos.framework.api.model.project;

/**
 * Created by feiliu206363 on 2016/4/5.
 */
public class GitlabUser {
    int id;
    int userId;
    String name;
    String token;
    long createTime;
    int gitlabId;

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

    public int getGitlabId() {
        return gitlabId;
    }

    public void setGitlabId(int gitlabId) {
        this.gitlabId = gitlabId;
    }
}
