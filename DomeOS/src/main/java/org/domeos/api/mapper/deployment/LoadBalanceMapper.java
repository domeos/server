package org.domeos.api.mapper.deployment;

import org.apache.ibatis.annotations.*;
import org.domeos.api.model.deployment.LoadBalanceDBProto;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 */
@Repository
public interface LoadBalanceMapper {

    @Insert("INSERT INTO loadBalance (deployId, name, type, port, targetPort, clusterName, externalIPs) VALUES " +
            "(#{deployId}, #{name}, #{type}, #{port}, #{targetPort}, #{clusterName}, #{externalIPs})")
    void createLoadBalance(LoadBalanceDBProto loadBalanceDraft);

    @Select("SELECT * FROM loadBalance WHERE deployId=#{deployId}")
    List<LoadBalanceDBProto> getLoadBalanceByDeployId(@Param("deployId") long deployId);

    @Select("SELECT * FROM loadBalance WHERE port=#{port} AND clusterName=#{clusterName}")
    LoadBalanceDBProto getLoadBalanceByClusterPort(@Param("port") int port, @Param("clusterName") String clusterName);

    @Update("UPDATE loadBalance SET type=#{type}, name=#{name}, port=#{port}, targetPort=#{targetPort}, " +
            "clusterName=#{clusterName}, externalIPs=#{externalIPs} WHERE deployId=#{deployId}")
    void modifyLoadBalance(LoadBalanceDBProto loadBalanceDraft);

    @Delete("DELETE FROM loadBalance WHERE deployId=#{deployId}")
    void deleteLoadBalance(@Param("deployId") long deployId);

}
