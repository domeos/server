package org.domeos.framework.api.mapper.domeos.loadBalancer;

import java.util.List;

import org.apache.ibatis.annotations.*;
import org.domeos.framework.api.model.loadBalancer.LoadBalancerEvent;
import org.domeos.framework.engine.model.RowMapperDao;
import org.domeos.global.GlobalConstant;

/**
 * Created by jackfan on 2017/2/28.
 */
@Mapper
public interface LoadBalancerEventMapper {
    
    @Insert("INSERT INTO " + GlobalConstant.LOADBALANCER_EVENT_TABLE_NAME +
            " (name, description, state, createTime, removeTime, removed, data, loadBalancerId) values (" +
            " #{item.name}, #{item.description}, #{item.state}, #{item.createTime}, #{item.removeTime}," +
            " #{item.removed}, #{data}, #{item.loadBalancerId})")
    @Options(useGeneratedKeys = true, keyProperty = "item.id", keyColumn = "id")
    int createLoadBalancerEvent(@Param("item") LoadBalancerEvent item, @Param("data") String data);
    
    @Update("UPDATE " + GlobalConstant.LOADBALANCER_EVENT_TABLE_NAME + " SET" +
            " name=#{item.name}, description=#{item.description}, state=#{item.state}, createTime=#{item.createTime}," +
            " removeTime=#{item.removeTime}, removed=#{item.removed}, loadBalancerId=#{item.loadBalancerId}, data=#{data} WHERE id=#{item.id}")
    void updateLoadBalancerEvent(@Param("item") LoadBalancerEvent item, @Param("data") String data);
    
    @Select("SELECT * FROM " + GlobalConstant.LOADBALANCER_EVENT_TABLE_NAME + " WHERE loadBalancerId=#{loadBalancerId} and removed = 0")
    List<RowMapperDao> listLoadBalancerEvent(@Param("loadBalancerId") int loadBalancerId);
    
    @Select("UPDATE " + GlobalConstant.LOADBALANCER_EVENT_TABLE_NAME + " SET removed=1 WHERE loadBalancerId=#{loadBalancerId}")
    void removeEventByLoadBalancerId(@Param("loadBalancerId") int loadBalancerId);
    
    @Select("SELECT * FROM " + GlobalConstant.LOADBALANCER_EVENT_TABLE_NAME +
            " WHERE state not in ('SUCCESS', 'FAILED', 'ABORTED') and removed = 0" )
    List<RowMapperDao> getUnfinishedEvent();
}
