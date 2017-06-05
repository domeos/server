package org.domeos.framework.engine.coderepo;

import org.domeos.framework.api.consolemodel.project.CodeSourceInfo;
import org.domeos.framework.api.model.ci.related.CommitInformation;
import org.domeos.framework.api.model.ci.related.RSAKeyPair;
import org.domeos.framework.api.model.project.SubversionUser;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.tmatesoft.svn.core.SVNDirEntry;
import org.tmatesoft.svn.core.SVNException;
import org.tmatesoft.svn.core.SVNLogEntry;
import org.tmatesoft.svn.core.SVNURL;
import org.tmatesoft.svn.core.auth.ISVNAuthenticationManager;
import org.tmatesoft.svn.core.internal.io.dav.DAVRepositoryFactory;
import org.tmatesoft.svn.core.internal.io.fs.FSRepositoryFactory;
import org.tmatesoft.svn.core.internal.io.svn.SVNRepositoryFactoryImpl;
import org.tmatesoft.svn.core.io.SVNRepository;
import org.tmatesoft.svn.core.io.SVNRepositoryFactory;
import org.tmatesoft.svn.core.wc.SVNWCUtil;

import java.io.ByteArrayOutputStream;
import java.util.Collection;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;

/**
 * Created by kairen on 16-1-13.
 */
public class SubversionApiWrapper implements CodeApiInterface {
    private static Logger logger = LoggerFactory.getLogger(GitlabApiWrapper.class);
    String url;
    String name;
    String password;
    SVNRepository repository;
    int svnId;

    public SubversionApiWrapper() {
    }

    public SubversionApiWrapper(int svnId) {
        initWithsvnId(svnId);
        init();
    }

    public SubversionApiWrapper(String url, String name, String password) {
        this.svnId = -1;
        this.url = url;
        this.name = name;
        this.password = password;
        init();
    }

    public void initWithsvnId(int svnId) {
        this.svnId = svnId;
        SubversionUser subversion = SubversionInfo.getSubversion(svnId);
        if (subversion != null) {
            this.name = subversion.getName();
            this.password = subversion.getPassword();
            this.url = subversion.getSvnPath();
        }
    }

    public void init() {
        if (url != null && name != null && password != null) {
            DAVRepositoryFactory.setup();
            SVNRepositoryFactoryImpl.setup();
            FSRepositoryFactory.setup();
            try {
                repository = SVNRepositoryFactory.create(SVNURL.parseURIEncoded(url));
                ISVNAuthenticationManager authManager = SVNWCUtil.createDefaultAuthenticationManager(name, password);
                repository.setAuthenticationManager(authManager);
            } catch (SVNException e) {
                logger.error("init SubVersionApiWapper failed with url=" + url
                        + " name=" + name + " password" + password);
            }
        }
    }

    public List<CodeSourceInfo> listCodeInfo(int userId) {
        List<CodeSourceInfo> codeSourceInfos = new LinkedList<>();
        List<SubversionUser> subversions = SubversionInfo.getSubversionsByUserId(userId);
        if (subversions != null) {
            for (SubversionUser subversion : subversions) {
                SubversionApiWrapper subversionApiWrapper = new SubversionApiWrapper(subversion.getId());
                ;
                codeSourceInfos.add(new CodeSourceInfo(subversion.getId(), subversion.getName(),
                        subversionApiWrapper.getSubversionProjectInfo(subversion.getId())));
            }
        }
        return codeSourceInfos;
    }

    @Override
    public List<CodeSourceInfo> listCodeInfo(int userId, int gitlabId) {
        return listCodeInfo(userId);
    }

    public boolean setProjectHook(int projectId, String hookUrl, boolean pushEvents, boolean tagPushEvents) {
        return false;
    }

    public CodeSourceInfo.ProjectInfo getSubversionProjectInfo(int svnId) {
        CodeSourceInfo.ProjectInfo svnProjectInfo = new CodeSourceInfo.ProjectInfo();
        try {
            SVNDirEntry curInfo = repository.info("", -1);
            if (curInfo == null) {
                return null;
            }
            SVNURL url = repository.getLocation();
            if (url == null) {
                return null;
            }
            svnProjectInfo.setAccessLevel(null);
            svnProjectInfo.setCreateTime(curInfo.getDate().getTime());
            svnProjectInfo.setNameWithNamespace(name + url.getPath());
            svnProjectInfo.setHttpUrl(url.toString());
            svnProjectInfo.setSshUrl(url.toString());
            svnProjectInfo.setProjectId(svnId);
            svnProjectInfo.setDescription(curInfo.getCommitMessage());
        } catch (SVNException e) {
            logger.warn("get project " + svnId + " info from svn error, " + e.getMessage());
        }
        return svnProjectInfo;

    }

    public List<CodeSourceInfo.ProjectInfo> getGitlabProjectInfos() {
        List<CodeSourceInfo.ProjectInfo> projectInfos = new LinkedList<>();
        Collection entries = listEntries("");
        if (entries == null) {
            return projectInfos;
        }
        for (Object entry1 : entries) {
            SVNDirEntry entry = (SVNDirEntry) entry1;
            CodeSourceInfo.ProjectInfo info = new CodeSourceInfo.ProjectInfo();
            info.setAccessLevel(null);
            info.setCreateTime(entry.getDate().getTime());
            info.setDescription(entry.getCommitMessage());
            info.setHttpUrl(entry.getURL().toString());
            info.setNameWithNamespace(entry.getName());
            info.setProjectId(svnId);
            projectInfos.add(info);
        }
        return projectInfos;
    }

    public Collection listEntries(String path) {
        Collection entries = null;
        try {
            entries = repository.getDir(path, -1, null, (Collection) null);
        } catch (SVNException e) {
            logger.warn("list project " + svnId + " entries from svn error, " + e.getMessage());
        }
        return entries;
    }

    public int setDeployKey(int projectId, String title, String key) {
        return 0;
    }

    public CommitInformation getCommitInfo(int svnId, String path) {
        initWithsvnId(svnId);
        init();
        CommitInformation info = new CommitInformation();
        try {
            SVNDirEntry entry = repository.info(path, -1);
            Collection logEntries = repository.log(new String[]{path}, null, 0, -1, true, true);
            Iterator entries = logEntries.iterator();
            if (entries.hasNext()) {
                SVNLogEntry logEntry = (SVNLogEntry) entries.next();
                info.setId(name);
                info.setMessage(logEntry.getMessage());
                info.setCreatedAt(logEntry.getDate().getTime());
            } else {
                return null;
            }
            info.setAuthorEmail(null);
            info.setAuthorName(entry.getAuthor());
        } catch (SVNException e) {
            logger.warn("get project " + svnId + " commit info from svn error, " + e.getMessage());
        }
        return info;
    }

    public CommitInformation getTagCommitInfo(int projectId, String tag) {
        return getCommitInfo(projectId, "tags/" + tag);

    }

    public CommitInformation getBranchCommitInfo(int projectId, String branch) {
        return getCommitInfo(projectId, "branches/" + branch);

    }

    public boolean checkDeployKey(int projectId, int deployKeyId) {
        return false;
    }

    public byte[] getReadme(int projectId, String branch) {
        initWithsvnId(projectId);
        init();
        Collection entries = listEntries("branches/" + branch);
        for (Object entry1 : entries) {
            SVNDirEntry entry = (SVNDirEntry) entry1;
            if (entry.getName().equalsIgnoreCase("readme.md")) {
                return getFile(entry.getRelativePath());
            }
        }
        return null;
    }

    public List<String> getBranches(int projectId) {
        initWithsvnId(projectId);
        init();
        Collection entries = listEntries("branches");
        List<String> branches = new LinkedList<>();
        for (Object entry1 : entries) {
            SVNDirEntry entry = (SVNDirEntry) entry1;
            branches.add(entry.getName());
        }
        return branches;
    }

    public byte[] getDockerfile(int projectId, String ref, String fileName) {

        initWithsvnId(projectId);
        init();
        if (fileName == null) {
            return null;
        }
        return (ref == null) ? getFile(fileName) : getFile(ref + "/" + fileName);
    }

    @Override
    public void deleteDeployKeys(int projectId) {

    }

    @Override
    public List<String> getTags(int codeId) {
        // TODO: add get tags here
        return null;
    }

    @Override
    public boolean checkProjectPermission(int projectIdInGitlab) {
        return false;
    }

    public byte[] getFile(String path) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try {
            repository.getFile(path, -1, null, baos);
        } catch (SVNException e) {
            return null;
        }
        return baos.toByteArray();
    }

    public RSAKeyPair getDeployKey(int projectId) {
        return null;
    }

}



