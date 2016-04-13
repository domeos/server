package org.domeos.framework.api.controller.resource;

import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.framework.api.model.resource.related.ResourceInfo;
import org.domeos.framework.api.model.resource.related.ResourceOwnerType;
import org.domeos.framework.api.model.resource.related.ResourceType;
import org.domeos.framework.api.service.resource.ResourceService;
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
        return resourceService.setResource(resourceInfo);
    }

    @ResponseBody
    @RequestMapping(value = "", method = RequestMethod.PUT)
    public HttpResponseTemp<?> modifyResource(@RequestBody ResourceInfo resourceInfo) {
        return resourceService.updateResource(resourceInfo);
    }

    @ResponseBody
    @RequestMapping(value = "/{type}/{id}", method = RequestMethod.GET)
    public HttpResponseTemp<?> getResourceUsers(@PathVariable ResourceType type, @PathVariable int id) {
        return resourceService.getResourceUsers(type, id);
    }

    @ResponseBody
    @RequestMapping(value = "/{type}/{id}/useronly", method = RequestMethod.GET)
    public HttpResponseTemp<?> getResourceUsersOnly(@PathVariable ResourceType type, @PathVariable int id) {
        return resourceService.getResourceUsersOnly(type, id);
    }

    @ResponseBody
    @RequestMapping(value = "/{type}", method = RequestMethod.GET)
    public HttpResponseTemp<?> getResourcesUsers(@PathVariable ResourceType type) {
        return resourceService.getResourcesUsers(type);
    }

    @ResponseBody
    @RequestMapping(value = "/{type}/useronly", method = RequestMethod.GET)
    public HttpResponseTemp<?> getResourcesUsersOnly(@PathVariable ResourceType type) {
        return resourceService.getResourcesUsersOnly(type);
    }

    @ResponseBody
    @RequestMapping(value = "/{resourceType}/{resourceId}/{ownerType}/{ownerId}", method = RequestMethod.DELETE)
    public HttpResponseTemp<?> deleteResourceUser(@PathVariable ResourceType resourceType, @PathVariable int resourceId,
                                                  @PathVariable ResourceOwnerType ownerType, @PathVariable int ownerId) {
        return resourceService.deleteResourceUser(resourceType, resourceId, ownerType, ownerId);
    }
}
