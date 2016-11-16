package org.domeos.framework.api.biz.collection;

import org.domeos.base.BaseTestCase;
import org.domeos.framework.api.model.auth.related.Role;
import org.domeos.framework.api.model.collection.CollectionAuthorityMap;
import org.domeos.framework.api.model.collection.CollectionResourceMap;
import org.domeos.framework.api.model.collection.related.ResourceType;
import org.junit.After;
import org.junit.Before;
import org.junit.FixMethodOrder;
import org.junit.Test;
import org.junit.runners.MethodSorters;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

/**
 * Created by KaiRen on 2016/9/21.
 */
@FixMethodOrder(MethodSorters.NAME_ASCENDING)
public class CollectionBizTest extends BaseTestCase {
    @Autowired
    CollectionBiz collectionBiz;

    @Before
    public void setUp() {

    }

    @After
    public void destroy(){

    }

    @Test
    public void T010CreateResources() {
        CollectionResourceMap resourceMap1 = new CollectionResourceMap(990, 1 ,ResourceType.PROJECT, 990, System.currentTimeMillis());
        CollectionResourceMap resourceMap2 = new CollectionResourceMap(991, 1, ResourceType.PROJECT, 990, System.currentTimeMillis());
        CollectionResourceMap resourceMap3 = new CollectionResourceMap(992, 1, ResourceType.PROJECT, 991, System.currentTimeMillis());
        collectionBiz.addResource(resourceMap1);
        collectionBiz.addResource(resourceMap2);
        collectionBiz.addResource(resourceMap3);

    }

    @Test
    public void T020getResources() {
        List<CollectionResourceMap> collectionResourceMapList = collectionBiz.getResourcesByCollectionIdAndResourceType(990, ResourceType.PROJECT);
        System.out.println(collectionResourceMapList);
    }

    @Test
    public void T030getResource() {
        CollectionResourceMap collectionResourceMap =  collectionBiz.getResourceByResourceIdAndResourceType(990, ResourceType.PROJECT);
        System.out.println(collectionResourceMap);
    }

    @Test
    public void T040DeleteResources() {
        collectionBiz.deleteResourcesByCollectionIdAndResourceType(990, ResourceType.PROJECT);
    }

    @Test
    public void T050DeleteResource() {
        collectionBiz.deleteResourceByResourceIdAndResourceType(992, ResourceType.PROJECT);
    }

    @Test
    public void T060CreateAutority() {
        CollectionAuthorityMap authorityMap1 = new CollectionAuthorityMap(990, ResourceType.PROJECT_COLLECTION, 1, Role.MASTER, System.currentTimeMillis());
        CollectionAuthorityMap authorityMap2 = new CollectionAuthorityMap(990, ResourceType.PROJECT_COLLECTION, 2, Role.DEVELOPER, System.currentTimeMillis());
        CollectionAuthorityMap authorityMap3 = new CollectionAuthorityMap(991, ResourceType.PROJECT_COLLECTION, 1, Role.MASTER, System.currentTimeMillis());
        collectionBiz.addAuthority(authorityMap1);
        collectionBiz.addAuthority(authorityMap2);
        collectionBiz.addAuthority(authorityMap3);
    }

    @Test
    public void T070getAuthorities() {
        List<CollectionAuthorityMap> authorityMapList = collectionBiz.getAuthoritiesByCollectionIdAndResourceType(990, ResourceType.PROJECT_COLLECTION);
        System.out.println(authorityMapList);
    }

    @Test
    public void T080getAuthority() {
        CollectionAuthorityMap authorityMap = collectionBiz.getAuthorityByUserIdAndResourceTypeAndCollectionId(1, ResourceType.PROJECT_COLLECTION, 991);
        System.out.println(authorityMap);
    }

    @Test
    public void T090deleteAuthorities() {
        collectionBiz.deleteAuthoritiesByCollectionIdAndResourceType(990, ResourceType.PROJECT_COLLECTION);
    }

    @Test
    public void T100deleteAuthority() {
        CollectionAuthorityMap authorityMap = new CollectionAuthorityMap();
        authorityMap.setCollectionId(991);
        authorityMap.setResourceType(ResourceType.PROJECT_COLLECTION);
        authorityMap.setUserId(1);
        collectionBiz.deleteAuthorityMap(authorityMap);
    }

    @Test
    public void T110getAuthoritiesByUserIdAndResourceType() {
        List<CollectionAuthorityMap> authorityMapList = collectionBiz.getAuthoritiesByUserIdAndResourceType(1, ResourceType.PROJECT_COLLECTION);
        System.out.println(authorityMapList);
    }




}
