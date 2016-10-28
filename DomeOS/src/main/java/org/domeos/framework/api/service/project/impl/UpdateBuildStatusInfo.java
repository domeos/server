package org.domeos.framework.api.service.project.impl;


import org.domeos.framework.api.biz.image.ImageBiz;
import org.domeos.framework.api.biz.project.ProjectBiz;
import org.domeos.framework.api.model.ci.BuildHistory;
import org.domeos.framework.api.model.ci.related.BuildState;
import org.domeos.framework.api.model.image.BaseImageCustom;
import org.domeos.framework.engine.k8s.JobWrapper;
import org.domeos.framework.engine.k8s.util.PodBriefStatus;
import org.domeos.framework.engine.model.JobType;
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
                if (BuildState.Success.name().equals(buildInfo.getState()) || BuildState.Fail.name().equals(buildInfo.getState())) {
                    continue;
                }
                update(jobWrapper, buildInfo);
            }
        }
        return buildInfos;
    }

//    public static BuildHistory updateBuildHistory(BuildHistory buildInfo) throws Exception {
//        if (buildInfo != null) {
//            JobWrapper jobWrapper = new JobWrapper().init();
//            if (buildInfo.getState().equals(BuildState.Success.name()) || buildInfo.getState().equals(BuildState.Fail.name())) {
//                return buildInfo;
//            }
//            update(jobWrapper, buildInfo);
//        }
//        return buildInfo;
//    }

    public static List<BaseImageCustom> updateBaseImageCustoms(List<BaseImageCustom> baseImageCustoms) throws Exception {
        if (baseImageCustoms != null) {
            JobWrapper jobWrapper = new JobWrapper().init();
            for (BaseImageCustom baseImageCustom : baseImageCustoms) {
                if (baseImageCustom.getState().equals(BuildState.Success.name()) || baseImageCustom.getState().equals(BuildState.Fail.name())) {
                    continue;
                }
                update(jobWrapper, baseImageCustom);
            }
        }
        return baseImageCustoms;
    }

    private static BuildHistory update(JobWrapper jobWrapper, BuildHistory buildInfo) {
        /*
        KubeBuild kubeBuild = kubeBuildMapper.getKubeBuildByBuildIDandJobType(buildInfo.getId(), KubeBuild.KubeBuildType.PROJECT.getType());
        if (kubeBuild == null) {
            return buildInfo;
        }*/

        PodBriefStatus status = jobWrapper.fetchJobStatus(buildInfo.getId(), JobType.PROJECT);
        if (status == null) {
            projectBiz.setHistoryStatus(buildInfo.getId(), BuildState.Fail);
            buildInfo.setState(BuildState.Fail.name());
            return buildInfo;
        }
        switch (status) {
            case SuccessRunning:
                buildInfo.setState(BuildState.Building.name());
                projectBiz.setHistoryStatus(buildInfo.getId(), BuildState.Building);
                break;
            case FailedTerminated:
                buildInfo.setState(BuildState.Fail.name());
                projectBiz.setHistoryStatus(buildInfo.getId(), BuildState.Fail);
                break;
            case SuccessTerminated:
                buildInfo.setState(BuildState.Fail.name());
                projectBiz.setHistoryStatus(buildInfo.getId(), BuildState.Fail);
                break;
            case Unknow:
                buildInfo.setState(BuildState.Fail.name());
                projectBiz.setHistoryStatus(buildInfo.getId(), BuildState.Fail);
                break;
        }
        return buildInfo;
    }

    private static BaseImageCustom update(JobWrapper jobWrapper, BaseImageCustom buildInfo) {
        /*KubeBuild kubeBuild = kubeBuildMapper.getKubeBuildByBuildIDandJobType(buildInfo.getId(), KubeBuild.KubeBuildType.BASEIMAGE.getType());
        if (kubeBuild == null) {
            return buildInfo;
        }*/

        PodBriefStatus status = jobWrapper.fetchJobStatus(buildInfo.getId(), JobType.BASEIMAGE);
        if (status == null) {
            imageBiz.updateStatusById(buildInfo.getId(), BuildState.Fail.name());
            buildInfo.setState(BuildState.Fail.name());
            return buildInfo;
        }
        switch (status) {
            case SuccessRunning:
                imageBiz.updateStatusById(buildInfo.getId(), BuildState.Building.name());
                buildInfo.setState(BuildState.Building.name());
                break;
            case FailedTerminated:
                imageBiz.updateStatusById(buildInfo.getId(), BuildState.Fail.name());
                buildInfo.setState(BuildState.Fail.name());
                break;
            case SuccessTerminated:
                imageBiz.updateStatusById(buildInfo.getId(), BuildState.Fail.name());
                buildInfo.setState(BuildState.Fail.name());
                break;
            case Unknow:
                imageBiz.updateStatusById(buildInfo.getId(), BuildState.Fail.name());
                buildInfo.setState(BuildState.Fail.name());
                break;
        }
        return buildInfo;
    }
}
