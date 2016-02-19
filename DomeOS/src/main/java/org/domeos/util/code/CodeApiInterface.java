package org.domeos.util.code;

import org.domeos.api.model.ci.RSAKeyPair;
import org.domeos.api.model.console.git.CodeSourceInfo;
import org.gitlab.api.models.GitlabSSHKey;

import java.util.List;

/**
 * Created by feiliu206363 on 2015/12/10.
 */
public interface CodeApiInterface {
    /**
     *
     * @param userId
     * @return
     */
    List<CodeSourceInfo> listCodeInfo(int userId);

    /**
     *
     * @param projectId
     * @param hookUrl
     * @param pushEvents
     * @param tagPushEvents
     * @return
     */
    boolean setProjectHook(int projectId, String hookUrl, boolean pushEvents, boolean tagPushEvents);

    /**
     *
     * @return
     */
    List<CodeSourceInfo.ProjectInfo> getGitlabProjectInfos();

    /**
     *
     * @param svnId
     * @return
     */
    CodeSourceInfo.ProjectInfo getSubversionProjectInfo(int svnId);

    /**
     *
     * @param projectId
     * @param title
     * @param key
     * @return
     */
    int setDeployKey(int projectId, String title, String key);

    /**
     *
     * @param projectId
     * @param path
     * @return
     */
    GitlabApiWrapper.CommitInfo getCommitInfo(int projectId, String path);

    /**
     *
     * @param projectId
     * @param branch
     * @return
     */
    GitlabApiWrapper.CommitInfo getBranchCommitInfo(int projectId, String branch);

    /**
     *
     * @param projectId
     * @param tag
     * @return
     */
    GitlabApiWrapper.CommitInfo getTagCommitInfo(int projectId, String tag);

    /**
     *
     * @param projectId
     * @param deployKeyId
     * @return
     */
    boolean checkDeployKey(int projectId, int deployKeyId);

    /**
     *
     * @param projectId
     * @param branch
     * @return
     */
    byte[] getReadme(int projectId, String branch);

    /**
     *
     * @param projectId
     * @return
     */
    List<String> getBranches(int projectId);

    /**
     *
     * @param projectId
     * @param ref
     * @param fileName
     * @return
     */
    byte[] getDockerfile(int projectId, String ref, String fileName);

    /**
     *
     * @param projectId
     * @return
     */
    RSAKeyPair getDeployKey(int projectId);



}
