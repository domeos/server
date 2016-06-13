package org.domeos.framework.api.mapper.loadBalancer;

import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.domeos.global.GlobalConstant;
import org.springframework.stereotype.Repository;

/**
 * Created by xupeng on 16-4-6.
 */
@Repository
public interface UniqPortMapper {

    @Insert("INSERT INTO " + GlobalConstant.UNIQPORTINDEX_TABLE_NAME +
        " (lbid, port,clusterId) values (#{lbid}, #{port}, #{clusterId})")
    public void insertIndex(@Param("lbid") int lbid, @Param("port") int port, @Param("clusterId") int clusterId);

    @Select("SELECT lbid FROM " + GlobalConstant.UNIQPORTINDEX_TABLE_NAME +
        " WHERE port=#{port} AND clusterId=#{clusterId}")
    public Integer getLoadBalancerId(@Param("port") int port, @Param("clusterId") int clusterId);

    @Delete("DELETE FROM " + GlobalConstant.UNIQPORTINDEX_TABLE_NAME +
        " WHERE lbid=#{lbid}")
    public void deleteIndex(int lbid);

}
