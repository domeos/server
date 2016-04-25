package org.domeos.framework.api.biz;

import org.domeos.framework.api.mapper.operation.OperationMapper;
import org.domeos.framework.api.model.operation.OperationRecord;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * Created by feiliu206363 on 2016/4/5.
 */
@Service("operationHistory")
public class OperationHistoryImpl implements OperationHistory {
    @Autowired
    OperationMapper mapper;
    @Override
    public void insertRecord(OperationRecord record) {
        mapper.insertRecord(record);
    }

    @Override
    public void updateStatus(int id, String status) {

    }

    @Override
    public OperationRecord getById(int id) {
        return mapper.getById(id);
    }
}
