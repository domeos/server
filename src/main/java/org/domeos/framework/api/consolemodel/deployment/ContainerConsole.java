package org.domeos.framework.api.consolemodel.deployment;

import org.domeos.framework.api.model.deployment.related.HealthChecker;
import org.domeos.util.StringUtils;

import java.util.List;
import java.util.Map;

/**
 * Created by feiliu206363 on 2017/3/6.
 */
public class ContainerConsole extends ContainerDraft {
    private List<VolumeMountConsole> volumeMountConsoles;
    private List<VolumeMountConsole> configConsoles;

    public List<VolumeMountConsole> getVolumeMountConsoles() {
        return volumeMountConsoles;
    }

    public ContainerConsole setVolumeMountConsoles(List<VolumeMountConsole> volumeMountConsoles) {
        this.volumeMountConsoles = volumeMountConsoles;
        return this;
    }

    public List<VolumeMountConsole> getConfigConsoles() {
        return configConsoles;
    }

    public ContainerConsole setConfigConsoles(List<VolumeMountConsole> configConsoles) {
        this.configConsoles = configConsoles;
        return this;
    }

    public ContainerConsole fillWithContainerDraft(ContainerDraft containerDraft) {
        setRegistry(containerDraft.getRegistry());
        setImage(containerDraft.getImage());
        setTag(containerDraft.getTag());
        setMem(containerDraft.getMem());
        setCpu(containerDraft.getCpu());
        setImagePullPolicy(containerDraft.getImagePullPolicy());
        setEnvs(containerDraft.getEnvs());
        setEnvCheckers(containerDraft.getEnvCheckers());
        setHealthChecker(containerDraft.getHealthChecker());
        if (containerDraft.getReadinessChecker() == null) {
            setReadinessChecker(new HealthChecker());
        } else {
            setReadinessChecker(containerDraft.getReadinessChecker());
        }
        setLogItemDrafts(containerDraft.getLogItemDrafts());
        setAutoDeploy(containerDraft.isAutoDeploy());
        setVolumeMountDrafts(containerDraft.getVolumeMountDrafts());
        setCommands(containerDraft.getCommands());
        setArgs(containerDraft.getArgs());
        return this;
    }

    public String checkLegality() {
        String error = super.checkLegality();
        if (error != null) {
            return error;
        }
        if (configConsoles != null && configConsoles.size() > 0 ) {
            for (VolumeMountConsole console : configConsoles) {
                if (console.getVolumeConfigMap() != null && console.getVolumeConfigMap().getIterms() != null) {
                    if (!StringUtils.isBlank(console.checkLegality())) {
                        return console.checkLegality();
                    }
                    if (StringUtils.isBlank(console.getContainerPath())) {
                        return "path in container must be set!";
                    }
                    for (Map.Entry<String, String> entry : console.getVolumeConfigMap().getIterms().entrySet()) {
                        if (StringUtils.isBlank(entry.getKey())) {
                            return "key of config map must be set.";
                        }
                        if (!StringUtils.isBlank(entry.getValue()) && entry.getValue().startsWith("/")) {
                            return "config map iterms must be a relative path";
                        }
                    }
                }
            }
        }
        if (volumeMountConsoles != null && volumeMountConsoles.size() > 0) {
            for (VolumeMountConsole console : volumeMountConsoles) {
                if (!StringUtils.isBlank(console.checkLegality())) {
                    return console.checkLegality();
                }
                if (StringUtils.isBlank(console.getContainerPath())) {
                    return "path in container must be set!";
                }
            }
        }
        return null;
    }
}