package org.domeos.framework.api.controller.image;

import org.domeos.framework.api.model.ci.related.BuildStatus;
import org.domeos.framework.api.model.image.BaseImageCustom;
import org.domeos.framework.api.service.image.BaseImageCustomService;
import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.framework.api.controller.ApiController;
import org.domeos.framework.engine.exception.DaoException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

/**
 * Created by kairen on 02/03/16.
 */
@Controller
@RequestMapping("/api/image/custom")
public class BaseImageCustomController extends ApiController {

    @Autowired
    @Qualifier("baseImageCustomService")
    BaseImageCustomService baseImageCustomService;

    @ResponseBody
    @RequestMapping(value = "", method = RequestMethod.POST)
    public HttpResponseTemp<?> setBaseImageCustom(@RequestBody BaseImageCustom baseImageCustom) {
        return baseImageCustomService.addBaseImageCustom(baseImageCustom);
    }

    @ResponseBody
    @RequestMapping(value = "/{id}", method = RequestMethod.DELETE)
    public HttpResponseTemp<?> deleteBaseImageCustomById(@PathVariable int id) {
        return baseImageCustomService.deleteBaseImageCustom(id);
    }

    @ResponseBody
    @RequestMapping(value = "/{id}", method = RequestMethod.GET)
    public HttpResponseTemp<?> getBaseImageCustom(@PathVariable int id) {
        return baseImageCustomService.getBaseImageCustomInfo(id);
    }

    @ResponseBody
    @RequestMapping(value = "/download/{imageId}/{md5}", method = RequestMethod.GET)
    public String downloadFile(@PathVariable int imageId, @PathVariable String md5, @RequestParam String secret) {
        return new String(baseImageCustomService.downloadFile(md5, secret, imageId));
    }

    @ResponseBody
    @RequestMapping(value = "/download/dockerfile/{imageId}", method = RequestMethod.GET)
    public String downloadDockerfile(@PathVariable int imageId, @RequestParam String secret) {
        return baseImageCustomService.downloadDockerfile(secret, imageId);
    }

    @ResponseBody
    @RequestMapping(value = "/getfilejson/{imageId}", method = RequestMethod.GET)
    public String getFileJson(@PathVariable int imageId, @RequestParam String secret) {
        return baseImageCustomService.getFileJson(secret, imageId);
    }

    @ResponseBody
    @RequestMapping(value = "/upload/{imageId}", method = RequestMethod.POST)
    public HttpResponseTemp<?> uploadLogfile(@RequestParam(value = "file", required = false) MultipartFile file,
                                             @PathVariable int imageId, @RequestParam String secret) throws DaoException {
        return baseImageCustomService.uploadLogfile(file, imageId, secret);
    }

    @ResponseBody
    @RequestMapping(value = "/preview/{docMD5}", method = RequestMethod.GET)
    public HttpResponseTemp<?> previewFile(@PathVariable String docMD5, @RequestBody BaseImageCustom baseImageCustom) {
        return baseImageCustomService.previewFile(baseImageCustom, docMD5);
    }

    @ResponseBody
    @RequestMapping(value = "", method = RequestMethod.PUT)
    public HttpResponseTemp<?> modifyBaseImageCustom(@RequestBody BaseImageCustom baseImageCustom) {
        return baseImageCustomService.modifyBaseImageCustom(baseImageCustom);
    }

    @ResponseBody
    @RequestMapping(value = "/download/{imageId}", method = RequestMethod.GET)
    public HttpResponseTemp<?> downloadLogFile(@PathVariable int imageId) {
        return baseImageCustomService.downloadLogFile(imageId);
    }

    @ResponseBody
    @RequestMapping(value = "/status", method = RequestMethod.POST)
    public HttpResponseTemp<?> setBuildStatus(@RequestBody BuildStatus buildStatus, @RequestParam String secret)
            throws IOException {
        return baseImageCustomService.setBuildStatus(buildStatus, secret);
    }

    @ResponseBody
    @RequestMapping(value = "", method = RequestMethod.GET)
    public HttpResponseTemp<?> listInfo() {
        return baseImageCustomService.listBaseImageCustomInfo();
    }

    @ResponseBody
    @RequestMapping(value = "/build/{imageId}", method = RequestMethod.POST)
    public HttpResponseTemp<?> startBuild(@PathVariable int imageId) {
        return baseImageCustomService.startBuild(imageId);
    }

    @ResponseBody
    @RequestMapping(value = "/validate", method = RequestMethod.POST)
    public HttpResponseTemp<?> validation(@RequestParam String imageName, @RequestParam String imageTag) {
        return baseImageCustomService.validation(imageName, imageTag);
    }

}
