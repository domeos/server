package org.domeos.framework.api.controller.exception;

import org.domeos.framework.api.model.operation.OperationType;
import org.domeos.framework.api.model.collection.related.ResourceType;

/**
 * Created by baokangwang on 2016/4/5.
 */
public class PermitException extends RuntimeException {

    public PermitException(String message) {
        super(message);
    }

    public PermitException(int userId, int resourceId, ResourceType resourceType, OperationType operationType) {
        super(String.format("permit fatal, user:%d operate:%s on resource:%d ___type:%s", userId, operationType, resourceId, resourceType));
    }

    public PermitException(int userId, int collectionId, ResourceType resourceType, OperationType operationType, int dstUserId) {
        super(String.format("permit fatal, user:%d operate:%s on collection_id:%d dst_user_id:%s ___type:%s", userId, operationType,
                collectionId, dstUserId, resourceType));
    }
}
