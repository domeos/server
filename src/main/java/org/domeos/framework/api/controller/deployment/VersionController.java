package org.domeos.framework.api.controller.deployment;

import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.basemodel.ResultStat;
import org.domeos.framework.api.consolemodel.deployment.VersionDraft;
import org.domeos.framework.api.consolemodel.deployment.VersionInfo;
import org.domeos.framework.api.controller.ApiController;
import org.domeos.framework.api.service.deployment.VersionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Created by xxs on 16/4/5.
 */
@Controller
@RequestMapping("/api/version")
public class VersionController extends ApiController {
    @Autowired
    VersionService versionService;

    @ResponseBody
    @RequestMapping(value = "/create", method = RequestMethod.POST)
    public HttpResponseTemp<Long> createVersion(@RequestBody VersionDraft version,
                                                @RequestParam(value = "deployId") int deployId)
            throws Exception {
        return ResultStat.OK.wrap(versionService.createVersion(version, deployId));
    }

    @ResponseBody
    @RequestMapping(value = "/id/{deployId}/{versionId}", method = RequestMethod.GET)
    public HttpResponseTemp<VersionDraft> getVersion(@PathVariable int deployId,
                                                     @PathVariable int versionId) throws Exception {
        return ResultStat.OK.wrap(versionService.getVersion(deployId, versionId));
    }

    @ResponseBody
    @RequestMapping(value = "/list", method = RequestMethod.GET)
    public HttpResponseTemp<List<VersionInfo>> listVersion(@RequestParam int deployId) throws Exception {
        return ResultStat.OK.wrap(versionService.listVersion(deployId));
    }

    @ResponseBody
    @RequestMapping(value = "/{id}/deprecate", method = RequestMethod.DELETE)
    public HttpResponseTemp<?> deprecateVersionById(@PathVariable int id) throws Exception {
        return versionService.deprecateVersionById(id);
    }

    @ResponseBody
    @RequestMapping(value = "/{id}/enable", method = RequestMethod.PUT)
    public HttpResponseTemp<?> enableVersionById(@PathVariable int id) throws Exception {
        return versionService.enableVersionById(id);
    }

    @ResponseBody
    @RequestMapping(value = "/{deployId}/{versionId}/deprecate", method = RequestMethod.DELETE)
    public HttpResponseTemp<?> deprecateVersionById(@PathVariable int deployId, @PathVariable int versionId) throws Exception {
        return versionService.deprecateVersionByDeployIdAndVersionId(deployId, versionId);
    }

    @ResponseBody
    @RequestMapping(value = "/{deployId}/{versionId}/enable", method = RequestMethod.PUT)
    public HttpResponseTemp<?> enableVersionById(@PathVariable int deployId, @PathVariable int versionId) throws Exception {
        return versionService.enableVersionByDeployIdAndVersionId(deployId, versionId);
    }
}
