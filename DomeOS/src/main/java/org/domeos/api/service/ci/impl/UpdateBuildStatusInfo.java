package org.domeos.api.service.ci.impl;

import org.domeos.api.mapper.ci.BuildMapper;
import org.domeos.api.mapper.ci.KubeBuildMapper;
import org.domeos.api.model.ci.BuildInfo;
import org.domeos.api.model.ci.KubeBuild;
import org.domeos.client.kubernetesclient.util.PodBriefStatus;
import org.domeos.job.JobWrapper;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

import static org.domeos.client.kubernetesclient.util.PodBriefStatus.Unknow;

/**
 * Created by feiliu206363 on 2015/12/4.
 */
public class UpdateBuildStatusInfo {
    static KubeBuildMapper kubeBuildMapper;
    static BuildMapper buildMapper;

    @Autowired
    public void setKubeBuildMapper(KubeBuildMapper kubeBuildMapper) {
        UpdateBuildStatusInfo.kubeBuildMapper = kubeBuildMapper;
    }

    @Autowired
    public void setBuildMapper(BuildMapper buildMapper) {
        UpdateBuildStatusInfo.buildMapper = buildMapper;
    }

    public static List<BuildInfo> updateStatusInfos(List<BuildInfo> buildInfos) throws Exception {
        if (buildInfos != null) {
            JobWrapper jobWrapper = new JobWrapper().init();
            for (BuildInfo buildInfo : buildInfos) {
                if (buildInfo.getStatus().equals(BuildInfo.StatusType.Success) || buildInfo.getStatus().equals(BuildInfo.StatusType.Fail)) {
                    continue;
                }
                update(jobWrapper, buildInfo);
            }
        }
        return buildInfos;
    }

    public static BuildInfo updateBuildInfo(BuildInfo buildInfo) throws Exception {
        if (buildInfo != null) {
            JobWrapper jobWrapper = new JobWrapper().init();
            if (buildInfo.getStatus().equals(BuildInfo.StatusType.Success) || buildInfo.getStatus().equals(BuildInfo.StatusType.Fail)) {
                return buildInfo;
            }
            update(jobWrapper, buildInfo);
        }
        return buildInfo;
    }

    private static BuildInfo update(JobWrapper jobWrapper, BuildInfo buildInfo) {
        KubeBuild kubeBuild = kubeBuildMapper.getKubeBuildByBuildId(buildInfo.getId());
        if (kubeBuild == null) {
            return buildInfo;
        }
        PodBriefStatus status = jobWrapper.fetchJobStatus(buildInfo.getId());
        if (status == null) {
            buildMapper.updateStatusByBuildId(buildInfo.getId(), BuildInfo.StatusType.Fail);
            kubeBuildMapper.updateKubeBuildStatusByBuildId(kubeBuild.setJobStatus(Unknow.name()));
            buildInfo.setStatus(BuildInfo.StatusType.Fail);
            return buildInfo;
        }
        switch (status) {
            case SuccessRunning:
                buildMapper.updateStatusByBuildId(buildInfo.getId(), BuildInfo.StatusType.Building);
                kubeBuildMapper.updateKubeBuildStatusByBuildId(kubeBuild.setJobStatus(status.name()));
                buildInfo.setStatus(BuildInfo.StatusType.Building);
                break;
            case FailedTerminated:
                buildMapper.updateStatusByBuildId(buildInfo.getId(), BuildInfo.StatusType.Fail);
                kubeBuildMapper.updateKubeBuildStatusByBuildId(kubeBuild.setJobStatus(status.name()));
                buildInfo.setStatus(BuildInfo.StatusType.Fail);
                break;
            case SuccessTerminated:
                buildMapper.updateStatusByBuildId(buildInfo.getId(), BuildInfo.StatusType.Fail);
                kubeBuildMapper.updateKubeBuildStatusByBuildId(kubeBuild.setJobStatus(status.name()));
                buildInfo.setStatus(BuildInfo.StatusType.Fail);
                break;
            case Unknow:
                buildMapper.updateStatusByBuildId(buildInfo.getId(), BuildInfo.StatusType.Fail);
                buildInfo.setStatus(BuildInfo.StatusType.Fail);
                break;
            default:
                kubeBuildMapper.updateKubeBuildStatusByBuildId(kubeBuild.setJobStatus(status.name()));
        }
        return buildInfo;
    }
}
