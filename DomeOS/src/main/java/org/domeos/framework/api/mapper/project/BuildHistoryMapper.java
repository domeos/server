package org.domeos.framework.api.mapper.project;

import org.apache.ibatis.annotations.*;
import org.domeos.framework.api.model.ci.BuildHistory;
import org.domeos.framework.api.model.ci.related.BuildState;
import org.domeos.framework.engine.mapper.RowMapper;
import org.domeos.framework.engine.model.RowMapperDao;
import org.domeos.global.GlobalConstant;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Created by feiliu206363 on 2016/4/5.
 */
@Repository
public interface BuildHistoryMapper {
    @Select("SELECT * FROM build_history WHERE id = (SELECT MAX(id) FROM build_history WHERE projectId=#{projectId})")
    BuildHistory getLatestBuildInfo(@Param("projectId") int projectId);

    @Insert("INSERT INTO build_history (name, description, state, createTime, removeTime, removed, data, projectId, secret, dockerfileContent) values (" +
            " #{item.name}, #{item.description}, #{item.state}, #{item.createTime}, #{item.removeTime}," +
            " #{item.removed}, #{data}, #{item.projectId}, #{item.secret}, #{item.dockerfileContent})")
    @Options(useGeneratedKeys = true, keyProperty = "item.id", keyColumn = "id")
    int insertRow(@Param("item") BuildHistory item, @Param("data") String data);

    @Update("UPDATE " + GlobalConstant.BUILDHISTORY_TABLE_NAME + " SET state=#{item.state}, data=#{item.data} WHERE id=#{item.id}")
    void updateBuildHistory(@Param("item") RowMapperDao item);

    @Update("UPDATE build_history SET log=#{log} WHERE id=#{id}")
    void insertLogById(@Param("id") int id, @Param("log") byte[] log);

    @Select("SELECT secret FROM build_history WHERE id=#{id}")
    String getSecretById(@Param("id") int id);

    @Select("SELECT dockerfileContent FROM build_history WHERE id=#{id}")
    String getDockerfileContentById(@Param("id") int buildId);

    @Update("UPDATE build_history SET taskName=#{item.taskName}, state=#{item.state}, data=#{data} WHERE id=#{item.id}")
    void addTaskNameAndStatus(@Param("item") BuildHistory buildHistory, @Param("data")String data);

    @Select("SELECT log FROM build_history WHERE id=#{id}")
    String getLogById(@Param("id") int buildId);

    @Select("SELECT " + RowMapper.BASIC_COLUMNS + "  FROM build_history WHERE projectId=#{projectId} ORDER BY id DESC")
    List<RowMapperDao> getBuildHistoryByProjectId(@Param("projectId") int projectId);

    @Update("UPDATE build_history SET state=#{state} WHERE id=#{id}")
    void setHistoryStatus(@Param("id") int id, @Param("state") BuildState state);

    @Select("SELECT taskName FROM build_history where id=#{id}")
    String getBuildTaskNameById(@Param("id") int buildId);

    @Select("SELECT * FROM build_history where removed=0")
    List<RowMapperDao> getAllHistory();

    @Select("SELECT taskName FROM build_history where removed=0")
    String getTaskName();
}
