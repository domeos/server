package org.domeos.framework.api.mapper.domeos.loadBalancer;

import java.util.List;

import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Options;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;
import org.domeos.framework.api.model.loadBalancer.LoadBalancer;
import org.domeos.framework.api.model.loadBalancer.related.DeployLoadBalancerMap;
import org.domeos.framework.api.mapper.domeos.base.RowMapper;
import org.domeos.framework.engine.model.RowMapperDao;
import org.domeos.global.GlobalConstant;

/**
 * Created by jackfan on 2017/2/27.
 */
@Mapper
public interface LoadBalancerMapper {
    @Select("SELECT " + RowMapper.BASIC_COLUMNS + " FROM " + GlobalConstant.LOADBALANCER_TABLE_NAME +
            "  WHERE id IN (SELECT loadBalancerId FROM " + GlobalConstant.LOADBALANCERDEPLOYMAP_TABLE_NAME +
            " WHERE deployId = #{deployId} AND removed = 0)")
    List<RowMapperDao> getLBListByDeploy(@Param("deployId") int deployId);

    @Insert("INSERT INTO " + GlobalConstant.LOADBALANCER_TABLE_NAME +
            " (name, description, state, createTime, removeTime, removed, data) values (" +
            " #{item.name}, #{item.description}, #{item.state}, #{item.createTime}, #{item.removeTime}," +
            " #{item.removed}, #{data})")
    @Options(useGeneratedKeys = true, keyProperty = "item.id", keyColumn = "id")
    int insertLoadBalancer(@Param("item") LoadBalancer item, @Param("data") String data);

    @Update("UPDATE " + GlobalConstant.LOADBALANCER_TABLE_NAME + " SET" +
            " name=#{item.name}, description=#{item.description}, state=#{item.state}, createTime=#{item.createTime}," +
            " data=#{data} WHERE id=#{item.id}")
    void updateLoadBalancer(@Param("item") LoadBalancer item, @Param("data") String data);
    
    @Insert("INSERT INTO " + GlobalConstant.LOADBALANCERDEPLOYMAP_TABLE_NAME +
            " (createTime, removeTime, removed, deployId, loadBalancerId) values (" +
            " #{item.createTime}, #{item.removeTime}, #{item.removed}," +
            " #{item.deployId}, #{item.loadBalancerId})")
    @Options(useGeneratedKeys = true, keyProperty = "item.id", keyColumn = "id")
    int insertLinkDeploy(@Param("item") DeployLoadBalancerMap item);
   
    @Update("UPDATE " + GlobalConstant.LOADBALANCERDEPLOYMAP_TABLE_NAME + " SET removed = 1, removeTime=#{removeTime} " +
            "WHERE deployId = #{deployId}")
    void removeLinkDeployByDeployId(@Param("deployId") int deployId, @Param("removeTime") long removeTime);
    
    @Update("UPDATE " + GlobalConstant.LOADBALANCERDEPLOYMAP_TABLE_NAME + " SET removed = 1, removeTime=#{removeTime} " +
            "WHERE loadBalancerId = #{lbId}")
    void removeLinkDeployByLoadBalancerId( @Param("lbId") int lbId, @Param("removeTime") long removeTime);
    
    @Update("UPDATE " + GlobalConstant.LOADBALANCERDEPLOYMAP_TABLE_NAME + " SET deployId = #{item.deployId}, createTime=#{item.createTime} " +
            "WHERE loadBalancerId = #{item.loadBalancerId}")
    void updateLinkDeploy(@Param("item") DeployLoadBalancerMap item);
    
    @Select("SELECT * FROM " + GlobalConstant.LOADBALANCER_TABLE_NAME + " WHERE id in ${idList}")
    List<LoadBalancer> listLoadBalancerIncludeRemovedByIdList( @Param("idList") String idList);
}
