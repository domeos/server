package org.domeos.api.model.resource;

/**
 * Created by feiliu206363 on 2015/12/1.
 */
public class ResourceHistory {
    private int id;
    private String resourceType;
    private int resourceId;
    private String operation;
    private long userId;
    private long createTime;
    private String status;

    public ResourceHistory() {}

    public ResourceHistory(String resourceType, int resourceId, String operation, long userId, long createTime, String status) {
        this.resourceType = resourceType;
        this.resourceId = resourceId;
        this.operation = operation;
        this.userId = userId;
        this.createTime = createTime;
        this.status = status;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getResourceType() {
        return resourceType;
    }

    public void setResourceType(String resourceType) {
        this.resourceType = resourceType;
    }

    public int getResourceId() {
        return resourceId;
    }

    public void setResourceId(int resourceId) {
        this.resourceId = resourceId;
    }

    public String getOperation() {
        return operation;
    }

    public void setOperation(String operation) {
        this.operation = operation;
    }

    public long getUserId() {
        return userId;
    }

    public void setUserId(long userId) {
        this.userId = userId;
    }

    public long getCreateTime() {
        return createTime;
    }

    public void setCreateTime(long createTime) {
        this.createTime = createTime;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
