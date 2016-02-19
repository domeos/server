package org.domeos.api.mapper.resource;

import org.apache.ibatis.annotations.*;
import org.domeos.api.model.resource.Resource;
import org.domeos.api.model.resource.ResourceType;
import org.domeos.api.model.user.ResourceOwnerType;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Created by chinsf on 2015/11/29.
 */
@Repository
public interface ResourceMapper {
    @Insert("INSERT INTO sys_resources (resource_id, resource_type, owner_id, owner_type, role, update_time) VALUES (" +
            "#{resource_id}, #{resource_type}, #{owner_id}, #{owner_type},#{role}, #{update_time})")
    @Options(useGeneratedKeys = true, keyProperty = "id", keyColumn = "id")
    int addResource(Resource resource);

    @Update("UPDATE sys_resources set role=#{role} WHERE owner_id=#{owner_id} and owner_type=#{owner_type} and resource_id=#{resource_id} and resource_type=#{resource_type}")
    int modifyResource(Resource resource);

    @Select("SELECT * FROM sys_resources WHERE id=#{id}")
    Resource getResourceById(@Param("id") long id);

    @Select("SELECT * FROM sys_resources WHERE resource_id=#{resource_id} and resource_type=#{resource_type}")
    List<Resource> getResourceByResourceIdAndType(@Param("resource_id") Long resource_id, @Param("resource_type") ResourceType resource_type);

    @Select("SELECT * FROM sys_resources WHERE owner_id=#{owner_id} and owner_type=#{owner_type} and resource_id=#{resource_id} and resource_type=#{resource_type}")
    Resource getResource(@Param("owner_id") Long owner_id, @Param("owner_type") String owner_type,
                         @Param("resource_id") Long resource_id, @Param("resource_type") ResourceType resource_type);

    @Select("SELECT * FROM sys_resources WHERE owner_type=#{owner_type} and resource_id=#{resource_id} and resource_type=#{resource_type}")
    Resource getGroupResource(@Param("owner_type")String owner_type, @Param("resource_id") Long resource_id, @Param("resource_type") ResourceType resource_type);

    @Select("SELECT * FROM sys_resources "
            + "WHERE owner_id=#{owner_id} and owner_type=#{owner_type} and resource_type=#{resource_type}")
    List<Resource> getResourceByOwnerId(@Param("owner_id") Long owner_id, @Param("owner_type") String owner_type,
                                                  @Param("resource_type") ResourceType resource_type);

    @Select("SELECT * FROM sys_resources "
        + "WHERE owner_id in (SELECT group_id FROM sys_user_group WHERE user_id=#{user_id} ) and owner_type=#{owner_type} and resource_type=#{resource_type}")
    List<Resource> getGroupResourceByUserId(@Param("user_id") Long userId, @Param("owner_type") String owner_type,
                                        @Param("resource_type") ResourceType resource_type);

    @Select("SELECT distinct resource_id FROM sys_resources WHERE resource_type=#{resource_type}")
    List<Resource> getAllResourcesByType(@Param("resource_type") ResourceType resource_type);

    @Delete("DELETE FROM sys_resources WHERE resource_type=#{resource_type} AND resource_id=#{resource_id} AND owner_type=#{owner_type} AND owner_id=#{owner_id}")
    int deleteResource(@Param("resource_type") ResourceType resourceType, @Param("resource_id") long resourceId,
                       @Param("owner_type") ResourceOwnerType resourceOwnerType, @Param("owner_id") long ownerId);

    @Delete("DELETE FROM sys_resources WHERE resource_type=#{resource_type} AND resource_id=#{resource_id}")
    int deleteResourceByIdAndType(@Param("resource_type") ResourceType resourceType, @Param("resource_id") long resourceId);
}
