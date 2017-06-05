package org.domeos.framework.api.controller.auth;

import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.framework.api.consolemodel.auth.CollectionMember;
import org.domeos.framework.api.consolemodel.auth.CollectionMembers;
import org.domeos.framework.api.controller.ApiController;
import org.domeos.framework.api.model.collection.CollectionAuthorityMap;
import org.domeos.framework.api.model.collection.related.ResourceType;
import org.domeos.framework.api.service.auth.UserCollectionService;
import org.domeos.framework.engine.AuthUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

/**
 * Created by KaiRen on 2016/9/22.
 */
@Controller
@RequestMapping("/api")
public class CollectionController extends ApiController {
    @Autowired
    UserCollectionService userCollectionService;

    /**
     * Post body is
     * { "group_id":groupId, "user_id":userId, "role": "#roleType" }
     */
    @ResponseBody
    @RequestMapping(value = "/collection_members/single", method = RequestMethod.POST)
    public HttpResponseTemp<?> addCollectionMember(@RequestBody CollectionMember collectionMember) {
        int userId = AuthUtil.getUserId();
        return userCollectionService.addCollectionMember(userId, collectionMember);
    }

    @ResponseBody
    @RequestMapping(value = "/collection_members/single", method = RequestMethod.PUT)
    public HttpResponseTemp<?> modifyCollectionMember(@RequestBody CollectionMember collectionMember) {
        int userId = AuthUtil.getUserId();
        return userCollectionService.modifyCollectionMember(userId, collectionMember);
    }

    @ResponseBody
    @RequestMapping(value = "/collection_members/multiple", method = RequestMethod.POST)
    public HttpResponseTemp<?> addMultipleCollectionMembers(@RequestBody CollectionMembers collectionMembers) {
        int userId = AuthUtil.getUserId();
        return userCollectionService.addCollectionMembers(userId, collectionMembers);
    }

    @ResponseBody
    @RequestMapping(value = "/collection_members/{collectionId}/{resourceType}", method = RequestMethod.GET)
    public HttpResponseTemp<?> listCollectionMembers(@PathVariable int collectionId, @PathVariable ResourceType resourceType) {
        int userId = AuthUtil.getUserId();
        return userCollectionService.listCollectionMember(userId, collectionId, resourceType);
    }

    @ResponseBody
    @RequestMapping(value = "/collection_members/{collectionId}/{userId}/{resourceType}", method = RequestMethod.DELETE)
    public HttpResponseTemp<?> deleteCollectionMember(@PathVariable int collectionId,
                                                      @PathVariable int userId,
                                                      @PathVariable ResourceType resourceType) {
        int curUserId = AuthUtil.getUserId();
        CollectionAuthorityMap collectionAuthorityMap = new CollectionAuthorityMap();
        collectionAuthorityMap.setCollectionId(collectionId);
        collectionAuthorityMap.setUserId(userId);
        collectionAuthorityMap.setResourceType(resourceType);
        return userCollectionService.deleteCollectionMember(curUserId, collectionAuthorityMap);
    }

    @ResponseBody
    @RequestMapping(value = "/collections/{resourceType}", method = RequestMethod.GET)
    public HttpResponseTemp<?> listCollectionInfos(@PathVariable ResourceType resourceType) {
        int userId = AuthUtil.getUserId();
        return userCollectionService.listAllCollectionInfo(userId, resourceType);
    }
}
