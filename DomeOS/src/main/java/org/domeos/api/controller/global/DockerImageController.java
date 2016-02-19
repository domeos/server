package org.domeos.api.controller.global;

import org.domeos.api.service.global.DockerImageService;
import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.shiro.AuthUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

/**
 * Created by feiliu206363 on 2015/12/16.
 */
@Controller
@RequestMapping("/api")
public class DockerImageController {
    @Autowired
    DockerImageService dockerImageService;

    @ResponseBody
    @RequestMapping(value = "/dockerimage", method = RequestMethod.GET)
    public HttpResponseTemp<?> getDockerImages() {
        long userId = AuthUtil.getUserId();
        return dockerImageService.getDockerImages(userId);
    }

    @ResponseBody
    @RequestMapping(value = "/dockerimage/detail", method = RequestMethod.GET)
    public HttpResponseTemp<?> getDockerImageInfoByName(@RequestParam String name, @RequestParam(value = "registry", required = false) String registry) {
        long userId = AuthUtil.getUserId();
        return dockerImageService.getDockerImageInfoByProjectName(name, registry, userId);
    }

    @ResponseBody
    @RequestMapping(value = "/global/dockerimages", method = RequestMethod.GET)
    public HttpResponseTemp<?> getAllDockerImages() {
        long userId = AuthUtil.getUserId();
        return dockerImageService.getAllDockerImages(userId);
    }

    @ResponseBody
    @RequestMapping(value = "/global/dockerimages/detail", method = RequestMethod.GET)
    public HttpResponseTemp<?> getDockerImageDetail(@RequestParam String name,  @RequestParam(value = "registry", required = false) String registry){
        long userId = AuthUtil.getUserId();
        return dockerImageService.getDockerImageDetail(name, registry, userId);
    }
}
