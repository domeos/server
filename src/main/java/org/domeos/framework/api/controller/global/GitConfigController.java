package org.domeos.framework.api.controller.global;

import org.domeos.framework.api.controller.ApiController;
import org.domeos.framework.api.model.global.GitConfig;
import org.domeos.framework.api.service.global.GitConfigService;
import org.domeos.basemodel.HttpResponseTemp;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

/**
 * Created by feiliu206363 on 2015/11/17.
 */
@Controller
@RequestMapping("/api/global/gitconfig")
public class GitConfigController extends ApiController {
    @Autowired
    GitConfigService gitConfigService;

    @ResponseBody
    @RequestMapping(value = "", method = RequestMethod.GET)
    HttpResponseTemp<?> listGitConfigs() {
        return gitConfigService.listGitConfigs();
    }

    @ResponseBody
    @RequestMapping(value = "/user", method = RequestMethod.GET)
    HttpResponseTemp<?> listUserGitConfigs() {
        return gitConfigService.listUserGitConfigs();
    }

    @ResponseBody
    @RequestMapping(value = "", method = RequestMethod.POST)
    HttpResponseTemp<?> addGitConfig(@RequestBody GitConfig gitConfig) {
        return gitConfigService.addGitConfig(gitConfig);
    }

    @ResponseBody
    @RequestMapping(value = "", method = RequestMethod.PUT)
    HttpResponseTemp<?> modifyGitConfig(@RequestBody GitConfig gitConfig) {
        return gitConfigService.modifyGitConfig(gitConfig);
    }

    @ResponseBody
    @RequestMapping(value = "/{id}", method = RequestMethod.GET)
    HttpResponseTemp<?> getGitConfig(@PathVariable int id) {
        return gitConfigService.getGitConfigById(id);
    }

    @ResponseBody
    @RequestMapping(value = "/{id}", method = RequestMethod.DELETE)
    HttpResponseTemp<?> deleteGitConfig(@PathVariable int id) {
        return gitConfigService.deleteGitConfigById(id);
    }

    @ResponseBody
    @RequestMapping(value = "/{id}/usage", method = RequestMethod.GET)
    HttpResponseTemp<?> getGitlabUsage(@PathVariable int id) {
        return gitConfigService.getGitlabUsage(id);
    }
}
