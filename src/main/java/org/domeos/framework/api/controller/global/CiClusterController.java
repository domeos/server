package org.domeos.framework.api.controller.global;

import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.framework.api.controller.ApiController;
import org.domeos.framework.api.model.global.CiCluster;
import org.domeos.framework.api.service.global.CiClusterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

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
        return ciClusterService.setCiCluster(ciCluster);
    }

    @ResponseBody
    @RequestMapping(value = "", method = RequestMethod.GET)
    public HttpResponseTemp<?> getCiCluster() {
        return ciClusterService.getCiCluster();
    }

    @ResponseBody
    @RequestMapping(value = "", method = RequestMethod.PUT)
    public HttpResponseTemp<?> updateCiClusterById(@RequestBody CiCluster ciCluster) {
        return ciClusterService.updateCiCluster(ciCluster);
    }

    @ResponseBody
    @RequestMapping(value = "", method = RequestMethod.DELETE)
    public HttpResponseTemp<?> deleteCiClusterById() {
        return ciClusterService.deleteCiCluster();
    }
}
