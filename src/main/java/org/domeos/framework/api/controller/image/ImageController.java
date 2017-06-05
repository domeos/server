package org.domeos.framework.api.controller.image;

import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.framework.api.consolemodel.image.ImageNameDetail;
import org.domeos.framework.api.consolemodel.image.ImageNameDetailRequest;
import org.domeos.framework.api.consolemodel.image.ImageTagDetailRequest;
import org.domeos.framework.api.controller.ApiController;
import org.domeos.framework.api.model.image.BaseImage;
import org.domeos.framework.api.model.image.BuildImage;
import org.domeos.framework.api.service.image.ImageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Created by baokangwang on 2016/4/6.
 */
@RestController
@RequestMapping("/api")
public class ImageController extends ApiController {

    @Autowired
    ImageService imageService;

    @ResponseBody
    @RequestMapping(value = "/image/base/{id}", method = RequestMethod.GET)
    public HttpResponseTemp<?> getBaseImage(@PathVariable int id) {
        return imageService.getBaseImage(id);
    }

    @ResponseBody
    @RequestMapping(value = "/image/base", method = RequestMethod.POST)
    public HttpResponseTemp<?> setBaseImage(@RequestBody BaseImage baseImage) {
        return imageService.setBaseImage(baseImage);
    }

    @ResponseBody
    @RequestMapping(value = "/image/base", method = RequestMethod.GET)
    public HttpResponseTemp<?> listBaseImage() {
        return imageService.listBaseImage();
    }

    @ResponseBody
    @RequestMapping(value = "/image/base/{id}", method = RequestMethod.DELETE)
    public HttpResponseTemp<?> deleteBaseImage(@PathVariable int id) {
        return imageService.deleteBaseImage(id);
    }

    @ResponseBody
    @RequestMapping(value = "/image/build", method = RequestMethod.GET)
    public HttpResponseTemp<?> getBuildImage() {
        return imageService.getBuildImage();
    }

    @ResponseBody
    @RequestMapping(value = "/image/build", method = RequestMethod.POST)
    public HttpResponseTemp<?> setBuildImage(@RequestBody BuildImage buildImage) {
        return imageService.setBuildImage(buildImage);
    }

    @ResponseBody
    @RequestMapping(value = "/image", method = RequestMethod.GET)
    public HttpResponseTemp<?> getDockerImages() {
        return imageService.getDockerImages();
    }

    @ResponseBody
    @RequestMapping(value = "/image/forbuild", method = RequestMethod.GET)
    public HttpResponseTemp<?> getDockerImagesForBuild() {
        return imageService.getDockerImagesForBuild();
    }

    @ResponseBody
    @RequestMapping(value = "/image/detail", method = RequestMethod.GET)
    public HttpResponseTemp<?> getDockerImageInfoByName(@RequestParam String name, @RequestParam(value = "registry", required = false) String registry) {
        return imageService.getDockerImageDetailByProjectName(name, registry);
    }

    @ResponseBody
    @RequestMapping(value = "/image/all", method = RequestMethod.GET)
    public HttpResponseTemp<?> getAllDockerImages() {
        return imageService.getAllDockerImages();
    }

    @ResponseBody
    @RequestMapping(value = "/image/all/detail", method = RequestMethod.GET)
    public HttpResponseTemp<?> getDockerImageDetail(@RequestParam String name, @RequestParam(value = "registry", required = false) String registry) {
        return imageService.getDockerImageDetail(name, registry);
    }

    @ResponseBody
    @RequestMapping(value = "/image/all/detail", method = RequestMethod.POST)
    public HttpResponseTemp<List<ImageNameDetail>> dockerImageNameDetail(@RequestBody ImageNameDetailRequest imageNameDetailRequest) {
        return imageService.dockerImageNameDetail(imageNameDetailRequest);
    }

    @ResponseBody
    @RequestMapping(value = "/image/all/detail/tag", method = RequestMethod.POST)
    public HttpResponseTemp<?> getImageTagDetail(@RequestBody ImageTagDetailRequest imageTagDetailRequest) {
        return imageService.getImageTagDetail(imageTagDetailRequest);
    }

    @ResponseBody
    @RequestMapping(value = "/image/all/detail/tag", method = RequestMethod.DELETE)
    public HttpResponseTemp<?> deleteImageByTag(@RequestParam String name, @RequestParam String tag,
                                                @RequestParam(value = "registry", required = false) String registry) {
        return imageService.deleteImageByTag(name, tag, registry);
    }

    @ResponseBody
    @RequestMapping(value = "/image/all/detail", method = RequestMethod.DELETE)
    public HttpResponseTemp<?> deleteAllImage(@RequestParam String name, @RequestParam String registry) {
        return imageService.deleteImage(name, registry);
    }

    @ResponseBody
    @RequestMapping(value = "/image/exclusive/{type}", method = RequestMethod.GET)
    public HttpResponseTemp<?> getAllExclusiveImages(@PathVariable String type) {
        return imageService.getAllExclusiveImages(type);
    }

    @ResponseBody
    @RequestMapping(value = "/image/public/catalog", method = RequestMethod.GET)
    public HttpResponseTemp<?> getAllPublicImages() {
        return imageService.getAllPublicImage();
    }

    @ResponseBody
    @RequestMapping(value = "/image/public/image", method = RequestMethod.GET)
    public HttpResponseTemp<?> getImageDetail(@RequestParam String imageName) {
        return imageService.getPublicImageDetail(imageName);
    }

    @ResponseBody
    @RequestMapping(value = "/image/public/item/content",
            produces = MediaType.APPLICATION_OCTET_STREAM_VALUE,
            method = RequestMethod.GET)
    public String getImageItem(@RequestParam String itemUrl) {
        return imageService.getPublicItemContent(itemUrl);
    }
}