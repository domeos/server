package org.domeos.api.mapper.resource;

import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Options;
import org.apache.ibatis.annotations.Select;
import org.domeos.api.model.resource.ResourceHistory;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Created by feiliu206363 on 2015/12/1.
 */
@Repository
public interface ResourceHistoryMapper {
    @Select("SELECT * FROM resource_history")
    List<ResourceHistory> getAllResourceHistory();

    @Insert("INSERT INTO resource_history (resourceType, resourceId, operation, userId, createTime, status) VALUES" +
            "(#{resourceType}, #{resourceId}, #{operation}, #{userId}, #{createTime}, #{status})")
    @Options(useGeneratedKeys = true, keyProperty = "id", keyColumn = "id")
    int addResourceHistory(ResourceHistory resourceHistory);
}
