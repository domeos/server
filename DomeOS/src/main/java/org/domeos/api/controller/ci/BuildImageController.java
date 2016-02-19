package org.domeos.api.controller.ci;

import org.domeos.api.controller.ApiController;
import org.domeos.api.model.ci.BuildImage;
import org.domeos.api.service.ci.BuildImageService;
import org.domeos.basemodel.HttpResponseTemp;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

/**
 * Created by feiliu206363 on 2015/11/12.
 */
@Controller
@RequestMapping("/api/ci/buildimage")
public class BuildImageController extends ApiController {
    @Autowired
    @Qualifier("buildImageService")
    BuildImageService buildImageService;

    @ResponseBody
    @RequestMapping(value = "", method = RequestMethod.POST)
    public HttpResponseTemp<?> setBuildImage(@RequestBody BuildImage buildImage) {
        return buildImageService.setBuildImage(buildImage);
    }

    @ResponseBody
    @RequestMapping(value = "", method = RequestMethod.GET)
    public HttpResponseTemp<?> getBuildImage() {
        return buildImageService.getBuildImage();
    }
}
