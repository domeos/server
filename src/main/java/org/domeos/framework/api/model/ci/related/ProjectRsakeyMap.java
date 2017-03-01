package org.domeos.framework.api.model.ci.related;

/**
 * Created by feiliu206363 on 2016/4/6.
 */
public class ProjectRsakeyMap {
    private int id;
    private int projectId;
    private int rsaKeypairId;
    private int keyId;
    private String state;
    private long createTime;

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public int getProjectId() {
        return projectId;
    }

    public void setProjectId(int projectId) {
        this.projectId = projectId;
    }

    public int getRsaKeypairId() {
        return rsaKeypairId;
    }

    public void setRsaKeypairId(int rsaKeypairId) {
        this.rsaKeypairId = rsaKeypairId;
    }

    public int getKeyId() {
        return keyId;
    }

    public void setKeyId(int keyId) {
        this.keyId = keyId;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public long getCreateTime() {
        return createTime;
    }

    public void setCreateTime(long createTime) {
        this.createTime = createTime;
    }
}
