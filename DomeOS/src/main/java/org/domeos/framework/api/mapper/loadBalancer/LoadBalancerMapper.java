package org.domeos.framework.api.mapper.loadBalancer;

import org.apache.ibatis.annotations.*;
import org.domeos.framework.api.model.LoadBalancer.LoadBalancer;
import org.domeos.framework.api.model.LoadBalancer.related.DeployLoadBalancerPair;
import org.domeos.framework.engine.mapper.RowMapper;
import org.domeos.framework.engine.model.RowMapperDao;
import org.domeos.global.GlobalConstant;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Created by xupeng on 16-4-7.
 */
@Repository
public interface LoadBalancerMapper {

    @Select("select " + RowMapper.basicColumns + " from " + GlobalConstant.LoadBalancerTable +
            "  where id in (select loadBalancerId from " + GlobalConstant.LoadBalancerDeployMapTable +
            " where deployId = #{deployId} and removed = 0)")
    List<RowMapperDao> getLBListByDeploy(@Param("deployId") int deployId);

    @Insert("INSERT INTO " + GlobalConstant.LoadBalancerTable +
            " (name, description, state, createTime, removeTime, removed, data) values (" +
            " #{item.name}, #{item.description}, #{item.state}, #{item.createTime}, #{item.removeTime}," +
            " #{item.removed}, #{data})")
    @Options(useGeneratedKeys = true, keyProperty = "item.id", keyColumn = "id")
    int insertLoadBalancer(@Param("item") LoadBalancer item, @Param("data") String data);

    @Insert("INSERT INTO " + GlobalConstant.LoadBalancerDeployMapTable +
            " (name, description, state, createTime, removeTime, removed, data, deployId, loadBalancerId) values (" +
            " #{item.name}, #{item.description}, #{item.state}, #{item.createTime}, #{item.removeTime}, " +
            " #{item.removed}, #{data}, #{item.deployId}, #{item.loadBalancerId})")
    @Options(useGeneratedKeys = true, keyProperty = "item.id", keyColumn = "id")
    int insertIndexPair(@Param("item") DeployLoadBalancerPair item, @Param("data") String data);

    @Update("update " + GlobalConstant.LoadBalancerDeployMapTable + " set removed = 1, removeTime=${removeTime} " +
            "where deployId = ${deployId} AND loadBalancerId = ${lbid}")
    void removeIndexPair(@Param("deployId") int deployId, @Param("lbid") int lbid, @Param("removeTime") long removeTime);

}
