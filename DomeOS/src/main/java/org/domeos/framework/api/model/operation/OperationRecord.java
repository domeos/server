package org.domeos.framework.api.model.operation;

import org.domeos.framework.api.model.collection.related.ResourceType;

import java.io.Serializable;

/**
 * Created by sparkchen on 16/4/5.
 */
public class OperationRecord implements Serializable {
    private int id = 0;
    private int resourceId = 0;
    private ResourceType resourceType;
    private OperationType Operation;
    private int userId = 0;
    private String userName = "";
    private String status = "";
    private String message = "";
    private long operateTime = 0;

    public OperationRecord() {
    }

    public OperationRecord(int resourceId, ResourceType resourceType, OperationType operation,
                           int userId, String userName, String status, String message, long operateTime) {
        this.resourceId = resourceId;
        this.resourceType = resourceType;
        Operation = operation;
        this.userId = userId;
        this.userName = userName;
        this.status = status;
        this.message = message;
        this.operateTime = operateTime;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public OperationType getOperation() {
        return Operation;
    }

    public void setOperation(OperationType operation) {
        Operation = operation;
    }

    public long getOperateTime() {
        return operateTime;
    }

    public void setOperateTime(long operateTime) {
        this.operateTime = operateTime;
    }

    public int getResourceId() {
        return resourceId;
    }

    public void setResourceId(int resourceId) {
        this.resourceId = resourceId;
    }

    public ResourceType getResourceType() {
        return resourceType;
    }

    public void setResourceType(ResourceType resourceType) {
        this.resourceType = resourceType;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public int getUserId() {
        return userId;
    }

    public void setUserId(int userId) {
        this.userId = userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }
}
