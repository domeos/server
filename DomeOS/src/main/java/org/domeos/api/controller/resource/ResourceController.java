package org.domeos.api.controller.resource;

import org.domeos.api.model.console.resource.ResourceInfo;
import org.domeos.api.model.resource.ResourceType;
import org.domeos.api.model.user.ResourceOwnerType;
import org.domeos.api.service.resource.ResourceService;
import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.shiro.AuthUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

/**
 * Created by feiliu206363 on 2015/12/15.
 */
@Controller
@RequestMapping("/api/resource")
public class ResourceController {
    @Autowired
    ResourceService resourceService;

    @ResponseBody
    @RequestMapping(value = "", method = RequestMethod.POST)
    public HttpResponseTemp<?> setResource(@RequestBody ResourceInfo resourceInfo) {
        long userId = AuthUtil.getUserId();
        return resourceService.setResource(resourceInfo, userId);
    }

    @ResponseBody
    @RequestMapping(value = "", method = RequestMethod.PUT)
    public HttpResponseTemp<?> modifyResource(@RequestBody ResourceInfo resourceInfo) {
        long userId = AuthUtil.getUserId();
        return resourceService.updateResource(resourceInfo, userId);
    }

    @ResponseBody
    @RequestMapping(value = "/{type}/{id}", method = RequestMethod.GET)
    public HttpResponseTemp<?> getResourceUsers(@PathVariable ResourceType type, @PathVariable Long id) {
        long userId = AuthUtil.getUserId();
        return resourceService.getResourceUsers(type, id, userId);
    }

    @ResponseBody
    @RequestMapping(value = "/{type}/{id}/useronly", method = RequestMethod.GET)
    public HttpResponseTemp<?> getResourceUsersOnly(@PathVariable ResourceType type, @PathVariable Long id) {
        long userId = AuthUtil.getUserId();
        return resourceService.getResourceUsersOnly(type, id, userId);
    }

    @ResponseBody
    @RequestMapping(value = "/{type}", method = RequestMethod.GET)
    public HttpResponseTemp<?> getResourcesUsers(@PathVariable ResourceType type) {
        long userId = AuthUtil.getUserId();
        return resourceService.getResourcesUsers(type, userId);
    }

    @ResponseBody
    @RequestMapping(value = "/{type}/useronly", method = RequestMethod.GET)
    public HttpResponseTemp<?> getResourcesUsersOnly(@PathVariable ResourceType type) {
        long userId = AuthUtil.getUserId();
        return resourceService.getResourcesUsersOnly(type, userId);
    }

    @ResponseBody
    @RequestMapping(value = "/{resourceType}/{resourceId}/{ownerType}/{ownerId}", method = RequestMethod.DELETE)
    public HttpResponseTemp<?> deleteResourceUser(@PathVariable ResourceType resourceType, @PathVariable Long resourceId, @PathVariable ResourceOwnerType ownerType, @PathVariable Long ownerId) {
        long userId = AuthUtil.getUserId();
        return resourceService.deleteResourceUser(resourceType, resourceId, ownerType, ownerId, userId);
    }
}
