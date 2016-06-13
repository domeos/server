package org.domeos.framework.api.controller.project;

import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.framework.api.consolemodel.project.ProjectCreate;
import org.domeos.framework.api.controller.ApiController;
import org.domeos.framework.api.model.ci.BuildHistory;
import org.domeos.framework.api.model.ci.related.BuildResult;
import org.domeos.framework.api.model.project.GitlabUser;
import org.domeos.framework.api.model.project.Project;
import org.domeos.framework.api.model.project.SubversionUser;
import org.domeos.framework.api.model.project.related.CodeConfiguration;
import org.domeos.framework.api.service.project.BuildService;
import org.domeos.framework.api.service.project.ProjectService;
import org.domeos.framework.engine.exception.DaoException;
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
@RequestMapping("/api")
public class ProjectController extends ApiController {
    @Autowired
    @Qualifier("projectService")
    ProjectService projectService;

    @Autowired
    @Qualifier("buildService")
    BuildService buildService;

    @ResponseBody
    @RequestMapping(value = "/project", method = RequestMethod.POST)
    public HttpResponseTemp<?> createProject(@RequestBody ProjectCreate projectCreate) {
        return projectService.createProject(projectCreate);
    }

    @ResponseBody
    @RequestMapping(value = "/project/{id}", method = RequestMethod.DELETE)
    public HttpResponseTemp<?> deleteProject(@PathVariable int id) {
        return projectService.deleteProject(id);
    }

    @ResponseBody
    @RequestMapping(value = "/project", method = RequestMethod.PUT)
    public HttpResponseTemp<?> modifyProject(@RequestBody Project project) {
        return projectService.modifyProject(project);
    }

    @ResponseBody
    @RequestMapping(value = "/project/{id}", method = RequestMethod.GET)
    public HttpResponseTemp<Project> getProject(@PathVariable int id) {
        return projectService.getProject(id);
    }

    @ResponseBody
    @RequestMapping(value = "/project", method = RequestMethod.GET)
    public HttpResponseTemp<?> listProjectInfo() {
            return projectService.listProjectInfo();
    }

    @ResponseBody
    @RequestMapping(value = "/project/git/gitlabinfo", method = RequestMethod.GET)
    public HttpResponseTemp<?> listGitlabInfos() {
        return projectService.listCodeSourceInfo();
    }

    @ResponseBody
    @RequestMapping(value = "/project/git/subversioninfo", method = RequestMethod.GET)
    public HttpResponseTemp<?> listSubversionInfos() {
        return projectService.listSvnCodeSourceInfo();
    }

    @ResponseBody
    @RequestMapping(value = "/project/git/gitlabinfo", method = RequestMethod.POST)
    public HttpResponseTemp<?> setGitlabInfo(@RequestBody GitlabUser gitlabUser) {
        return projectService.setGitlabInfo(gitlabUser);
    }

    @ResponseBody
    @RequestMapping(value = "/project/git/subversioninfo", method = RequestMethod.POST)
    public HttpResponseTemp<?> setSubversionInfo(@RequestBody SubversionUser subversionUser) {
        return projectService.setSubversionInfo(subversionUser);
    }

    @ResponseBody
    @RequestMapping(value = "/project/dockerfile/{id}/{branch}", method = RequestMethod.GET)
    public HttpResponseTemp<?> getDockerfile(@PathVariable int id, @PathVariable String branch, @RequestParam String path) {
        return projectService.getProjectDockerfile(id, branch, path);
    }

    @ResponseBody
    @RequestMapping(value = "/project/branches/{id}", method = RequestMethod.GET)
    public HttpResponseTemp<?> getCodeBranches(@PathVariable int id) {
        return projectService.getBranches(id);
    }

    @ResponseBody
    @RequestMapping(value = "/project/branches/{codemanager}/{codeid}/{codeuserid}", method = RequestMethod.GET)
    public HttpResponseTemp<?> getCodeBranches(@PathVariable String codemanager, @PathVariable int codeid, @PathVariable int codeuserid) {
        CodeConfiguration codeInfo = new CodeConfiguration(codemanager, codeid, codeuserid);
        return projectService.getBranches(codeInfo);
    }

    @ResponseBody
    @RequestMapping(value = "/project/tags/{id}", method = RequestMethod.GET)
    public HttpResponseTemp<?> getCodeTags(@PathVariable int id) {
        return projectService.getTags(id);
    }

    @ResponseBody
    @RequestMapping(value = "/project/tags/{codemanager}/{codeid}/{codeuserid}", method = RequestMethod.GET)
    public HttpResponseTemp<?> getCodeTags(@PathVariable String codemanager, @PathVariable int codeid, @PathVariable int codeuserid) {
        CodeConfiguration codeInfo = new CodeConfiguration(codemanager, codeid, codeuserid);
        return projectService.getTags(codeInfo);
    }

    @ResponseBody
    @RequestMapping(value = "/project/readme/{id}/{branch}", method = RequestMethod.GET)
    public HttpResponseTemp<?> getReadme(@PathVariable int id, @PathVariable String branch) {
        return projectService.getReadme(id, branch);
    }


    @ResponseBody
    @RequestMapping(value = "/ci/build/start", method = RequestMethod.POST)
    public HttpResponseTemp<?> startBuild(@RequestBody BuildHistory buildInfo) {
        return buildService.startBuild(buildInfo);
    }

    @ResponseBody
    @RequestMapping(value = "/ci/build/autobuild", method = RequestMethod.POST)
    public HttpResponseTemp<?> startAutoBuild(@RequestBody String webHookStr) {
        return buildService.startAutoBuild(webHookStr);
    }

    @ResponseBody
    @RequestMapping(value = "/ci/build/builddockerfile/{projectId}/{buildId}", method = RequestMethod.GET)
    public String dockerfile(@PathVariable int projectId, @PathVariable int buildId, @RequestParam String secret) {
        return buildService.dockerFile(projectId, buildId, secret);
    }

    @ResponseBody
    @RequestMapping(value = "/ci/build/compilefile/{projectId}/{buildId}", method = RequestMethod.GET)
    public String compileFile(@PathVariable int projectId, @PathVariable int buildId, @RequestParam String secret) {
        return buildService.getCompileFile(projectId, buildId, secret);
    }

    @ResponseBody
    @RequestMapping(value = "/ci/build/dockerfile", method = RequestMethod.POST)
    public HttpResponseTemp<?> dockerfilePreview(@RequestBody Project project) {
        return buildService.dockerfilePreview(project);
    }

    @ResponseBody
    @RequestMapping(value = "/ci/build/dockerfile/{projectId}/{buildId}", method = RequestMethod.GET)
    public HttpResponseTemp<?> dockerfileUsed(@PathVariable int projectId, @PathVariable int buildId) {
        return buildService.dockerfileUsed(projectId, buildId);
    }

    @ResponseBody
    @RequestMapping(value = "/ci/build/status", method = RequestMethod.POST)
    public HttpResponseTemp<?> setBuildStatus(@RequestBody BuildResult buildState, @RequestParam String secret)
            throws IOException, DaoException {
        return buildService.setBuildStatus(buildState, secret);
    }

    @ResponseBody
    @RequestMapping(value = "/ci/build/downloadrsa/{projectId}/{buildId}", method = RequestMethod.GET)
    public String downloadRsa(@PathVariable int projectId, @PathVariable int buildId, @RequestParam String secret) {
        return buildService.downloadRsa(projectId, buildId, secret);
    }

    @ResponseBody
    @RequestMapping(value = "/ci/build/upload/{projectId}/{buildId}", method = RequestMethod.POST)
    public HttpResponseTemp<?> uploadLogfile(@RequestParam(value = "file", required = false) MultipartFile file,
                                             @PathVariable int projectId, @PathVariable int buildId, @RequestParam String secret) {
        return buildService.uploadLogfile(file, projectId, buildId, secret);
    }

    @ResponseBody
    @RequestMapping(value = "/ci/build/download/{projectId}/{buildId}", method = RequestMethod.GET)
    public HttpResponseTemp<?> downloadLogFile(@PathVariable int projectId, @PathVariable int buildId) {
        return buildService.downloadLogFile(projectId, buildId);
    }

    @ResponseBody
    @RequestMapping(value = "/ci/build/{projectId}", method = RequestMethod.GET)
    public HttpResponseTemp<?> listBuildInfo(@PathVariable int projectId) {
        return buildService.listBuildInfo(projectId);
    }
}
