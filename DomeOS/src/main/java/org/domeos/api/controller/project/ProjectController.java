package org.domeos.api.controller.project;

import org.domeos.api.controller.ApiController;
import org.domeos.api.model.console.project.Project;
import org.domeos.api.model.git.Gitlab;
import org.domeos.api.model.git.Subversion;
import org.domeos.api.service.project.ProjectService;
import org.domeos.api.service.project.UploadFileService;
import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.shiro.AuthUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletResponse;

/**
 * Created by feiliu206363 on 2015/11/12.
 */
@Controller
@RequestMapping("/api/project")
public class ProjectController extends ApiController {
    @Autowired
    ProjectService projectService;

    @Autowired
    UploadFileService uploadFileService;

    @ResponseBody
    @RequestMapping(value = "", method = RequestMethod.POST)
    public HttpResponseTemp<?> createProject(@RequestBody Project project) {
        long userId = AuthUtil.getUserId();
        return projectService.createProject(project, userId);
    }

    @ResponseBody
    @RequestMapping(value = "/{id}", method = RequestMethod.DELETE)
    public HttpResponseTemp<?> deleteProject(@PathVariable int id) {
        long userId = AuthUtil.getUserId();
        return projectService.deleteProject(id, userId);
    }

    @ResponseBody
    @RequestMapping(value = "", method = RequestMethod.PUT)
    public HttpResponseTemp<?> modifyProject(@RequestBody Project project) {
        long userId = AuthUtil.getUserId();
        return projectService.modifyProject(project, userId);
    }

    @ResponseBody
    @RequestMapping(value = "/{id}", method = RequestMethod.GET)
    public HttpResponseTemp<Project> getProject(@PathVariable int id) {
        long userId = AuthUtil.getUserId();
        return projectService.getProject(id, userId);
    }

    @ResponseBody
    @RequestMapping(value = "", method = RequestMethod.GET)
    public HttpResponseTemp<?> listProjectInfo() {
        long userId = AuthUtil.getUserId();
        return projectService.listProjectInfo(userId);
    }

    @ResponseBody
    @RequestMapping(value = "/git/gitlabinfo", method = RequestMethod.GET)
    public HttpResponseTemp<?> listGitlabInfos() {
        long userId = AuthUtil.getUserId();
        return projectService.listCodeSourceInfo(userId);
    }

    @ResponseBody
    @RequestMapping(value = "/git/subversioninfo", method = RequestMethod.GET)
    public HttpResponseTemp<?> listSubversionInfos() {
        long userId = AuthUtil.getUserId();
        return  projectService.listSvnCodeSourceInfo(userId);
    }

    @ResponseBody
    @RequestMapping(value = "/git/gitlabinfo", method = RequestMethod.POST)
    public HttpResponseTemp<?> setGitlabInfo(@RequestBody Gitlab gitlab) {
        long userId = AuthUtil.getUserId();
        return projectService.setGitlabInfo(gitlab, userId);
    }

    @ResponseBody
    @RequestMapping(value = "/git/subversioninfo", method = RequestMethod.POST)
    public HttpResponseTemp<?> setSubversionInfo(@RequestBody Subversion subversion){
        long userId = AuthUtil.getUserId();
        return projectService.setSubversionInfo(subversion, userId);
    }

    @ResponseBody
    @RequestMapping(value = "/dockerfile/{id}/{branch}", method = RequestMethod.GET)
    public HttpResponseTemp<?> getDockerfile(@PathVariable int id, @PathVariable String branch, @RequestParam String path) {
        long userId = AuthUtil.getUserId();
        return projectService.getProjectDockerfile(id, branch, path, userId);
    }

    @ResponseBody
    @RequestMapping(value = "/branches/{id}", method = RequestMethod.GET)
    public HttpResponseTemp<?> getCodeBranches(@PathVariable int id) {
        long userId = AuthUtil.getUserId();
        return projectService.getBranches(id, userId);
    }

    @ResponseBody
    @RequestMapping(value = "/readme/{id}/{branch}", method = RequestMethod.GET)
    public HttpResponseTemp<?> getReadme(@PathVariable int id, @PathVariable String branch) {
        long userId = AuthUtil.getUserId();
        return projectService.getReadme(id, branch, userId);
    }

    @ResponseBody
    @RequestMapping(value = "/upload/file", method = RequestMethod.POST)
    public HttpResponseTemp<?> uploadFile(@RequestParam(value = "file", required = false) MultipartFile file) {
        long userId = AuthUtil.getUserId();
        return uploadFileService.uploadFile(file);
    }

    @ResponseBody
    @RequestMapping(value = "/upload/files", method = RequestMethod.POST)
    public HttpResponseTemp<?> uploadFiles(@RequestParam(value = "files", required = false) MultipartFile[] files) {
        long userId = AuthUtil.getUserId();
        return uploadFileService.uploadFiles(files);
    }

    @ResponseBody
    @RequestMapping(value = "/download/file", method = RequestMethod.GET)
    public HttpResponseTemp<?> downloadFile(@RequestParam(value = "md5", required = false) String md5,
                                            @RequestParam(value = "file", required = false) String fileName,
                                            final HttpServletResponse response) {
        return uploadFileService.downloadFile(md5, fileName, response);
    }
}
