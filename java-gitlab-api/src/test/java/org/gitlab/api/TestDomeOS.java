package org.gitlab.api;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.gitlab.api.models.*;
import org.junit.Before;
import org.junit.Ignore;
import org.junit.Test;

import java.io.IOException;
import java.util.List;

/**
 * Created by Administrator on 2016/10/28.
 */
@Ignore
public class TestDomeOS {
    GitlabAPI api;

    private static final String TEST_URL = System.getProperty("TEST_URL", "http://code.sohuno.com");
    private static final String TEST_TOKEN = System.getProperty("TEST_TOKEN", "E5nHzziCYs7G9Q8TjDSK");

    private static int projectId = 4229;
    private static GitlabProjectHook hook;
    private static int deployKeyId;

    private static ObjectMapper mapper;

    @Before
    public void setup() throws IOException {
        api = GitlabAPI.connect(TEST_URL, TEST_TOKEN).ignoreCertificateErrors(true);
        mapper = new ObjectMapper();
        mapper.setSerializationInclusion(JsonInclude.Include.NON_NULL);
        mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
    }

    @Test
    public void getProjects() {
        try {
            List<GitlabProject> projects = api.getProjects();
            if (projects != null) {
                System.out.println(mapper.writeValueAsString(projects));
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    @Test
    public void getProjectTags() {
        try {
            List<GitlabTag> tags = api.getTags(projectId);
            if (tags != null) {
                System.out.println(mapper.writeValueAsString(tags));
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    @Test
    public void setProjectHook() {
        boolean pushEvents = true;
        boolean tagPushEvents = true;
        String hookUrl = "http://test.hook";
        try {
            api.addProjectHook(projectId, hookUrl, pushEvents, false, false, tagPushEvents, false);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    @Test
    public void getProjectHook() {
        try {
            List<GitlabProjectHook> hooks = api.getProjectHooks(projectId);
            if (hooks != null) {
                for (GitlabProjectHook hook : hooks) {
                    System.out.println(mapper.writeValueAsString(hook));
                }
                hook = hooks.get(0);
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    @Test
    public void deleteProjectHook() {
        try {
            api.deleteProjectHook(hook);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    @Test
    public void getBranchCommitInfo() {
        try {
            GitlabBranch info = api.getBranch(projectId, "master");
            if (info != null) {
                System.out.println(mapper.writeValueAsString(info));
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    @Test
    public void setDeployKey() {
        try {
            GitlabSSHKey sshKey = api.createDeployKey(projectId, "test-gitlab", "ssh-rsa AAAAB3NzaC1yc2EAAAABIwAAAQEAlqe2zZalf8E0R2j6beMXI6o0hi1nIMFlNO+wc+uK1WFOIVLRJtjquAxTJd+MH7WSA+q60cKBCTecv4ACA3GOLN+PL2a8EDrRCiG8R22oxaKo4iz5yBJK7orCRjj5kJGaaro7s9M5qoiSZl43eWp6m4NGQtczuRqLSNgCn2pxvq5jVaXrf36xN4oi9YzDm3czfsECycwwpKesc4MzEz/LsuNG35dHmLnTEOL7T2X8F+Zsk8hoI4e4U60DVDMkdgxC5zuxAG4g8sY2w1WYdzlz/vLK9rHTLxB94INBdl3aPD77v9o9mdR44pEDSXKTGaXCC0P7EMrfSvqpAcEBOebn7Q== feiliu206363@sohu-inc.com");
            System.out.println(mapper.writeValueAsString(sshKey));
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    @Test
    public void getDeployKeys() {
        try {
            List<GitlabSSHKey> deployKeys = api.getDeployKeys(projectId);
            if (deployKeys != null) {
                System.out.println(mapper.writeValueAsString(deployKeys));
                deployKeyId = deployKeys.get(0).getId().intValue();
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    @Test
    public void deleteDeployKeys() {
        try {
            api.deleteDeployKey(projectId, deployKeyId);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    @Test
    public void getReadme() {
        GitlabProject project = new GitlabProject();
        project.setId(projectId);
        List<GitlabRepositoryTree> trees = null;
        try {
            trees = api.getRepositoryTree(project, null, null);
            if (trees != null) {
                for (GitlabRepositoryTree tree : trees) {
                    if (tree.getName().equalsIgnoreCase("readme.MD")) {
                        byte[] readme = api.getRawFileContent(project, "master", tree.getName());
                        System.out.println(new String(readme));
                    }
                }
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    @Test
    public void getBranches() {
        try {
            List<GitlabBranch> gitlabBranches = api.getBranches(projectId);
            if (gitlabBranches != null) {
                System.out.println(mapper.writeValueAsString(gitlabBranches));
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    @Test
    public void getDockerfile() {
        GitlabProject project = new GitlabProject();
        project.setId(projectId);
        try {
            byte[] dockerfile = api.getRawFileContent(project, "master", "src/dockerfile");
            System.out.println(new String(dockerfile));
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    @Test
    public void getToken() {

    }
}
