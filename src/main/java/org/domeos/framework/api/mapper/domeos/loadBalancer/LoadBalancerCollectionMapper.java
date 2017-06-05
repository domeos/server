package org.domeos.framework.api.mapper.domeos.loadBalancer;

import java.util.List;

import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Options;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;
import org.domeos.framework.api.model.loadBalancer.LoadBalancerCollection;
import org.domeos.global.GlobalConstant;

/**
 * Created by jackfan on 2017/2/27.
 */
@Mapper
public interface LoadBalancerCollectionMapper {
    @Insert("INSERT INTO " + GlobalConstant.LOADBALANCER_COLLECTION_TABLE_NAME +
            " (name, description, state, createTime, removeTime, removed, data) values (" +
            " #{item.name}, #{item.description}, #{item.state}, #{item.createTime}, #{item.removeTime}, " +
            " #{item.removed}, #{data})")
    @Options(useGeneratedKeys = true, keyProperty = "item.id", keyColumn = "id")
    int insertLoadBalancerCollection(@Param("item") LoadBalancerCollection item, @Param("data") String data);
    
    @Update("UPDATE " + GlobalConstant.LOADBALANCER_COLLECTION_TABLE_NAME + " SET" +
            " name=#{item.name}, description=#{item.description}, state=#{item.state}, createTime=#{item.createTime}," +
            " removeTime=#{item.removeTime}, removed=#{item.removed}, data=#{data} WHERE id=#{item.id}")
    void updateLoadBalancerCollection(@Param("item") LoadBalancerCollection item, @Param("data") String data);
    
    @Select("SELECT * FROM " + GlobalConstant.LOADBALANCER_COLLECTION_TABLE_NAME + " WHERE id IN ${idList}")
    List<LoadBalancerCollection> listLoadBalancerCollectionIncludeRemovedByIdList(@Param("idList") String idList);
}
