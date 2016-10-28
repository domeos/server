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
import org.gitlab.api.GitlabAPI;
import org.gitlab.api.models.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.util.LinkedList;
import java.util.List;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Future;

/**
 * Created by feiliu206363 on 2015/11/19.
 */
public class GitlabApiWrapper implements CodeApiInterface {
    private static Logger logger = LoggerFactory.getLogger(GitlabApiWrapper.class);

    GitlabAPI api;
    String url;
    String token;
    CustomObjectMapper mapper;

    public GitlabApiWrapper() {
    }

    public GitlabApiWrapper(int gitlabId) {
        this.url = GitlabInfo.getGitlabUrl();
        this.token = GitlabInfo.getGitlabToken(gitlabId);
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
        List<CodeSourceInfo> codeSourceInfos = new LinkedList<>();
        List<org.domeos.framework.api.model.project.GitlabUser> gitlabs = GitlabInfo.getGitlabsByUserId(userId);
        if (gitlabs == null) {
            return codeSourceInfos;
        }
        for (org.domeos.framework.api.model.project.GitlabUser gitlab : gitlabs) {
            GitlabApiWrapper gitlabApiWrapper = new GitlabApiWrapper(url, gitlab.getToken());
            codeSourceInfos.add(new CodeSourceInfo(gitlab.getId(), gitlab.getName(), gitlabApiWrapper.getGitlabProjectInfos()));
        }
        return codeSourceInfos;
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
        List<CodeSourceInfo.ProjectInfo> projectInfos = new LinkedList<>();
        try {
            List<GitlabProject> projects = api.getProjects();
            List<Future<CodeSourceInfo.ProjectInfo>> futures = new LinkedList<>();
            if (projects != null) {
                for (GitlabProject project : projects) {
                    Future<CodeSourceInfo.ProjectInfo> future = ClientConfigure.executorService.submit(new ProjectInfoTask(project, 30));
                    futures.add(future);
                }
            }
            for (Future<CodeSourceInfo.ProjectInfo> future : futures) {
                try {
                    CodeSourceInfo.ProjectInfo info = future.get();
                    if (info != null) {
                        projectInfos.add(info);
                    }
                } catch (InterruptedException | ExecutionException ignored) {
                    logger.warn("get code info for gitlab error, " + ignored.getMessage());
                }
            }
        } catch (IOException ignored) {
            logger.warn("get code info for gitlab error, " + ignored.getMessage());
        } catch (Error error) {
            logger.error("get code info for gitlab error, " + error.getMessage());
        }

        return projectInfos;
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
    public CommitInformation getCommitInfo(int projectId, String path) {
        return null;
    }

    public CommitInformation getBranchCommitInfo(int projectId, String branch) {
        try {
            GitlabBranch info = api.getBranch(projectId, branch);
            if (info != null && info.getCommit() != null) {
                return generateCommitInfo(info.getName(), info.getCommit());
            }
        } catch (IOException ignored) {
            logger.warn("get project " + projectId + " branch commit info from gitlab error, " + ignored.getMessage());
        }
        return null;
    }

    public CommitInformation getTagCommitInfo(int projectId, String tag) {
        try {
            List<GitlabTag> tags = api.getTags(projectId);
            if (tags != null) {
                for (GitlabTag gitlabTag : tags) {
                    if (gitlabTag.getName().equals(tag) && gitlabTag.getCommit() != null) {
                        return generateCommitInfo(gitlabTag.getName(), gitlabTag.getCommit());
                    }
                }
            }
        } catch (IOException ignored) {
            logger.warn("get project " + projectId + " tag commit info from gitlab error, " + ignored.getMessage());
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
            List<GitlabSSHKey> deployKeys =  api.getDeployKeys(projectId);
            if (deployKeys != null){
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

//    public RSAKeyPair getDeployKey(int projectId)
//    {
//        try {
//            List<GitlabSSHKey> deployKeys =  api.getDeployKeys(projectId);
//            if (deployKeys != null){
//                for (GitlabSSHKey sshKey : deployKeys) {
//                    RSAKeyPair retPair = GitlabInfo.getRSAKeyPairByDeployId(sshKey.getId());
//                    if(retPair != null) {
//                        deleteExtraDeploykeys(retPair, deployKeys, projectId);
//                        return retPair;
//                    }
//                }
//            }
//        } catch (IOException ignored) {
//            logger.warn("get deploy key for project " + projectId + " from gitlab error, " + ignored.getMessage());
//        }
//        return null;
//    }
//
//    void deleteExtraDeploykeys(RSAKeyPair newKey, List<GitlabSSHKey> sshKeys, int projectId) {
//        if (newKey == null) {
//            return;
//        }
//        try {
//            if (sshKeys != null) {
//                for (GitlabSSHKey sshKey : sshKeys) {
//                    if (sshKey.getId() != newKey.getKeyId()) {
//                        RSAKeyPair rsaKeyPair = GitlabInfo.getRSAKeyPairByDeployId(sshKey.getId());
//                        if (rsaKeyPair == null)
//                            continue;
//                        GitlabInfo.updateExtraDeployId(newKey, sshKey.getId());
//                        api.deleteDeployKey(projectId, sshKey.getId());
//                    }
//                }
//            }
//        } catch (IOException ignored) {
//            logger.warn("delete extra deploy keys for project " + projectId + " from gitlab error, " + ignored.getMessage());
//        }
//    }

    public byte[] getReadme(int projectId, String branch) {
        try {
            GitlabProject project = new GitlabProject();
            project.setId(projectId);
            List<GitlabRepositoryTree> trees = api.getRepositoryTree(project, null, null);
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

    public class ProjectInfoTask implements Callable<CodeSourceInfo.ProjectInfo> {
        GitlabProject project;
        int accessValue;

        public ProjectInfoTask(GitlabProject project, int accessValue) {
            this.project = project;
            this.accessValue = accessValue;
        }

        @Override
        public CodeSourceInfo.ProjectInfo call() throws Exception {
            GitlabProject fullInfo = api.getProject(project.getId());
            GitlabAccessLevel accessLevel = null;
            if (fullInfo.getPermissions() != null) {
                if (fullInfo.getPermissions().getProjectAccess() != null) {
                    GitlabAccessLevel projectLevel = fullInfo.getPermissions().getProjectAccess().getAccessLevel();
                    if (projectLevel != null) {
                        accessLevel = projectLevel;
                    }
                }
                if (fullInfo.getPermissions().getProjectGroupAccess() != null) {
                    GitlabAccessLevel groupLevel = fullInfo.getPermissions().getProjectGroupAccess().getAccessLevel();
                    if (groupLevel != null
                            && (accessLevel == null || groupLevel.accessValue > accessLevel.accessValue)) {
                        accessLevel = groupLevel;
                    }
                }
            }
            if (accessLevel != null && accessLevel.accessValue > this.accessValue) {
                return new CodeSourceInfo.ProjectInfo(project.getId(), project.getNameWithNamespace(), project.getSshUrl(),
                        project.getWebUrl(), project.getDescription(), accessLevel.name(), project.getCreatedAt().getTime());
            }
            return null;
        }
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
        } catch (UnsupportedEncodingException | JsonProcessingException e) {
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

    public class UserInfo {
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

    private CommitInformation generateCommitInfo(String name, GitlabBranchCommit commit) {
        CommitInformation commitInformation = new CommitInformation();
        commitInformation.setName(name);
        commitInformation.setId(commit.getId());
        commitInformation.setMessage(commit.getMessage());
        commitInformation.setAuthoredDate(commit.getAuthoredDate().getTime());
        if (commit.getAuthor() != null) {
            commitInformation.setAuthorName(commit.getAuthor().getName());
            commitInformation.setAuthorEmail(commit.getAuthor().getEmail());
        }
        commitInformation.setCommittedDate(commit.getCommittedDate().getTime());
        if (commit.getCommitter() != null) {
            commitInformation.setCommitterName(commit.getCommitter().getName());
            commitInformation.setCommitterEmail(commit.getCommitter().getEmail());
        }
        return commitInformation;
    }
}