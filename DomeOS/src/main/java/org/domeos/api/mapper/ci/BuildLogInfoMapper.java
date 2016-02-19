package org.domeos.api.mapper.ci;

import org.apache.ibatis.annotations.*;
import org.domeos.api.model.ci.BuildLogInfo;
import org.springframework.stereotype.Repository;

/**
 * Created by feiliu206363 on 2015/11/24.
 */
@Repository
public interface BuildLogInfoMapper {
    @Select("SELECT * FROM build_log_info WHERE buildId = #{buildId}")
    BuildLogInfo getBuildLogInfoByBuildId(@Param("buildId") int buildId);

    @Insert("INSERT INTO build_log_info (projectId, buildId, md5) values (#{projectId}, #{buildId}, #{md5})")
    @Options(useGeneratedKeys = true, keyProperty = "id", keyColumn = "id")
    int addBuildLogInfo(BuildLogInfo buildLogInfo);

    @Update("UPDATE build_log_info SET projectId=#{projectId}, buildId=#{buildId}, md5=#{md5} WHERE id=#{id}")
    int updateBuildStatusById(BuildLogInfo buildLogInfo);
}
