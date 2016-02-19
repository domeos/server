package org.domeos.api.controller.deployment;

import org.domeos.api.controller.ApiController;
import org.domeos.api.model.deployment.Version;
import org.domeos.api.model.deployment.VersionDetail;
import org.domeos.api.model.deployment.VersionInfo;
import org.domeos.api.service.deployment.VersionService;
import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.shiro.AuthUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

/**
 * Created by xxs on 15/12/15.
 */
@Controller
@RequestMapping("/api/version")
public class VersionController extends ApiController {
    @Autowired
    VersionService versionService;

    @ResponseBody
    @RequestMapping(value = "/list", method = RequestMethod.GET)
    public HttpResponseTemp<List<VersionInfo>> listVersions(@RequestParam long deployId) throws IOException {
        long userId = AuthUtil.getUserId();
        return versionService.listVersions(deployId, userId);
    }

    @ResponseBody
    @RequestMapping(value = "/id/{deployId}/{version}", method = RequestMethod.GET)
    public HttpResponseTemp<VersionDetail> getVersion(@PathVariable long deployId, @PathVariable long version) throws IOException {
        long userId = AuthUtil.getUserId();
        return versionService.getVersionDetail(deployId, version, userId);
    }

    @ResponseBody
    @RequestMapping(value = "/create", method = RequestMethod.POST)
    public HttpResponseTemp<?> createVersion(@RequestBody Version version, @RequestParam(value = "deployId", required = true) long deployId) throws Exception {
        long userId = AuthUtil.getUserId();
        return versionService.createVersion(version, deployId, userId);
    }
}
