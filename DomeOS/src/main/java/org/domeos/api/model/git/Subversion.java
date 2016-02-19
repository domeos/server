package org.domeos.api.model.git;

/**
 * Created by kairen on 16-1-19.
 */
public class Subversion {
    int id;
    int userId;
    String name;
    String password;
    long createTime;
    String svnPath;

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

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public long getCreateTime() {
        return createTime;
    }

    public void setCreateTime(long createTime) {
        this.createTime = createTime;
    }

    public String getSvnPath() {
        return svnPath;
    }

    public void setSvnPath(String svnPath) {
        this.svnPath = svnPath;
    }

    public Subversion() {
    }

    public Subversion(int userId, String name, String password, long createTime, String svnPath) {
        this.userId = userId;
        this.name = name;
        this.password = password;
        this.createTime = createTime;
        this.svnPath = svnPath;
    }
}
