package org.domeos.framework.api.controller.loadBalancer;

import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.basemodel.ResultStat;
import org.domeos.framework.api.consolemodel.loadBalancer.LoadBalancerCollectionDraft;
import org.domeos.framework.api.controller.ApiController;
import org.domeos.framework.api.service.loadBalancer.LoadBalancerCollectionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

/**
 * Created by jackfan on 2017/2/24.
 */
@Controller
@RequestMapping("/api/loadBalancerCollection")
public class LoadBalancerCollectionController extends ApiController{
    @Autowired
    LoadBalancerCollectionService lbcService;

    @ResponseBody
    @RequestMapping(value = "", method = RequestMethod.POST)
    public HttpResponseTemp<?> createLoadBalancerCollection(@RequestBody LoadBalancerCollectionDraft lbcDraft) throws Exception {
        return ResultStat.OK.wrap(lbcService.createLoadBalancerCollection(lbcDraft));
    }

    
    @ResponseBody
    @RequestMapping(value = "/{lbcId}", method = RequestMethod.DELETE)
    public HttpResponseTemp<?> deleteLoadBalancerCollection(@PathVariable int lbcId) throws Exception {
        lbcService.deleteLoadBalancerCollection(lbcId);
        return ResultStat.OK.wrap(null);
    }
    
    @ResponseBody
    @RequestMapping(value = "", method = RequestMethod.PUT)
    public HttpResponseTemp<?> updateLoadBalancerCollection(@RequestBody LoadBalancerCollectionDraft lbcDraft) throws Exception {
        return ResultStat.OK.wrap(lbcService.updateLoadBalancerCollection(lbcDraft));
    }
    
    @ResponseBody
    @RequestMapping(value = "/{lbcId}", method = RequestMethod.GET)
    public HttpResponseTemp<?> getLoadBalancerCollection(@PathVariable int lbcId) throws Exception {
        return ResultStat.OK.wrap(lbcService.getLoadBalancerCollection(lbcId));
    }
    
    @ResponseBody
    @RequestMapping(value = "/list", method = RequestMethod.GET)
    public HttpResponseTemp<?> listLoadBalancerCollection() throws Exception {
        return ResultStat.OK.wrap(lbcService.listLoadBalancerCollection());
    }

}
