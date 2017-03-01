package org.domeos.framework.api.mapper.deployment;

import org.apache.ibatis.annotations.*;
import org.domeos.framework.api.biz.deployment.DeployCollectionBiz;
import org.domeos.framework.api.model.deployment.DeployCollection;
import org.domeos.global.GlobalConstant;


import java.util.List;

/**
 * Created by KaiRen on 2016/9/20.
 */
@Mapper
public interface DeployCollectionMapper {
    @Insert("INSERT INTO " + DeployCollectionBiz.DEPLOY_COLLECTION_NAME +
            " (name, description, state, createTime, removeTime, removed, data) values (" +
            " #{item.name}, #{item.description}, #{item.state}, #{item.createTime}, #{item.removeTime}," +
            " #{item.removed}, #{data})")
    @Options(useGeneratedKeys = true, keyProperty = "item.id", keyColumn = "id")
    int createDeployCollection(@Param("item") DeployCollection item, @Param("data") String data);

    @Update("update " + DeployCollectionBiz.DEPLOY_COLLECTION_NAME +
            " set name='${item.name}', description='${item.description}', state='${item.state}', " +
            "data='${data}' where id = ${item.id}")
    int updateDeployCollection(@Param("item") DeployCollection item, @Param("data") String data);

    @Select("SELECT * FROM " + GlobalConstant.DEPLOY_COLLETION_TABLE_NAME + " WHERE id IN ${idList}")
    List<DeployCollection> listDeployCollectionIncludeRemovedByIdList(@Param("idList") String idList);
}
