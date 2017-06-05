package org.domeos.framework.api.controller.deployment;

import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.basemodel.ResultStat;
import org.domeos.framework.api.consolemodel.deployment.DeployCollectionDraft;
import org.domeos.framework.api.controller.ApiController;
import org.domeos.framework.api.service.deployment.DeployCollectionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

/**
 * Created by KaiRen on 2016/9/23.
 */
@Controller
@RequestMapping("/api/deploycollection")
public class DeployCollectionController extends ApiController {
    @Autowired
    DeployCollectionService deployCollectionService;

    @ResponseBody
    @RequestMapping(value = "", method = RequestMethod.POST)
    public HttpResponseTemp<?> createDeployCollection(@RequestBody DeployCollectionDraft deployCollectionDraft) throws Exception {
        return ResultStat.OK.wrap(deployCollectionService.createDeployCollection(deployCollectionDraft));
    }

    @ResponseBody
    @RequestMapping(value = "/{deployCollectionId}", method = RequestMethod.DELETE)
    public HttpResponseTemp<?> deleteDeployCollection(@PathVariable int deployCollectionId) throws IOException {
        return deployCollectionService.deleteDeployCollection(deployCollectionId);
    }

    @ResponseBody
    @RequestMapping(value = "/{deployCollectionId}", method = RequestMethod.PUT)
    public HttpResponseTemp<?> modifyDeployCollection(@PathVariable int deployCollectionId,
                                                   @RequestBody DeployCollectionDraft deployCollectionDraft) throws Exception {
        return deployCollectionService.modifyDeployCollection(deployCollectionId, deployCollectionDraft);
    }

    @ResponseBody
    @RequestMapping(value = "", method = RequestMethod.GET)
    public HttpResponseTemp<?> listDeployCollection() throws Exception {
        return deployCollectionService.listDeployCollection();
    }

}
