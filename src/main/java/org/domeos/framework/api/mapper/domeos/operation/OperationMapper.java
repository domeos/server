package org.domeos.framework.api.mapper.domeos.operation;

import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Options;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.domeos.framework.api.model.operation.OperationRecord;

import java.util.List;

/**
 * Created by sparkchen on 16/4/5.
 */
@Mapper
public interface OperationMapper {
    @Insert("insert into operation_history (resourceId, resourceType, operation, userId, userName, status, message, operateTime)" +
            " values (#{resourceId}, #{resourceType}, #{operation}, #{userId}, #{userName}, #{status}, #{message}, #{operateTime})")
    @Options(useGeneratedKeys = true, keyProperty = "id", keyColumn = "id")
    int insertRecord(OperationRecord record);

    @Select("select * from operation_history where id = #{id}")
    OperationRecord getById(int id);

    //@Todo resourceType needed to be removed
    @Select("SELECT * FROM operation_history WHERE userId = #{userId} AND operateTime >= #{operateTime}"
            + " AND resourceType in ('PROJECT','PROJECT_COLLECTION'"
            + ",'DEPLOY','DEPLOY_COLLECTION'"
            + ",'CONFIGURATION','CONFIGURATION_COLLECTION'"
            + ",'CLUSTER','LOADBALANCER','LOADBALANCER_COLLECTION')")
    List<OperationRecord> listOperationRecordByUserNameTime(@Param("userId") Integer userId, @Param("operateTime") long operateTime);
}
