package org.domeos.framework.api.model.project.related;

import org.domeos.util.StringUtils;
import org.domeos.framework.api.model.image.ExclusiveImage;
import org.domeos.global.GlobalConstant;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by feiliu206363 on 2016/4/4.
 */


public class ExclusiveBuild {
    ExclusiveBuildType customType;
    ExclusiveImage compileImage;
    ExclusiveImage runImage;
    List<String> createdFileStoragePath;
    String runFileStoragePath;
    String installCmd;
    String codeStoragePath;
    String compileEnv;
    String compileCmd;
    String workDir;
    String startCmd;
    String user;

    public String getCustomType() {
        return customType.name().toLowerCase();
    }

    public void setCustomType(String customType) {
        this.customType = ExclusiveBuildType.valueOf(customType.toUpperCase());
    }

    public ExclusiveImage getCompileImage() {
        return compileImage;
    }

    public void setCompileImage(ExclusiveImage compileImage) {
        this.compileImage = compileImage;
    }

    public ExclusiveImage getRunImage() {
        return runImage;
    }

    public void setRunImage(ExclusiveImage runImage) {
        this.runImage = runImage;
    }

    public List<String> getCreatedFileStoragePath() {
        return createdFileStoragePath;
    }

    public void setCreatedFileStoragePath(List<String> createdFileStoragePath) {
        this.createdFileStoragePath = createdFileStoragePath;
    }

    public String getRunFileStoragePath() {
        return runFileStoragePath;
    }

    public void setRunFileStoragePath(String runFileStoragePath) {
        this.runFileStoragePath = runFileStoragePath;
    }

    public String getInstallCmd() {
        return installCmd;
    }

    public void setInstallCmd(String installCmd) {
        this.installCmd = installCmd;
    }

    public String getCodeStoragePath() {
        return codeStoragePath;
    }

    public void setCodeStoragePath(String codeStoragePath) {
        this.codeStoragePath = codeStoragePath;
    }

    public String getCompileEnv() {
        return compileEnv;
    }

    public void setCompileEnv(String compileEnv) {
        this.compileEnv = compileEnv;
    }

    public String getCompileCmd() {
        return compileCmd;
    }

    public void setCompileCmd(String compileCmd) {
        this.compileCmd = compileCmd;
    }

    public String getWorkDir() {
        return workDir;
    }

    public void setWorkDir(String workDir) {
        this.workDir = workDir;
    }

    public String getStartCmd() {
        return startCmd;
    }

    public void setStartCmd(String startCmd) {
        this.startCmd = startCmd;
    }

    public String getUser() {
        return user;
    }

    public void setUser(String user) {
        this.user = user;
    }

    public ExclusiveBuild() {
    }

    public String checkLegality() {
        if (compileImage == null || !StringUtils.isBlank(compileImage.checkLegality())) {
            return "compile image must be set";
        } else if (runImage == null || !StringUtils.isBlank(runImage.checkLegality())) {
            return "run image must be set";
        } else if (createdFileStoragePath.size() == 0) {
            return "created file storage path must be set";
        } else if (createdFileStoragePath.size() > 0) {
            List<String> modifiedPath = new ArrayList<>(createdFileStoragePath.size());
            for (String path : createdFileStoragePath) {
                if (!path.startsWith(("/"))) {
                    return "created file " + path + "is illegal";
                }
                if (path.split("/").length == 0) {
                    return "created file " + path + "is illegal";
                }
                modifiedPath.add(path);
            }
            setCreatedFileStoragePath(modifiedPath);
        } else if (StringUtils.isBlank(runFileStoragePath)) {
            return "run file storage path must be set";
        } else if (!runFileStoragePath.endsWith("/")) {
            setRunFileStoragePath(runFileStoragePath + "/");
        } else if (StringUtils.isBlank(compileCmd)) {
            return "compile command must be set";
        } else if (StringUtils.isBlank(startCmd)) {
            return "start command must be set";
        } else if (StringUtils.isBlank(workDir)) {
            workDir = GlobalConstant.BUILD_CODE_PATH;
        }
        return null;

    }
}
