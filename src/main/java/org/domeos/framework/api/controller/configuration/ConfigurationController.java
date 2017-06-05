package org.domeos.framework.api.controller.configuration;

import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.basemodel.ResultStat;
import org.domeos.framework.api.controller.ApiController;
import org.domeos.framework.api.model.configuration.Configuration;
import org.domeos.framework.api.model.configuration.ConfigurationCollection;
import org.domeos.framework.api.service.configuration.ConfigurationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

/**
 * Created by feiliu206363 on 2017/1/19.
 */
@Controller
@RequestMapping("/api/configurationcollection")
public class ConfigurationController extends ApiController {
    @Autowired
    ConfigurationService configurationService;

    @ResponseBody
    @RequestMapping(value = "", method = RequestMethod.POST)
    public HttpResponseTemp<?> createConfigurationCollection(@RequestBody ConfigurationCollection configurationCollection) {
        return ResultStat.OK.wrap(configurationService.createConfigurationCollection(configurationCollection));
    }

    @ResponseBody
    @RequestMapping(value = "", method = RequestMethod.PUT)
    public HttpResponseTemp<?> modifyConfigurationCollection(@RequestBody ConfigurationCollection configurationCollection) {
        return ResultStat.OK.wrap(configurationService.modifyConfigurationCollection(configurationCollection));
    }

    @ResponseBody
    @RequestMapping(value = "/{id}", method = RequestMethod.GET)
    public HttpResponseTemp<?> getConfigurationCollection(@PathVariable int id) {
        return ResultStat.OK.wrap(configurationService.getConfigurationCollection(id));
    }

    @ResponseBody
    @RequestMapping(value = "", method = RequestMethod.GET)
    public HttpResponseTemp<?> listConfigurationCollection() {
        return ResultStat.OK.wrap(configurationService.listConfigurationCollection());
    }

    @ResponseBody
    @RequestMapping(value = "/{id}", method = RequestMethod.DELETE)
    public HttpResponseTemp<?> deleteConfigurationCollection(@PathVariable int id) {
        return ResultStat.OK.wrap(configurationService.deleteConfigurationCollection(id));
    }

    @ResponseBody
    @RequestMapping(value = "/{collectionId}/configuration", method = RequestMethod.POST)
    public HttpResponseTemp<?> createConfiguration(@PathVariable int collectionId, @RequestBody Configuration configuration) {
        return ResultStat.OK.wrap(configurationService.createConfiguration(collectionId, configuration));
    }

    @ResponseBody
    @RequestMapping(value = "/{collectionId}/configuration", method = RequestMethod.PUT)
    public HttpResponseTemp<?> modifyConfiguration(@PathVariable int collectionId, @RequestBody Configuration configuration) {
        return ResultStat.OK.wrap(configurationService.modifyConfigurationByCollectionId(collectionId, configuration));
    }

    @ResponseBody
    @RequestMapping(value = "/configuration", method = RequestMethod.PUT)
    public HttpResponseTemp<?> modifyConfiguration(@RequestBody Configuration configuration) {
        return ResultStat.OK.wrap(configurationService.modifyConfiguration(configuration));
    }

    @ResponseBody
    @RequestMapping(value = "/{collectionId}/{configureId}/configuration", method = RequestMethod.GET)
    public HttpResponseTemp<?> getConfigurationByCollectionIdAndId(@PathVariable int collectionId, @PathVariable int configureId) {
        return ResultStat.OK.wrap(configurationService.getConfigurationByCollectionIdAndId(collectionId, configureId));
    }

    @ResponseBody
    @RequestMapping(value = "/configuration/{configureId}", method = RequestMethod.GET)
    public HttpResponseTemp<?> getConfigurationById(@PathVariable int configureId) {
        return ResultStat.OK.wrap(configurationService.getConfigurationById(configureId));
    }

    @ResponseBody
    @RequestMapping(value = "/{collectionId}/configuration", method = RequestMethod.GET)
    public HttpResponseTemp<?> listConfigurationByCollectionId(@PathVariable int collectionId) {
        return ResultStat.OK.wrap(configurationService.listConfigurationByCollectionId(collectionId));
    }

    @ResponseBody
    @RequestMapping(value = "/configuration", method = RequestMethod.GET)
    public HttpResponseTemp<?> listAllConfigurations() {
        return ResultStat.OK.wrap(configurationService.listAllConfigurations());
    }

    @ResponseBody
    @RequestMapping(value = "/cluster/{clusterId}/configuration", method = RequestMethod.GET)
    public HttpResponseTemp<?> listConfigurationByClusterId(@PathVariable int clusterId) {
            return ResultStat.OK.wrap(configurationService.listConfigurationByClusterId(clusterId));
    }

    @ResponseBody
    @RequestMapping(value = "/cluster/{clusterId}/{namespace}/configuration", method = RequestMethod.GET)
    public HttpResponseTemp<?> listConfigurationByClusterIdAndNamespace(@PathVariable int clusterId,
                                                                        @PathVariable String namespace) {
        return ResultStat.OK.wrap(configurationService.listConfigurationByClusterIdAndNamespace(clusterId, namespace));
    }

    @ResponseBody
    @RequestMapping(value = "/{collectionId}/configuration/{configureId}", method = RequestMethod.DELETE)
    public HttpResponseTemp<?> deleteConfigurationId(@PathVariable int collectionId, @PathVariable int configureId) {
        return ResultStat.OK.wrap(configurationService.deleteConfigurationCollectionIdAndId(collectionId, configureId));
    }

    @ResponseBody
    @RequestMapping(value = "/configuration/{configureId}", method = RequestMethod.DELETE)
    public HttpResponseTemp<?> deleteConfigurationId(@PathVariable int configureId) {
        return ResultStat.OK.wrap(configurationService.deleteConfigurationId(configureId));
    }

    @ResponseBody
    @RequestMapping(value = "/configuration/{configureId}/deployinfo", method = RequestMethod.GET)
    public HttpResponseTemp<?> listDeployVersionByVolume(@PathVariable int configureId) {
        return ResultStat.OK.wrap(configurationService.listDeployVersionByConfiguration(configureId));
    }
}
