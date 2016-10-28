package org.domeos.framework.api.consolemodel.deployment;

import org.apache.commons.lang3.StringUtils;
import org.domeos.framework.api.model.deployment.related.HealthChecker;
import org.domeos.framework.api.model.deployment.related.ImagePullPolicy;
import org.domeos.framework.api.model.deployment.related.LogItemDraft;
import org.domeos.util.CommonUtil;

import java.util.List;

/**
 */
public class ContainerDraft {
    private String registry;
    private String image;
    private String tag;
    private double cpu;
    private double mem;
    private ImagePullPolicy imagePullPolicy;
    private List<EnvDraft> envs;
    private List<EnvDraft> envCheckers;
    private HealthChecker healthChecker;
    private List<LogItemDraft> logItemDrafts;

    public String getRegistry() {
        return registry;
    }

    public void setRegistry(String registry) {
        // we need full url here
        this.registry = CommonUtil.fullUrl(registry);
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }

    public String getTag() {
        return tag;
    }

    public void setTag(String tag) {
        this.tag = tag;
    }

    public List<EnvDraft> getEnvs() {
        return envs;
    }

    public void setEnvs(List<EnvDraft> envs) {
        this.envs = envs;
    }

    public double getCpu() {
        return cpu;
    }

    public void setCpu(double cpu) {
        this.cpu = cpu;
    }

    public double getMem() {
        return mem;
    }

    public void setMem(double mem) {
        this.mem = mem;
    }

    public ImagePullPolicy getImagePullPolicy() {
        if (imagePullPolicy == null) {
            return ImagePullPolicy.Always;
        } else {
            return imagePullPolicy;
        }
    }

    public ContainerDraft setImagePullPolicy(ImagePullPolicy imagePullPolicy) {
        this.imagePullPolicy = imagePullPolicy;
        return this;
    }

    public List<EnvDraft> getEnvCheckers() {
        return envCheckers;
    }

    public void setEnvCheckers(List<EnvDraft> envCheckers) {
        this.envCheckers = envCheckers;
    }

    public HealthChecker getHealthChecker() {
        return healthChecker;
    }

    public void setHealthChecker(HealthChecker healthChecker) {
        this.healthChecker = healthChecker;
    }

    public List<LogItemDraft> getLogItemDrafts() {
        return logItemDrafts;
    }

    public void setLogItemDrafts(List<LogItemDraft> logItemDrafts) {
        this.logItemDrafts = logItemDrafts;
    }

    public String checkLegality() {
        String error;
        if (StringUtils.isBlank(image)) {
            return "image empty";
        } else if (StringUtils.isBlank(tag)) {
            return "tag empty";
        } else if (cpu < 0 || mem < 0) {
            return "cpu or mem is negative";
        } else if (imagePullPolicy == null) {
            imagePullPolicy = ImagePullPolicy.Always;
        } else {
            if (envs != null) {
                for (EnvDraft envDraft : envs) {
                    error = envDraft.checkLegality();
                    if (!StringUtils.isBlank(error)) {
                        return error;
                    }
                }
            }
            if (logItemDrafts != null && logItemDrafts.size() > 0) {
                for (LogItemDraft logItemDraft : logItemDrafts) {
                    error = logItemDraft.checkLegality();
                    if (!StringUtils.isBlank(error)) {
                        return error;
                    }
                }
            }
        }

        return null;
    }

    // combine "http://private.registry.com" and "domeos/zookeeper" to "private.registry.com/domeos/zookeeper"
    public String formatImage() {
        String newRegistry = CommonUtil.domainUrl(registry);
        if (newRegistry == null) {
            return this.image;
        }
        return CommonUtil.domainUrl(registry) + "/" + this.image;
    }
}
