package org.domeos.framework.api.mapper.operation;

import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Options;
import org.apache.ibatis.annotations.Select;
import org.domeos.framework.api.model.operation.OperationRecord;
import org.springframework.stereotype.Repository;

/**
 * Created by sparkchen on 16/4/5.
 */
@Repository
public interface OperationMapper {
    @Insert("insert into operation_history (resourceId, resourceType, operation, userId, userName, status, message, operateTime)" +
        " values (#{resourceId}, #{resourceType}, #{operation}, #{userId}, #{userName}, #{status}, #{message}, #{operateTime})")
    @Options(useGeneratedKeys = true, keyProperty = "id", keyColumn = "id")
    int insertRecord(OperationRecord record);

    @Select("select * from operation_history where id = #{id}")
    OperationRecord getById(int id);
}
