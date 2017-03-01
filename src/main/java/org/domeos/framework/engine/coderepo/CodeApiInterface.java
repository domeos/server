package org.domeos.framework.engine.coderepo;

import org.domeos.framework.api.consolemodel.project.CodeSourceInfo;
import org.domeos.framework.api.model.ci.related.CommitInformation;

import java.util.List;

/**
 * Created by feiliu206363 on 2015/12/10.
 */
public interface CodeApiInterface {
    /**
     *
     * @param userId user id in domeos
     * @return
     */
    List<CodeSourceInfo> listCodeInfo(int userId);

    List<CodeSourceInfo> listCodeInfo(int userId, int gitlabId);

    /**
     *
     * @param projectId project id in code repo
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
     * @param projectId project id in code repo
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
    CommitInformation getCommitInfo(int projectId, String path);

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
     * when check project in code repository fail, delete deploy keys named DomeOS first
     * @param projectId
     */
    void deleteDeployKeys(int projectId);

    /**
     *
     * @param codeId
     * @return
     */
    List<String> getTags(int codeId);

    /**
     *
     * @return
     */
    boolean checkProjectPermission(int projectIdInGitlab);
}
