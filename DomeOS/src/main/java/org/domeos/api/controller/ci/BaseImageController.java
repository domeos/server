package org.domeos.api.controller.ci;

import org.domeos.api.controller.ApiController;
import org.domeos.api.model.ci.BaseImage;
import org.domeos.api.service.ci.BaseImageService;
import org.domeos.basemodel.HttpResponseTemp;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

/**
 * Created by feiliu206363 on 2015/11/13.
 */
@Controller
@RequestMapping("/api/ci/baseimage")
public class BaseImageController extends ApiController {
    @Autowired
    @Qualifier("baseImageService")
    BaseImageService baseImageService;

    @ResponseBody
    @RequestMapping(value = "/{id}", method = RequestMethod.GET)
    public HttpResponseTemp<?> getBaseImage(@PathVariable int id) {
        return baseImageService.getBaseImage(id);
    }

    @ResponseBody
    @RequestMapping(value = "", method = RequestMethod.POST)
    public HttpResponseTemp<?> setBaseImage(@RequestBody BaseImage baseImage) {
        return baseImageService.setBaseImage(baseImage);
    }

    @ResponseBody
    @RequestMapping(value = "", method = RequestMethod.GET)
    public HttpResponseTemp<?> listBaseImage() {
        return baseImageService.listBaseImage();
    }

    @ResponseBody
    @RequestMapping(value = "/{id}", method = RequestMethod.DELETE)
    public HttpResponseTemp<?> deleteBaseImage(@PathVariable int id) {
        return baseImageService.deleteBaseImage(id);
    }
}
