package org.domeos.framework.api.mapper.domeos.loadBalancer;

import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Options;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;
import org.domeos.framework.api.model.loadBalancer.UniqPort;
import org.domeos.global.GlobalConstant;

/**
 * Created by jackfan on 2017/3/2.
 */
@Mapper
public interface UniqPortMapper {
    @Insert("INSERT INTO " + GlobalConstant.UNIQPORTINDEX_TABLE_NAME +
            " (createTime, removeTime, removed, loadBalancerId, port, clusterId, ip) values (" +
            " #{item.createTime}, #{item.removeTime}, #{item.removed}," +
            " #{item.loadBalancerId}, #{item.port}, #{item.clusterId}, #{item.ip})")
    @Options(useGeneratedKeys = true, keyProperty = "item.id", keyColumn = "id")
    int insertUniqPort(@Param("item") UniqPort item);
    
    @Select("SELECT * FROM " + GlobalConstant.UNIQPORTINDEX_TABLE_NAME +
            " WHERE port = #{port} AND clusterId = #{clusterId} AND removed = 0 AND ip = #{ip}")
    UniqPort getUniqPort(@Param("ip") String ip, @Param("port") int port, @Param("clusterId") int clusterId);
    
    @Update("UPDATE " + GlobalConstant.UNIQPORTINDEX_TABLE_NAME + " SET removed = 1, removeTime=${removeTime} " +
            "WHERE loadBalancerId = ${lbId}")
    void removeUniqPortByLoadBalancerId( @Param("lbId") int lbId, @Param("removeTime") long removeTime);
}
