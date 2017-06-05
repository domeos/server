package org.domeos.framework.api.controller.project;

import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.framework.api.consolemodel.auth.CreatorInfo;
import org.domeos.framework.api.consolemodel.project.ProjectCollectionConsole;
import org.domeos.framework.api.consolemodel.project.ProjectConsole;
import org.domeos.framework.api.consolemodel.project.ProjectInfoConsole;
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
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

/**
 * Created by feiliu206363 on 2015/11/12.
 */
@Controller
@RequestMapping("/api")
public class ProjectController extends ApiController {
    public static final String PROJECT_CREATOR_ID = "/project/creator/{id}";
    @Autowired
    ProjectService projectService;

    @Autowired
    BuildService buildService;

    @ResponseBody
    @RequestMapping(value = "/projectcollection/{collectionId}/name", method = RequestMethod.GET)
    public HttpResponseTemp<String> getProjectCollectionNameById(@PathVariable int collectionId) {
        return projectService.getProjectCollectionNameById(collectionId);
    }

    @ResponseBody
    @RequestMapping(value = "/projectcollection", method = RequestMethod.GET)
    public HttpResponseTemp<List<ProjectCollectionConsole>> listProjectCollection() {
        return projectService.listProjectCollection();
    }

    @ResponseBody
    @RequestMapping(value = "/projectcollection", method = RequestMethod.POST)
    public HttpResponseTemp<ProjectCollectionConsole> addProjectCollection(@RequestBody ProjectCollectionConsole projectCollectionConsole) {
        return projectService.addProjectCollection(projectCollectionConsole);
    }

    @ResponseBody
    @RequestMapping(value = "/projectcollection", method = RequestMethod.PUT)
    public HttpResponseTemp<ProjectCollectionConsole> updateProjectCollection(@RequestBody ProjectCollectionConsole projectCollectionConsole) {
        return projectService.updateProjectCollection(projectCollectionConsole);
    }

    @ResponseBody
    @RequestMapping(value = "/projectcollection/{id}", method = RequestMethod.DELETE)
    public HttpResponseTemp<?> deleteProjectCollection(@PathVariable int id) {
        return projectService.deleteProjectCollection(id);
    }

    @ResponseBody
    @RequestMapping(value = "/projectcollection/{id}", method = RequestMethod.GET)
    public HttpResponseTemp<ProjectCollectionConsole> getProjectCollection(@PathVariable int id) {
        return projectService.getProjectCollection(id);
    }

    @ResponseBody
    @RequestMapping(value = "/projectcollection/{collectionId}/project", method = RequestMethod.POST)
    public HttpResponseTemp<ProjectConsole> createProject(@PathVariable int collectionId, @RequestBody Project project) {
        return projectService.createProject(collectionId, project);
    }

    @ResponseBody
    @RequestMapping(value = "/project/{id}", method = RequestMethod.DELETE)
    public HttpResponseTemp<?> deleteProject(@PathVariable int id) {
        return projectService.deleteProject(id);
    }

    @ResponseBody
    @RequestMapping(value = "/project", method = RequestMethod.PUT)
    public HttpResponseTemp<ProjectConsole> modifyProject(@RequestBody Project project) {
        return projectService.modifyProject(project);
    }

    @ResponseBody
    @RequestMapping(value = "/project/{projectId}", method = RequestMethod.GET)
    public HttpResponseTemp<ProjectConsole> getProject(@PathVariable int projectId) {
        return projectService.getProject(projectId);
    }

    @ResponseBody
    @RequestMapping(value = "/projectcollection/{collectionId}/project", method = RequestMethod.GET)
    public HttpResponseTemp<List<ProjectInfoConsole>> listProjectInfo(@PathVariable int collectionId) {
        return projectService.listProjectInfo(collectionId);
    }

    @ResponseBody
    @RequestMapping(value = "/project/git/gitlabinfo", method = RequestMethod.GET)
    public HttpResponseTemp<?> listGitlabInfos() {
        return projectService.listCodeSourceInfo();
    }

    @ResponseBody
    @RequestMapping(value = "/project/git/gitlabinfo/{gitlabId}", method = RequestMethod.GET)
    public HttpResponseTemp<?> listGitlabInfos(@PathVariable int gitlabId) {
        return projectService.listCodeSourceInfo(gitlabId);
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
    @RequestMapping(value = "/project/{projectId}/git/gitlabinfo", method = RequestMethod.PUT)
    public HttpResponseTemp<?> modifyGitlabInfo(@PathVariable int projectId, @RequestBody CodeConfiguration codeInfo) {
        return projectService.modifyGitlabInfo(projectId, codeInfo);
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
    @RequestMapping(value =  PROJECT_CREATOR_ID, method = RequestMethod.POST)
    public HttpResponseTemp<?> changeCreator(@PathVariable int id, @RequestBody CreatorInfo newCreatorInfo) {
        return projectService.changeCreator(id, newCreatorInfo);
    }

    @ResponseBody
    @RequestMapping(value = "/ci/build/start", method = RequestMethod.POST)
    public HttpResponseTemp<?> startBuild(@RequestBody BuildHistory buildInfo) {
        return buildService.startBuild(buildInfo);
    }

    @ResponseBody
    @RequestMapping(value = "/ci/build/stop/{buildId}", method = RequestMethod.GET)
    public HttpResponseTemp<?> stopBuild(@PathVariable int buildId) {
        return buildService.stopBuild(buildId);
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
    @RequestMapping(value = "/ci/build/compilescript/{projectId}/{buildId}", method = RequestMethod.GET)
    public String compileScript(@PathVariable int projectId, @PathVariable int buildId, @RequestParam String secret) {
        return buildService.getCompileScript(projectId, buildId, secret);
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
    @RequestMapping(value = "/ci/build/download/{projectId}/{buildId}/uploadfile", method = RequestMethod.GET)
    public String downloadUploadFile(@PathVariable int projectId, @PathVariable int buildId,
                                     @RequestParam String filename, @RequestParam String secret) {
        return buildService.downloadUploadFile(projectId, buildId, filename, secret);
    }

    @ResponseBody
    @RequestMapping(value = "/ci/build/{projectId}", method = RequestMethod.GET)
    public HttpResponseTemp<?> listBuildInfo(@PathVariable int projectId) {
        return buildService.listBuildInfo(projectId);
    }

    @ResponseBody
    @RequestMapping(value = "/ci/buildInfo/{projectId}/page", method = RequestMethod.GET)
    public HttpResponseTemp<?> getBuildInfoAfterId(@PathVariable int projectId, @RequestParam int page, @RequestParam int count) {
        return buildService.getBuildInfoPageById(projectId, page, count);
    }
}
