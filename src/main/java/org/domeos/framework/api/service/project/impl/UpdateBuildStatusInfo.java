package org.domeos.framework.api.service.project.impl;


import org.domeos.framework.api.biz.image.ImageBiz;
import org.domeos.framework.api.biz.project.ProjectBiz;
import org.domeos.framework.api.model.ci.BuildHistory;
import org.domeos.framework.api.model.ci.related.BuildState;
import org.domeos.framework.engine.k8s.JobWrapper;
import org.domeos.framework.engine.model.JobType;
import org.domeos.util.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Created by feiliu206363 on 2015/12/4.
 */
@Component
public class UpdateBuildStatusInfo {
    static ProjectBiz projectBiz;
    static ImageBiz imageBiz;

    @Autowired
    public void setProjectBiz(ProjectBiz projectBiz) {
        UpdateBuildStatusInfo.projectBiz = projectBiz;
    }

    @Autowired
    public void setImageBiz(ImageBiz imageBiz) {
        UpdateBuildStatusInfo.imageBiz = imageBiz;
    }

    public static List<BuildHistory> updateStatusInfos(List<BuildHistory> buildInfos) throws Exception {
        if (buildInfos != null) {
            JobWrapper jobWrapper = new JobWrapper().init();
            for (BuildHistory buildInfo : buildInfos) {
                if (BuildState.Success.name().equals(buildInfo.getState()) || BuildState.Stopped.name().equals(buildInfo.getState())
                        || BuildState.Fail.name().equals(buildInfo.getState())) {
                    continue;
                }
                update(jobWrapper, buildInfo);
            }
        }
        return buildInfos;
    }

    private static BuildHistory update(JobWrapper jobWrapper, BuildHistory buildInfo) {
        String status = jobWrapper.fetchJobStatus(buildInfo.getId(), JobType.PROJECT);
        if (StringUtils.isBlank(status)) {
            buildInfo.setState(BuildState.Preparing.name());
            projectBiz.setHistoryStatus(buildInfo.getId(), BuildState.Preparing);
        } else {
            buildInfo.setState(BuildState.Building.name());
            projectBiz.setHistoryStatus(buildInfo.getId(), BuildState.Building);
        }
        buildInfo.setFinishTime(System.currentTimeMillis());
        return buildInfo;
    }
}
