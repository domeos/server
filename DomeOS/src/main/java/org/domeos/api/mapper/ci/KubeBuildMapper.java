package org.domeos.api.mapper.ci;

import org.apache.ibatis.annotations.*;
import org.domeos.api.model.ci.KubeBuild;
import org.springframework.stereotype.Repository;

/**
 * Created by feiliu206363 on 2015/12/3.
 */
@Repository
public interface KubeBuildMapper {
    @Insert("INSERT INTO kube_build (buildId, jobName, jobStatus) VALUES (#{buildId}, #{jobName}, #{jobStatus})")
    @Options(useGeneratedKeys = true, keyProperty = "id", keyColumn = "id")
    int addKubeBuild(KubeBuild kubeBuild);

    @Update("UPDATE kube_build SET jobStatus=#{jobStatus} WHERE buildId=#{buildId}")
    int updateKubeBuildStatusByBuildId(KubeBuild kubeBuild);

    @Select("SELECT * FROM kube_build WHERE buildId = #{buildId}")
    KubeBuild getKubeBuildByBuildId(@Param("buildId") int buildId);
}
