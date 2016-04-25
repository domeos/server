package org.domeos.framework.api.mapper.resource;

import org.apache.ibatis.annotations.*;
import org.domeos.framework.api.model.resource.Resource;
import org.domeos.framework.api.model.resource.related.ResourceOwnerType;
import org.domeos.framework.api.model.resource.related.ResourceType;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Created by feiliu206363 on 2016/4/5.
 */
@Repository
public interface ResourcesMapper {
    @Insert("INSERT INTO resources (resourceId, resourceType, ownerId, ownerType, role, updateTime) VALUES (" +
            "#{resourceId}, #{resourceType}, #{ownerId}, #{ownerType}, #{role}, #{updateTime})")
    @Options(useGeneratedKeys = true, keyProperty = "id", keyColumn = "id")
    int addResource(Resource resource);

    @Update("UPDATE resources SET role=#{role} WHERE ownerId=#{ownerId} AND ownerType=#{ownerType} AND" +
            " resourceId=#{resourceId} AND resourceType=#{resourceType}")
    int modifyResource(Resource resource);

    @Select("SELECT * FROM resources WHERE id=#{id}")
    Resource getResourceById(@Param("id") int id);

    @Select("SELECT * FROM resources WHERE resourceId=#{resourceId} AND resourceType=#{resourceType}")
    List<Resource> getResourceByResourceIdAndType(@Param("resourceId") int resourceId,
                                                  @Param("resourceType") ResourceType resourceType);

    @Select("SELECT * FROM resources WHERE ownerId=#{ownerId} AND ownerType=#{ownerType} AND " +
            "resourceId=#{resourceId} AND resourceType=#{resourceType}")
    Resource getResourceByUserAndResourceId(@Param("ownerId") int ownerId,
                                            @Param("ownerType") ResourceOwnerType ownerType,
                                            @Param("resourceId") int resourceId,
                                            @Param("resourceType") ResourceType resourceType);

    @Select("SELECT * FROM resources WHERE ownerType=#{ownerType} AND resourceId=#{resourceId} AND" +
            " resourceType=#{resourceType}")
    Resource getGroupResourceByResourceId(@Param("ownerType") ResourceOwnerType ownerType,
                                          @Param("resourceId") int resourceId,
                                          @Param("resourceType") ResourceType resourceType);

    @Select("SELECT * FROM resources "
            + "WHERE ownerId=#{ownerId} AND ownerType=#{ownerType} AND resourceType=#{resourceType}")
    List<Resource> getResourceListByOwnerId(@Param("ownerId") int ownerId,
                                            @Param("ownerType") ResourceOwnerType ownerType,
                                            @Param("resourceType") ResourceType resourceType);

    @Select("SELECT * FROM resources "
            + "WHERE ownerId in (SELECT groupId FROM user_group_map WHERE userId=#{userId}) and" +
            " ownerType=#{ownerType} and resourceType=#{resourceType}")
    List<Resource> getGroupResourceListByUserId(@Param("userId") int userId,
                                                @Param("ownerType") ResourceOwnerType ownerType,
                                                @Param("resourceType") ResourceType resourceType);

    @Select("SELECT resourceId, resourceType FROM resources WHERE resourceType=#{resourceType} GROUP BY resourceId")
    List<Resource> getAllResourcesByType(@Param("resourceType") ResourceType resourceType);

    @Delete("DELETE FROM resources WHERE resourceType=#{resourceType} AND resourceId=#{resourceId} AND" +
            " ownerType=#{ownerType} AND ownerId=#{ownerId}")
    int deleteResource(@Param("resourceType") ResourceType resourceType,
                       @Param("resourceId") int resourceId,
                       @Param("ownerType") ResourceOwnerType resourceOwnerType,
                       @Param("ownerId") int ownerId);

    @Delete("DELETE FROM resources WHERE resourceType=#{resourceType} AND resourceId=#{resourceId}")
    int deleteResourceByIdAndType(@Param("resourceType") ResourceType resourceType,
                                  @Param("resourceId") int resourceId);

    @Select("SELECT * FROM resources WHERE ownerId=#{ownerId} AND ownerType=#{ownerType} AND resourceType=#{resourceType}")
    List<Resource> getResourceByOwnerId(@Param("ownerId") int ownerId,
                                        @Param("ownerType") ResourceOwnerType ownerType,
                                        @Param("resourceType") ResourceType resource_type);

    @Select("SELECT * FROM resources WHERE ownerId in (SELECT groupId FROM user_group_map WHERE userId=#{userId} )" +
            " AND ownerType=#{ownerType} AND resourceType=#{resourceType}")
    List<Resource> getGroupResourceByUserId(@Param("userId") int userId,
                                            @Param("ownerType") String ownerType,
                                            @Param("resourceType") ResourceType resourceType);

    @Select("SELECT * FROM resources WHERE ownerId=#{ownerId} AND ownerType=#{ownerType} AND resourceId=#{resourceId}" +
            " AND resourceType=#{resourceType}")
    Resource getResource(@Param("ownerId") int ownerId,
                         @Param("ownerType") ResourceOwnerType ownerType,
                         @Param("resourceId") int resourceId,
                         @Param("resourceType") ResourceType resourceType);

    @Select("SELECT * FROM resources WHERE ownerType=#{ownerType} AND resourceId=#{resourceId} AND resourceType=#{resourceType}")
    Resource getGroupResource(@Param("ownerType") String ownerType,
                              @Param("resourceId") int resourceId,
                              @Param("resourceType") ResourceType resourceType);

}
