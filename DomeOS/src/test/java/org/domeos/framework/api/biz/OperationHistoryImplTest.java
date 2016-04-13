package org.domeos.framework.api.biz;

import org.domeos.base.BaseTestCase;
import org.domeos.framework.api.model.operation.OperationRecord;
import org.domeos.framework.api.model.operation.OperationType;
import org.domeos.framework.api.model.resource.related.ResourceType;
import org.junit.Test;
import org.springframework.beans.factory.annotation.Autowired;

import static org.junit.Assert.*;
import static org.junit.Assert.assertEquals;

/**
 * Created by sparkchen on 16/4/6.
 */
public class OperationHistoryImplTest extends BaseTestCase {

    @Autowired
    OperationHistory operationHistory;
    @Test
    public void testInsertRecord() throws Exception {
        OperationRecord record = new OperationRecord();
        record.setMessage("m1");
        record.setOperation(OperationType.DELETE);
        record.setUserId(10);
        record.setStatus("active");
        record.setUserName("name123");
        record.setResourceType(ResourceType.CLUSTER);
        record.setResourceId(100);
        operationHistory.insertRecord(record);
        OperationRecord out = operationHistory.getById(1);
        assertEquals(out.getId(), 1);
        assertEquals(out.getOperation(), OperationType.DELETE);
        assertEquals(out.getUserId(), 10);
        assertEquals(out.getResourceId(), 100);
        assertEquals(out.getMessage(), "m1");
    }

    @Test
    public void testUpdateStatus() throws Exception {

    }
}