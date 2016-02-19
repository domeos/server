package org.domeos.api.service.deployment.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.commons.lang3.StringUtils;
import org.domeos.api.model.deployment.Version;
import org.domeos.api.model.deployment.VersionDetail;
import org.domeos.api.model.deployment.VersionInfo;
import org.domeos.api.model.resource.ResourceType;
import org.domeos.api.model.user.OperationType;
import org.domeos.api.service.deployment.DeploymentBiz;
import org.domeos.api.service.deployment.VersionBiz;
import org.domeos.api.service.deployment.VersionService;
import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.basemodel.ResultStat;
import org.domeos.shiro.AuthUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

/**
 */
@Service("versionService")
public class VersionServiceImpl implements VersionService {

    @Autowired
    ObjectMapper objectMapper;

    @Autowired
    VersionBiz versionBiz;

    @Autowired
    DeploymentBiz deploymentBiz;

    @Override
    public HttpResponseTemp<?> createVersion(Version version, long deployId, long userId) throws Exception {
        if (!AuthUtil.verify(userId, deployId, ResourceType.DEPLOY, OperationType.MODIFY)) {
            return ResultStat.FORBIDDEN.wrap(null);
        }

        if (deployId < 1) {
            return ResultStat.DEPLOYMENT_NOT_LEGAL.wrap(null, "deployId is illegal");
        }

        String versionLegality = version.checkLegality();
        if (!StringUtils.isBlank(versionLegality)) {
            return ResultStat.DEPLOYMENT_NOT_LEGAL.wrap(null, versionLegality);
        }
        return ResultStat.OK.wrap(versionBiz.createVersion(version));
    }

    @Override
    public HttpResponseTemp<VersionDetail> getVersionDetail(long deployId, long versionId, long userId) throws IOException {
        if (!AuthUtil.verify(userId, deployId, ResourceType.DEPLOY, OperationType.GET)) {
            return ResultStat.FORBIDDEN.wrap(null);
        }

        if ( !versionBiz.versionExist(deployId, versionId) ) {
            return ResultStat.VERSION_NOT_EXIST.wrap(null, "version not exist");
        }

        VersionDetail versionDetail = versionBiz.buildVersionDetail(deployId, versionId);
        return ResultStat.OK.wrap(versionDetail);
    }

    @Override
    public HttpResponseTemp<List<VersionInfo>> listVersions(long deployId, long userId) throws IOException {
        if (!AuthUtil.verify(userId, deployId, ResourceType.DEPLOY, OperationType.GET)) {
            return ResultStat.FORBIDDEN.wrap(null);
        }

        List<Version> versions = versionBiz.listVersions(deployId);
        if (versions == null) {
            return ResultStat.OK.wrap(null);
        }

        List<VersionInfo> versionInfos = new ArrayList<>(versions.size());
        for (Version version : versions) {
            VersionInfo versionInfo = new VersionInfo(version);
            versionInfos.add(versionInfo);
        }

        // sort by version Id
        Collections.sort(versionInfos, new Comparator<VersionInfo>() {
            @Override
            public int compare(VersionInfo o1, VersionInfo o2) {
                return ((Long)o2.getVersion()).compareTo(o1.getVersion());
            }
        });

        return ResultStat.OK.wrap(versionInfos);
    }

}
