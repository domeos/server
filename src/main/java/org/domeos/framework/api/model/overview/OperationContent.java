package org.domeos.framework.api.model.overview;

import org.domeos.framework.api.model.collection.related.ResourceType;
import org.domeos.framework.api.model.operation.OperationType;

import java.util.Comparator;

/**
 * Created by junwuguo on 2017/2/16 0016.
 */
public class OperationContent {

    private String resourceName = "";
    private ResourceType resourceType;
    private OperationType operation;
    private int userId = 0;
    private String userName = "";
    private long operateTime = 0;

    public OperationContent(String resourceName, ResourceType resourceType, OperationType operation,
                            int userId, String userName, long operateTime) {
        this.resourceName = resourceName;
        this.resourceType = resourceType;
        this.operation = operation;
        this.userId = userId;
        this.userName = userName;
        this.operateTime = operateTime;
    }

    public String getResourceName() {
        return resourceName;
    }

    public void setResourceName(String resourceName) {
        this.resourceName = resourceName;
    }

    public ResourceType getResourceType() {
        return resourceType;
    }

    public void setResourceType(ResourceType resourceType) {
        this.resourceType = resourceType;
    }

    public OperationType getOperation() {
        return operation;
    }

    public void setOperation(OperationType operation) {
        operation = operation;
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

    public long getOperateTime() {
        return operateTime;
    }

    public void setOperateTime(long operateTime) {
        this.operateTime = operateTime;
    }

    public static class OperationContentListComparator implements Comparator<OperationContent> {
        @Override
        public int compare(OperationContent t1, OperationContent t2) {
            if (t1.getOperateTime() - t2.getOperateTime() > 0) {
                return -1;
            } else if (t1.getOperateTime() - t2.getOperateTime() < 0) {
                return 1;
            } else {
                return 0;
            }
        }
    }
}
