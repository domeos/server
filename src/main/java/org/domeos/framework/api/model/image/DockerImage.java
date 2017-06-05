package org.domeos.framework.api.model.image;

import org.domeos.framework.api.consolemodel.deployment.EnvDraft;

import java.util.Comparator;
import java.util.List;

/**
 * Created by feiliu206363 on 2015/12/16.
 */
public class DockerImage {

    private int projectId;
    private String registry;
    private String imageName;
    private String tag;
    private List<EnvDraft> envSettings;
    private long createTime;

    public DockerImage() {
    }

    public DockerImage(String registry, String imageName, String tag, long createTime) {
        this.registry = registry;
        this.imageName = imageName;
        this.tag = tag;
        this.createTime = createTime;
    }

    public DockerImage(int projectId, String registry, String imageName, String tag, List<EnvDraft> envSettings, long createTime) {
        this.registry = registry;
        this.projectId = projectId;
        this.imageName = imageName;
        this.tag = tag;
        this.envSettings = envSettings;
        this.createTime = createTime;
    }

    public int getProjectId() {
        return projectId;
    }

    public void setProjectId(int projectId) {
        this.projectId = projectId;
    }

    public String getRegistry() {
        return registry;
    }

    public void setRegistry(String registry) {
        this.registry = registry;
    }

    public String getImageName() {
        return imageName;
    }

    public void setImageName(String imageName) {
        this.imageName = imageName;
    }

    public String getTag() {
        return tag;
    }

    public void setTag(String tag) {
        this.tag = tag;
    }

    public long getCreateTime() {
        return createTime;
    }

    public void setCreateTime(long createTime) {
        this.createTime = createTime;
    }

    public List<EnvDraft> getEnvSettings() {
        return envSettings;
    }

    public void setEnvSettings(List<EnvDraft> envSettings) {
        this.envSettings = envSettings;
    }

    public static class DockerImageComparator implements Comparator<DockerImage> {
        @Override
        public int compare(DockerImage t1, DockerImage t2) {
            if (t2.getCreateTime() - t1.getCreateTime() > 0) {
                return 1;
            } else if (t2.getCreateTime() - t1.getCreateTime() < 0) {
                return -1;
            } else {
                return 0;
            }
        }
    }

    @Override
    public int hashCode() {
        return 0;
    }

    @Override
    public boolean equals(Object other) {
        if (this == other) {
            return true;
        }
        if (other.getClass() == DockerImage.class) {
            DockerImage dockerImage = (DockerImage) other;
            if (this.imageName.equals(dockerImage.getImageName())) {
                if (this.registry != null && this.registry.equals(dockerImage.getRegistry())) {
                    if (this.tag != null && this.tag.equals(dockerImage.getTag())) {
                        return true;
                    } else if (this.tag == null && dockerImage.getTag() == null) {
                        return true;
                    }
                }
            }
            return false;
        } else {
            return false;
        }
    }
}
