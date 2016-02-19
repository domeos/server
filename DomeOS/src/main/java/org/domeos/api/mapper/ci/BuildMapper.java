package org.domeos.api.mapper.ci;

import org.apache.ibatis.annotations.*;
import org.domeos.api.model.ci.BuildInfo;
import org.domeos.api.model.ci.BuildStatus;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Created by feiliu206363 on 2015/7/30.
 */
@Repository
public interface BuildMapper {
    @Select("SELECT * FROM build_info WHERE id = #{id}")
    BuildInfo getBuildInfoById(@Param("id") int buildId);

    @Insert("INSERT INTO build_info (projectId, codeBranch, codeTag, imageName, imageTag, imageSize, registry, cmtName," +
            "cmtId, cmtMessage, cmtAuthoredDate, cmtAuthorName, cmtAuthorEmail, cmtCommittedDate, cmtCommitterName," +
            "cmtCommitterEmail, createTime, finishTime, status, message, userId, userName, autoBuild, isGC) values" +
            "(#{projectId}, #{codeBranch}, #{codeTag}, #{imageName}, #{imageTag}, #{imageSize}, #{registry}, #{cmtName}," +
            "#{cmtId}, #{cmtMessage}, #{cmtAuthoredDate}, #{cmtAuthorName}, #{cmtAuthorEmail}, #{cmtCommittedDate}, #{cmtCommitterName}," +
            "#{cmtCommitterEmail}, #{createTime}, #{finishTime}, #{status}, #{message}, #{userId}, #{userName}, #{autoBuild}, #{isGC})")
    @Options(useGeneratedKeys = true, keyProperty = "id", keyColumn = "id")
    int addBuildInfo(BuildInfo buildInfoInfo);

    @Select("SELECT * FROM build_info WHERE projectId = #{projectId} ORDER BY id DESC")
    List<BuildInfo> getBuildInfoByProjectId(@Param("projectId") int projectId);

    @Select("SELECT * FROM build_info WHERE id = (SELECT MAX(id) FROM build_info WHERE projectId=#{projectId})")
    BuildInfo getLatestBuildInfo(@Param("projectId") int projectId);

    @Update("UPDATE build_info SET imageSize=#{imageSize}, status=#{status}, message=#{message}, finishTime=#{finishTime} WHERE id=#{buildId} and projectId=#{projectId}")
    int updateBuildStatusById(BuildStatus buildStatus);

    @Update("UPDATE build_info SET status=#{status} WHERE id=#{buildId}")
    int updateStatusByBuildId(@Param("buildId") int buildId, @Param("status") BuildInfo.StatusType status);

    @Select("SELECT * FROM build_info WHERE isGC = 0")
    List<BuildInfo> getUnGCBuildInfo();

    @Update("UPDATE build_info SET isGC=#{isGC}, message=#{message}, status=#{status} WHERE id = #{id}")
    void updateBuildGCInfoById(BuildInfo buildInfo);
}
