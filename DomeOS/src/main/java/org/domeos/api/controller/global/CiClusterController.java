package org.domeos.api.controller.global;

import org.domeos.api.controller.ApiController;
import org.domeos.api.model.cluster.CiCluster;
import org.domeos.api.service.global.CiClusterService;
import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.shiro.AuthUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

/**
 * Created by feiliu206363 on 2015/12/4.
 */

@Controller
@RequestMapping("/api/global/ci/cluster")
public class CiClusterController extends ApiController {

    @Autowired
    CiClusterService ciClusterService;

    @ResponseBody
    @RequestMapping(value = "", method = RequestMethod.POST)
    public HttpResponseTemp<?> setCiCluster(@RequestBody CiCluster ciCluster) {
        long userId = AuthUtil.getUserId();
        return ciClusterService.setCiCluster(ciCluster, userId);
    }

    @ResponseBody
    @RequestMapping(value = "", method = RequestMethod.GET)
    public HttpResponseTemp<?> getCiCluster() {
        long userId = AuthUtil.getUserId();
        return ciClusterService.getCiCluster(userId);
    }

    @ResponseBody
    @RequestMapping(value = "", method = RequestMethod.PUT)
    public HttpResponseTemp<?> updateCiClusterById(@RequestBody CiCluster ciCluster) {
        long userId = AuthUtil.getUserId();
        return ciClusterService.updateCiCluster(ciCluster, userId);
    }

    @ResponseBody
    @RequestMapping(value = "", method = RequestMethod.DELETE)
    public HttpResponseTemp<?> deleteCiClusterById() {
        long userId = AuthUtil.getUserId();
        return ciClusterService.deleteCiCluster(userId);
    }
}
