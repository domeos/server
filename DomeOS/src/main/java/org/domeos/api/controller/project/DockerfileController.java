package org.domeos.api.controller.project;

import org.domeos.api.controller.ApiController;
import org.domeos.api.model.project.Dockerfile;
import org.domeos.api.service.project.DockerfileService;
import org.domeos.basemodel.HttpResponseTemp;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

/**
 * Created by feiliu206363 on 2015/11/12.
 */
@Controller
@RequestMapping("/dockerfile")
public class DockerfileController extends ApiController {
    @Autowired
    @Qualifier("dockerfileService")
    DockerfileService dockerfileService;

    @ResponseBody
    @RequestMapping(value = "/create", method = RequestMethod.POST)
    public HttpResponseTemp<?> createDockerfile(@RequestBody Dockerfile dockerfile, @RequestParam String projectname) {
        return dockerfileService.createDockerfile(dockerfile, projectname);
    }

    @ResponseBody
    @RequestMapping(value = "/delete/{id}", method = RequestMethod.DELETE)
    public HttpResponseTemp<?> deleteDockerfile(@PathVariable int id) {
        return dockerfileService.deleteDockerfile(id);
    }

    @ResponseBody
    @RequestMapping(value = "/modify", method = RequestMethod.PUT)
    public HttpResponseTemp<?> modifyDockerfile(@RequestBody Dockerfile dockerfile) {
        return dockerfileService.modifyDockerfile(dockerfile);
    }

    @ResponseBody
    @RequestMapping(value = "/get/{projectId}", method = RequestMethod.GET)
    public HttpResponseTemp<?> getDockerfile(@PathVariable int projectId) {
        return dockerfileService.getDockerfile(projectId);
    }
}
