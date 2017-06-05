package org.domeos.framework.api.biz;

import org.domeos.framework.api.mapper.domeos.operation.OperationMapper;
import org.domeos.framework.api.model.operation.OperationRecord;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

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

    @Override
    public List<OperationRecord> listOperationRecordByUserNameTime(Integer userId, long operateTime) {
        return mapper.listOperationRecordByUserNameTime(userId, operateTime);
    }
}
