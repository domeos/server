package org.domeos.framework.api.mapper.domeos.collection;

import org.apache.ibatis.annotations.*;
import org.domeos.framework.api.biz.collection.CollectionBiz;
import org.domeos.framework.api.model.collection.CollectionAuthorityMap;
import org.domeos.framework.api.model.collection.related.CollectionInfo;
import org.domeos.framework.api.model.collection.related.ResourceType;

import java.util.List;

/**
 * Created by KaiRen on 2016/9/20.
 */
@Mapper
public interface CollectionAuthorityMapMapper {
    @Insert("INSERT INTO " + CollectionBiz.COLLECTION_AUTHORITY_MAP_NAME +
            " (collectionId, resourceType, userId, role, updateTime) VALUES (" +
            "#{collectionId}, #{resourceType}, #{userId}, #{role}, #{updateTime})")
    @Options(useGeneratedKeys = true, keyProperty = "id", keyColumn = "id")
    int insertCollectionAuthorityMap(CollectionAuthorityMap collectionAuthorityMap);

    @Update("UPDATE " + CollectionBiz.COLLECTION_AUTHORITY_MAP_NAME +
            " SET role=#{role}, updateTime=#{updateTime} " +
            " WHERE collectionId=#{collectionId} AND resourceType=#{resourceType} AND userId=#{userId}")
    int modifyCollectionAuthorityMap(CollectionAuthorityMap collectionAuthorityMap);

    @Delete("DELETE from " + CollectionBiz.COLLECTION_AUTHORITY_MAP_NAME +
            " WHERE collectionId=#{collectionId} AND resourceType = #{resourceType}")
    int deleteAuthorityMapsByCollectionIdAndResourceType(@Param("collectionId") int collectionId,
                                                         @Param("resourceType") ResourceType resourceType);

    @Delete("DELETE from " + CollectionBiz.COLLECTION_AUTHORITY_MAP_NAME +
            " WHERE userId=#{userId} AND resourceType = #{resourceType} AND collectionId = #{collectionId}")
    int deleteAuthorityMap(CollectionAuthorityMap authorityMap);

    @Select("SELECT * from " + CollectionBiz.COLLECTION_AUTHORITY_MAP_NAME +
            " WHERE collectionId=#{collectionId} AND resourceType = #{resourceType}")
    List<CollectionAuthorityMap> getAuthorityMapsByCollectionIdAndResourceType(@Param("collectionId") int collectionId,
                                                                               @Param("resourceType") ResourceType resourceType);

    @Select("SELECT * from " + CollectionBiz.COLLECTION_AUTHORITY_MAP_NAME +
            " WHERE userId=#{userId} AND resourceType = #{resourceType} AND collectionId = #{collectionId}")
    CollectionAuthorityMap getAuthorityMapByUserIdAndResourceTypeAndCollectionId(@Param("userId") int userId,
                                                                                 @Param("resourceType") ResourceType resourceType,
                                                                                 @Param("collectionId") int collectionId);

    @Select("SELECT * from " + CollectionBiz.COLLECTION_AUTHORITY_MAP_NAME +
            " WHERE userId=#{userId} AND resourceType = #{resourceType}")
    List<CollectionAuthorityMap> getAuthoritiesByUserIdAndResourceType(@Param("userId") int userId,
                                                                       @Param("resourceType") ResourceType resourceType);

    @Select("SELECT COUNT(*) from " + CollectionBiz.COLLECTION_AUTHORITY_MAP_NAME +
            " WHERE userId=#{userId} AND resourceType = #{resourceType}")
    int getAuthoritiesCountByUserIdAndResourceType(@Param("userId") int userId,
                                                                       @Param("resourceType") ResourceType resourceType);

    @Select("SELECT COUNT(*) from " + CollectionBiz.COLLECTION_AUTHORITY_MAP_NAME +
            " WHERE role='master' and collectionId=#{collectionId} and resourceType=#{resourceType}")
    int masterCountInCollection(@Param("collectionId") int collectionId, @Param("resourceType") ResourceType resourceType);

    @Select("SELECT collectionId, resourceType FROM " + CollectionBiz.COLLECTION_AUTHORITY_MAP_NAME +
            " WHERE resourceType=#{resourceType} GROUP BY collectionId")
    List<CollectionAuthorityMap> getAllCollectionsByType(@Param("resourceType") ResourceType resourceType);

    @Select("SELECT COUNT(*) FROM " + CollectionBiz.COLLECTION_AUTHORITY_MAP_NAME +
            " WHERE userId=#{userId} and collectionId=#{collectionId} and resourceType=#{resourceType}")
    int userExistInCollection(CollectionAuthorityMap authorityMap);

    @Select("SELECT * from " + CollectionBiz.COLLECTION_AUTHORITY_MAP_NAME +
            " WHERE collectionId=#{collectionId} AND resourceType = #{resourceType}")
    List<CollectionAuthorityMap> getAllUsersInCollection(@Param("collectionId") int collectionId,
                                                         @Param("resourceType") ResourceType resourceType);

    @Select("SELECT c.id, c.name, c.description, c.createTime from ${tableName} c, " + CollectionBiz.COLLECTION_AUTHORITY_MAP_NAME +
            " ca WHERE ca.userId=#{userId} AND ca.collectionId=c.id AND ca.resourceType = #{resourceType} AND c.removed=0")
    List<CollectionInfo> getCollectionInfoByUserId(@Param("tableName") String tableName,
                                                   @Param("userId") int userId,
                                                   @Param("resourceType") ResourceType resourceType);

    @Select("SELECT id, name, description, createTime from ${tableName} WHERE removed=0")
    List<CollectionInfo> getAllCollectionInfo(@Param("tableName") String tableName);

}
