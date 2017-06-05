package org.domeos.framework.api.mapper.domeos.collection;

import org.apache.ibatis.annotations.*;
import org.domeos.framework.api.biz.collection.CollectionBiz;
import org.domeos.framework.api.model.collection.CollectionResourceMap;
import org.domeos.framework.api.model.collection.related.ResourceType;

import java.util.List;

/**
 * Created by KaiRen on 2016/9/20.
 */
@Mapper
public interface CollectionResourceMapMapper {
    @Insert("INSERT INTO " + CollectionBiz.COLLECTION_RESOURCE_MAP_NAME +
            " (resourceId, creatorId, resourceType, collectionId, updateTime) VALUES (" +
            "#{resourceId}, #{creatorId}, #{resourceType}, #{collectionId}, #{updateTime})")
    @Options(useGeneratedKeys = true, keyProperty = "id", keyColumn = "id")
    int insertCollectionResourceMap(CollectionResourceMap collectionResourceMap);

    @Update("UPDATE " + CollectionBiz.COLLECTION_RESOURCE_MAP_NAME +
            " SET collectionId=#{collectionId}, updateTime=#{updateTime} WHERE resourceId=#{resourceId} AND resourceType=#{resourceType}")
    int modifyCollectionResourceMap(CollectionResourceMap collectionResourceMap);

    @Delete("DELETE from " + CollectionBiz.COLLECTION_RESOURCE_MAP_NAME +
            " WHERE collectionId=#{collectionId} AND resourceType = #{resourceType}")
    int deleteResourceMapsByCollectionIdAndResourceType(@Param("collectionId") int collectionId,
                                                        @Param("resourceType") ResourceType resourceType);

    @Delete("DELETE from " + CollectionBiz.COLLECTION_RESOURCE_MAP_NAME +
            " WHERE resourceId=#{resourceId} AND resourceType = #{resourceType}")
    int deleteResourceMapByResourceIdAndResourceType(@Param("resourceId") int resourceId,
                                                     @Param("resourceType") ResourceType resourceType);

    @Select("SELECT * from " + CollectionBiz.COLLECTION_RESOURCE_MAP_NAME +
            " WHERE collectionId = #{collectionId} AND resourceType = #{resourceType}")
    List<CollectionResourceMap> getResourceMapsByCollectionIdAndResourceType(@Param("collectionId") int collectionId,
                                                                             @Param("resourceType") ResourceType resourceType);

    @Select("SELECT * from " + CollectionBiz.COLLECTION_RESOURCE_MAP_NAME +
            " WHERE resourceId=#{resourceId} AND resourceType = #{resourceType}")
    CollectionResourceMap getResourceMapByResourceIdAndResourceType(@Param("resourceId") int resourceId,
                                                                    @Param("resourceType") ResourceType resourceType);

    @Select("UPDATE " + CollectionBiz.COLLECTION_RESOURCE_MAP_NAME + " SET creatorId=#{creatorId} " +
            " WHERE resourceId=#{resourceId} AND resourceType = #{resourceType}")
    CollectionResourceMap updateResourceCreatorByResourceIdAndResourceType(@Param("resourceId") int resourceId,
                                                                           @Param("resourceType") ResourceType resourceType,
                                                                           @Param("creatorId") int creatorId);

    @Select("select * from " + CollectionBiz.COLLECTION_RESOURCE_MAP_NAME +
            "  where resourceType = #{resourceType} AND collectionId in ${idList}")
    List<CollectionResourceMap> getResourcesByIdList(@Param("resourceType") ResourceType resourceType, @Param("idList") String idList);

    @Select("select count(*) from " + CollectionBiz.COLLECTION_RESOURCE_MAP_NAME +
            "  where resourceType = #{resourceType} AND collectionId in ${idList}")
    int getResourcesCountByIdList(@Param("resourceType") ResourceType resourceType, @Param("idList") String idList);

}
