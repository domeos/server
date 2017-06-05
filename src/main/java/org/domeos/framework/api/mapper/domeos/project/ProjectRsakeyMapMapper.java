package org.domeos.framework.api.mapper.domeos.project;

import org.apache.ibatis.annotations.*;
import org.domeos.framework.api.model.ci.related.ProjectRsakeyMap;
import org.domeos.framework.api.model.ci.related.RSAKeyPair;
import org.domeos.global.GlobalConstant;

/**
 * Created by feiliu206363 on 2016/4/6.
 */
@Mapper
public interface ProjectRsakeyMapMapper {
    @Select("SELECT * FROM project_rsakey_map WHERE projectId=#{projectId} LIMIT 1")
    ProjectRsakeyMap getRSAKeypairMapByProjectId(@Param("projectId") int id);

    @Delete("DELETE FROM project_rsakey_map WHERE projectId=#{projectId}")
    void deleteRSAKeypairMapByProjectId(@Param("projectId") int id);

    @Insert("INSERT INTO project_rsakey_map (projectId, rsaKeypairId, keyId, state, createTime)" +
            " VALUES (#{projectId}, #{rsaKeypairId}, #{keyId}, #{state}, #{createTime})")
    @Options(useGeneratedKeys = true, keyProperty = "id", keyColumn = "id")
    void addProjectRsaMap(ProjectRsakeyMap projectRsakeyMap);

    @Select("SElECT * FROM rsa_keypair WHERE id=(SELECT rsaKeypairId FROM rsa_keypair WHERE keyId = #{keyId} LIMIT 1)")
    RSAKeyPair getRSAKeyPairByKeyId(@Param("keyId") int keyId);

    @Insert("INSERT INTO " + GlobalConstant.RSAKEYPAIR_TABLE_NAME +
            " (name, description, state, createTime, removeTime, removed, data) values (" +
            " #{item.name}, #{item.description}, #{item.state}, #{item.createTime}, #{item.removeTime}," +
            " #{item.removed}, #{data})")
    @Options(useGeneratedKeys = true, keyProperty = "item.id", keyColumn = "id")
    int insertRsaKeypair(@Param("item") RSAKeyPair item, @Param("data") String data);

}
