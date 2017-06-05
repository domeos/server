package org.domeos.framework.engine.coderepo;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import org.apache.http.HttpEntity;
import org.apache.http.client.config.RequestConfig;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.message.BasicHeader;
import org.apache.http.protocol.HTTP;
import org.apache.http.util.EntityUtils;
import org.domeos.exception.GitlabTokenException;
import org.domeos.exception.ProjectHookException;
import org.domeos.framework.api.consolemodel.project.CodeSourceInfo;
import org.domeos.framework.api.model.ci.related.CommitInformation;
import org.domeos.framework.engine.model.CustomObjectMapper;
import org.domeos.global.ClientConfigure;
import org.domeos.global.GlobalConstant;
import org.domeos.util.HttpsClient;
import org.domeos.util.StringUtils;
import org.gitlab.api.GitlabAPI;
import org.gitlab.api.models.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;
import java.util.concurrent.Callable;

/**
 * Created by feiliu206363 on 2015/11/19.
 */
public class GitlabApiWrapper implements CodeApiInterface {
    private static Logger logger = LoggerFactory.getLogger(GitlabApiWrapper.class);
    private static int masterAccessLevel = 30;

    GitlabAPI api;
    String url;
    String token;
    CustomObjectMapper mapper;

    public GitlabApiWrapper() {
    }

    public GitlabApiWrapper(int gitlabUserId) {
        this.url = GitlabInfo.getGitlabUrlByGitLabUserId(gitlabUserId);
        this.token = GitlabInfo.getGitlabToken(gitlabUserId);
        init();
    }

    public GitlabApiWrapper(String url, String token) {
        this.url = url;
        this.token = token;
        init();
    }

    public void init() {
        mapper = new CustomObjectMapper();
        if (url != null && token != null) {
            this.api = GitlabAPI.connect(url, token).ignoreCertificateErrors(true);
        }
    }

    public List<CodeSourceInfo> listCodeInfo(int userId) {
        List<org.domeos.framework.api.model.project.GitlabUser> gitlabs = GitlabInfo.getGitlabsByUserId(userId);
        return listCodeInfo(gitlabs);
    }

    @Override
    public List<CodeSourceInfo> listCodeInfo(int userId, int gitlabId) {
        List<org.domeos.framework.api.model.project.GitlabUser> gitlabs =
                GitlabInfo.getGitlabsByUserIdAndGitlabId(userId, gitlabId);
        return listCodeInfo(gitlabs);
    }

    private List<CodeSourceInfo> listCodeInfo(List<org.domeos.framework.api.model.project.GitlabUser> gitlabs) {
        if (gitlabs == null || gitlabs.isEmpty()) {
            return new ArrayList<>(1);
        }
        List<CodeSourceTask> codeSourceTasks = new ArrayList<>(gitlabs.size());
        for (org.domeos.framework.api.model.project.GitlabUser gitlab : gitlabs) {
            codeSourceTasks.add(new CodeSourceTask(gitlab.getId(),
                    gitlab.getName(), gitlab.getToken(), gitlab.getGitlabId()));

        }
        return ClientConfigure.executeCompletionService(codeSourceTasks);
    }

    private class CodeSourceTask implements Callable<CodeSourceInfo> {
        private int id;
        private String userName;
        private String token;
        private int gitlabId;

        public CodeSourceTask(int id, String userName, String token, int gitlabId) {
            this.id = id;
            this.userName = userName;
            this.token = token;
            this.gitlabId = gitlabId;
        }

        @Override
        public CodeSourceInfo call() throws Exception {
            String repoUrl = GitlabInfo.getGitlabUrl(gitlabId);
            GitlabApiWrapper wrapper = new GitlabApiWrapper(repoUrl, token);
            List<CodeSourceInfo.ProjectInfo> infos = wrapper.getGitlabProjectInfos();
            return new CodeSourceInfo(id, userName, infos);
        }
    }

    public boolean setProjectHook(int projectId, String hookUrl, boolean pushEvents, boolean tagPushEvents) {
        try {
            List<GitlabProjectHook> hooks = api.getProjectHooks(projectId);
            if (hooks != null) {
                for (GitlabProjectHook hook : hooks) {
                    if (hook != null && hook.getUrl() != null && hook.getUrl().equalsIgnoreCase(hookUrl)) {
                        api.deleteProjectHook(hook);
                    }
                }
            }
        } catch (IOException ignored) {
            logger.warn("get webhook for gitlab project " + projectId + "error, " + ignored.getMessage());
        }

        try {
            return api.addProjectHook(projectId, hookUrl, pushEvents, false, false, tagPushEvents, false) != null;
        } catch (IOException ignored) {
            logger.warn("set webhook for gitlab project " + projectId + "error, " + ignored.getMessage());
        }
        return false;
    }

    public List<CodeSourceInfo.ProjectInfo> getGitlabProjectInfos() {
        try {
            GitlabVersion gitlabVersion = api.getVersion();
            if (!StringUtils.isBlank(gitlabVersion.getVersion())
                    && Integer.valueOf(gitlabVersion.getVersion().split("\\.")[0]) >= 8) {
                return getGitlabProjectInfosAfterVersion8();
            }
        } catch (IOException ignored) {
        }
        return getGitlabProjectInfosBeforeVersion8();
    }

    private List<CodeSourceInfo.ProjectInfo> getGitlabProjectInfosAfterVersion8() {
        try {
            List<GitlabProject> projects = api.getProjects();
            if (projects != null && !projects.isEmpty()) {
                List<CodeSourceInfo.ProjectInfo> projectInfos = new ArrayList<>(projects.size());
                for (GitlabProject project : projects) {
                    GitlabAccessLevel accessLevel = getGitlabProjectAccessLevel(project);
                    if (accessLevel != null && accessLevel.accessValue > masterAccessLevel) {
                        projectInfos.add(new CodeSourceInfo.ProjectInfo(project.getId(), project.getNameWithNamespace(), project.getSshUrl(),
                                project.getWebUrl(), project.getDescription(), accessLevel.name(), project.getCreatedAt().getTime()));
                    }
                }
                return projectInfos;
            }
        } catch (IOException ignored) {
            logger.warn("get code info for gitlab error, " + ignored.getMessage());
        } catch (Error error) {
            logger.error("get code info for gitlab error, " + error.getMessage());
        }
        return new ArrayList<>(1);
    }

    private List<CodeSourceInfo.ProjectInfo> getGitlabProjectInfosBeforeVersion8() {
        try {
            List<GitlabProject> projects = api.getProjects();
            if (projects != null && !projects.isEmpty()) {
                List<GetProjectInfoTask> projectInfoTasks = new ArrayList<>(projects.size());
                for (GitlabProject project : projects) {
                    projectInfoTasks.add(new GetProjectInfoTask(api, project.getId()));
                }
                return ClientConfigure.executeCompletionService(projectInfoTasks);
            }
        } catch (IOException ignored) {
            logger.warn("get code info for gitlab error, " + ignored.getMessage());
        } catch (Error error) {
            logger.error("get code info for gitlab error, " + error.getMessage());
        }
        return new ArrayList<>(1);
    }

    class GetProjectInfoTask implements Callable<CodeSourceInfo.ProjectInfo> {
        private int projectId;
        private GitlabAPI gitlabAPI;

        public GetProjectInfoTask(GitlabAPI gitlabAPI, int projectId) {
            this.projectId = projectId;
            this.gitlabAPI = gitlabAPI;
        }

        @Override
        public CodeSourceInfo.ProjectInfo call() throws Exception {
            GitlabProject project = gitlabAPI.getProject(projectId);
            GitlabAccessLevel accessLevel = getGitlabProjectAccessLevel(project);
            if (accessLevel != null && accessLevel.accessValue > masterAccessLevel) {
                return new CodeSourceInfo.ProjectInfo(project.getId(), project.getNameWithNamespace(), project.getSshUrl(),
                        project.getWebUrl(), project.getDescription(), accessLevel.name(), project.getCreatedAt().getTime());
            }
            return null;
        }
    }

    private GitlabAccessLevel getGitlabProjectAccessLevel(GitlabProject project) {
        GitlabAccessLevel accessLevel = null;
        if (project != null && project.getPermissions() != null) {
            if (project.getPermissions().getProjectAccess() != null) {
                GitlabAccessLevel projectLevel = project.getPermissions().getProjectAccess().getAccessLevel();
                if (projectLevel != null) {
                    accessLevel = projectLevel;
                }
            }
            if (project.getPermissions().getProjectGroupAccess() != null) {
                GitlabAccessLevel groupLevel = project.getPermissions().getProjectGroupAccess().getAccessLevel();
                if (groupLevel != null
                        && (accessLevel == null || groupLevel.accessValue > accessLevel.accessValue)) {
                    accessLevel = groupLevel;
                }
            }
        }
        return accessLevel;
    }

    public CodeSourceInfo.ProjectInfo getSubversionProjectInfo(int svnId) {
        return null;
    }

    public int setDeployKey(int projectId, String title, String key) {
        try {
            GitlabSSHKey sshKey = api.createDeployKey(projectId, title, key);
            if (sshKey != null) {
                return sshKey.getId();
            } else {
                return -1;
            }
        } catch (IOException ignored) {
            logger.warn("set deploy key for project" + projectId + " error, " + ignored.getMessage());
        }
        return -1;
    }

    @Override
    public CommitInformation getCommitInfo(int projectId, String path) { // path can be tag or branch name, if tag is same with branch, tag first.
        try {
            List<GitlabCommit> commits = api.getLastCommits(projectId, path);
            if (commits == null || commits.size() == 0) {
                return null;
            }
            GitlabCommit commit = commits.get(0);
            CommitInformation commitInformation = new CommitInformation();
            commitInformation.setId(commit.getId());
            commitInformation.setMessage(commit.getMessage());
            commitInformation.setAuthorName(commit.getAuthorName());
            commitInformation.setAuthorEmail(commit.getAuthorEmail());
            commitInformation.setCreatedAt(commit.getCreatedAt().getTime());
            return commitInformation;
        } catch (IOException e) {
            logger.warn("get project " + projectId + " commit info from gitlab error, message is " + e.getMessage());
        }
        return null;
    }

    public boolean checkDeployKey(int projectId, int deployKeyId) {
        try {
            List<GitlabSSHKey> deployKeys = api.getDeployKeys(projectId);
            if (deployKeys != null) {
                for (GitlabSSHKey sshKey : deployKeys) {
                    if (sshKey.getId().equals(deployKeyId)) {
                        return true;
                    }
                }
            }
        } catch (IOException ignored) {
            logger.warn("check deploy key for project " + projectId + " from gitlab error, " + ignored.getMessage());
        }
        return false;
    }

    @Override
    public void deleteDeployKeys(int projectId) {
        try {
            List<GitlabSSHKey> deployKeys = api.getDeployKeys(projectId);
            if (deployKeys != null) {
                for (GitlabSSHKey sshKey : deployKeys) {
                    if ("DomeOS".equals(sshKey.getTitle())) {
                        api.deleteDeployKey(projectId, sshKey.getId());
                    }
                }
            }
        } catch (IOException ignored) {
            logger.warn("get deploy key for project " + projectId + " from gitlab error, " + ignored.getMessage());
        }
    }

    @Override
    public List<String> getTags(int projectId) {
        try {
            List<GitlabTag> tags = api.getTags(projectId);
            List<String> tagList = new LinkedList<>();
            if (tags != null) {
                for (GitlabTag gitlabTag : tags) {
                    tagList.add(gitlabTag.getName());
                }
            }
            return tagList;
        } catch (IOException ignored) {
            logger.warn("get project " + projectId + " tag commit info from gitlab error, " + ignored.getMessage());
        }
        return null;
    }

    @Override
    public boolean checkProjectPermission(int id) {
        try {
            GitlabProject fullInfo = api.getProject(id);
            GitlabAccessLevel accessLevel = null;
            if (fullInfo.getPermissions() != null && fullInfo.getPermissions().getProjectAccess() != null) {
                accessLevel = fullInfo.getPermissions().getProjectAccess().getAccessLevel();
            }
            if (fullInfo.getPermissions().getProjectGroupAccess() != null) {
                GitlabAccessLevel groupLevel = fullInfo.getPermissions().getProjectGroupAccess().getAccessLevel();
                if (groupLevel != null
                        && (accessLevel == null || groupLevel.accessValue > accessLevel.accessValue)) {
                    accessLevel = groupLevel;
                }
            }
            if (accessLevel != null && accessLevel.accessValue > 30) {
                return true;
            }
        } catch (IOException e) {
            logger.warn("get gitlab project info error, id = " + id + ", url = " + url + ", token = " + token);
        }
        return false;
    }

    public byte[] getReadme(int projectId, String branch) {
        try {
            GitlabProject project = new GitlabProject();
            project.setId(projectId);
            List<GitlabRepositoryTree> trees = api.getRepositoryTree(project, null, null, false);
            if (trees == null) {
                return null;
            }
            for (GitlabRepositoryTree tree : trees) {
                if (tree.getName().equalsIgnoreCase("readme.md")) {
                    return api.getRawFileContent(project, branch, tree.getName());
                }
            }
        } catch (IOException ignored) {
            logger.warn("get readme for project " + projectId + " on branch " + branch + " from gitlab error, " + ignored.getMessage());
        }
        return null;
    }

    public List<String> getBranches(int projectId) {
        List<String> branches = new LinkedList<>();
        try {
            List<GitlabBranch> gitlabBranches = api.getBranches(projectId);
            if (gitlabBranches == null) {
                return branches;
            }
            for (GitlabBranch gitlabBranch : gitlabBranches) {
                branches.add(gitlabBranch.getName());
            }
            return branches;
        } catch (IOException ignored) {
            logger.warn("get branch for project " + projectId + " from gitlab error, " + ignored.getMessage());
        }
        return branches;
    }

    public byte[] getDockerfile(int projectId, String ref, String fileName) {
        try {
            GitlabProject project = new GitlabProject();
            project.setId(projectId);
            return api.getRawFileContent(project, ref, fileName);
        } catch (IOException ignored) {
            logger.warn("get dockerfile for project " + projectId + " on branch " + ref + " from gitlab error, " + ignored.getMessage());
        }
        return null;
    }

    public String getToken(String userName, String password) throws Exception {
        String tokenUrl = url + "/api/v3/session";
        HttpPost post = new HttpPost(tokenUrl);
        RequestConfig requestConfig = RequestConfig.custom().setSocketTimeout(HttpsClient.SocketTimeout)
                .setConnectTimeout(HttpsClient.ConnectTimeout).build();
        post.setConfig(requestConfig);

        try {
            StringEntity stringEntity = new StringEntity(mapper.writeValueAsString(new UserInfo(userName, password)), "utf-8");
            stringEntity.setContentType(GlobalConstant.CONTENT_TYPE_TEXT_JSON);
            stringEntity.setContentEncoding(new BasicHeader(HTTP.CONTENT_TYPE, GlobalConstant.APPLICATION_JSON));
            post.addHeader(HTTP.CONTENT_TYPE, GlobalConstant.APPLICATION_JSON);
            post.setEntity(stringEntity);
        } catch (JsonProcessingException e) {
            throw new Exception(e.getMessage());
        }

        try {
            CloseableHttpResponse response = HttpsClient.getHttpClient().execute(post);
            if (response != null) {
                HttpEntity entity = response.getEntity();
                if (entity != null) {
                    String result = EntityUtils.toString(entity);
                    JsonNode node = mapper.readValue(result, JsonNode.class);
                    if (node.has("private_token")) {
                        return node.get("private_token").asText();
                    } else {
                        throw new GitlabTokenException("no token info fetched");
                    }
                }
                response.close();
            }
        } catch (IOException e) {
            throw new ProjectHookException(e.getMessage());
        } finally {
            post.completed();
        }
        return null;
    }

    private class UserInfo {
        String login;
        String password;

        public UserInfo() {
        }

        public UserInfo(String login, String password) {
            if (login.contains("@")) {
                login = login.split("@")[0];
            }
            this.login = login;
            this.password = password;
        }

        public String getLogin() {
            return login;
        }

        public void setLogin(String login) {
            this.login = login;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }
    }
}
