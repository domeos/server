package org.domeos.api.controller.ci;

import org.domeos.api.controller.ApiController;
import org.domeos.api.model.ci.BuildInfo;
import org.domeos.api.model.ci.BuildStatus;
import org.domeos.api.model.console.project.Project;
import org.domeos.api.service.ci.BuildService;
import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.shiro.AuthUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

/**
 * Created by feiliu206363 on 2015/11/12.
 */
@Controller
@RequestMapping("/api/ci/build")
public class BuildController extends ApiController {
    @Autowired
    @Qualifier("buildService")
    BuildService buildService;

    @ResponseBody
    @RequestMapping(value = "/start", method = RequestMethod.POST)
    public HttpResponseTemp<?> startBuild(@RequestBody BuildInfo buildInfo) {
        long userId = AuthUtil.getUserId();
        String userName = AuthUtil.getCurrentUserName();
        return buildService.startBuild(buildInfo, userId, userName);
    }

    @ResponseBody
    @RequestMapping(value = "/autobuild", method = RequestMethod.POST)
    public HttpResponseTemp<?> startAutoBuild(@RequestBody String webHookStr) {
        return buildService.startAutoBuild(webHookStr);
    }

    @ResponseBody
    @RequestMapping(value = "/builddockerfile/{projectId}/{buildId}", method = RequestMethod.GET)
    public String dockerfile(@PathVariable int projectId, @PathVariable int buildId, @RequestParam String secret) {
        return buildService.dockerFile(projectId, buildId, secret);
    }

    @ResponseBody
    @RequestMapping(value = "/dockerfile", method = RequestMethod.POST)
    public HttpResponseTemp<?> dockerfilePreview(@RequestBody Project project) {
        long userId = AuthUtil.getUserId();
        return buildService.dockerfilePreview(project, userId);
    }

    @ResponseBody
    @RequestMapping(value = "/dockerfile/{projectId}/{buildId}", method = RequestMethod.GET)
    public HttpResponseTemp<?> dockerfileUsed(@PathVariable int projectId, @PathVariable int buildId) {
        long userId = AuthUtil.getUserId();
        return buildService.dockerfileUsed(projectId, buildId, userId);
    }

    @ResponseBody
    @RequestMapping(value = "/status", method = RequestMethod.POST)
    public HttpResponseTemp<?> setBuildStatus(@RequestBody BuildStatus buildStatus, @RequestParam String secret)
            throws IOException {
        return buildService.setBuildStatus(buildStatus, secret);
    }

    @ResponseBody
    @RequestMapping(value = "/downloadrsa/{projectId}/{buildId}", method = RequestMethod.GET)
    public String downloadRsa(@PathVariable int projectId, @PathVariable int buildId, @RequestParam String secret) {
        return buildService.downloadRsa(projectId, buildId, secret);
    }

    @ResponseBody
    @RequestMapping(value = "/upload/{projectId}/{buildId}", method = RequestMethod.POST)
    public HttpResponseTemp<?> uploadLogfile(@RequestParam(value = "file", required = false) MultipartFile file,
                                             @PathVariable int projectId, @PathVariable int buildId, @RequestParam String secret) {
        return buildService.uploadLogfile(file, projectId, buildId, secret);
    }

    @ResponseBody
    @RequestMapping(value = "/download/{projectId}/{buildId}", method = RequestMethod.GET)
    public HttpResponseTemp<?> downloadLogFile(@PathVariable int projectId, @PathVariable int buildId) {
        long userId = AuthUtil.getUserId();
        return buildService.downloadLogFile(projectId, buildId, userId);
    }

    @ResponseBody
    @RequestMapping(value = "/{projectId}", method = RequestMethod.GET)
    public HttpResponseTemp<?> listBuildInfo(@PathVariable int projectId) {
        long userId = AuthUtil.getUserId();
        return buildService.listBuildInfo(projectId, userId);
    }
}
