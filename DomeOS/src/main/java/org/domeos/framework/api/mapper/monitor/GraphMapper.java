package org.domeos.framework.api.mapper.monitor;

import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Created by baokangwang on 2016/3/1.
 */
@Repository
public interface GraphMapper {

    @Select("SELECT DISTINCT counter FROM graph.endpoint_counter WHERE endpoint_id IN " +
            "(SELECT id FROM graph.endpoint WHERE endpoint IN (${endpoints})) AND LEFT(counter, 9) NOT LIKE \"container\" " +
            "ORDER BY counter")
    List<String> getNodeCountersByEndpoints(@Param("endpoints") String endpoints);

    @Select("SELECT id FROM graph.endpoint WHERE endpoint = #{endpoint}")
    int getEndpointId(@Param("endpoint") String endpoint);

    @Select("SELECT DISTINCT counter FROM graph.endpoint_counter WHERE endpoint_id=#{endpoint_id} AND LEFT(counter, 9) NOT LIKE \"container\"")
    List<String> getNodeCounterByEndpointId(@Param("endpoint_id") int endpointId);

    @Select("SELECT DISTINCT counter FROM graph.endpoint_counter WHERE endpoint_id IN " +
            "(SELECT id FROM graph.endpoint WHERE endpoint IN (${endpoints})) AND LEFT(counter, 9) LIKE \"container\" AND " +
            "RIGHT(counter, 64) IN (${containers}) ORDER BY counter")
    List<String> getContainerCountersByEndpoints(@Param("endpoints") String endpoints, @Param("containers") String containers);

}
