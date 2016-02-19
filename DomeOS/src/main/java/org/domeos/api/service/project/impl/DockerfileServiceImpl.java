package org.domeos.api.service.project.impl;

import org.apache.commons.lang3.StringUtils;
import org.domeos.api.mapper.project.DockerfileMapper;
import org.domeos.api.mapper.project.ProjectBasicMapper;
import org.domeos.api.model.project.Dockerfile;
import org.domeos.api.service.project.DockerfileService;
import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.basemodel.ResultStat;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * Created by feiliu206363 on 2015/11/12.
 */
@Service("dockerfileService")
public class DockerfileServiceImpl implements DockerfileService {
    @Autowired
    DockerfileMapper dockerfileMapper;

    @Autowired
    ProjectBasicMapper projectBasicMapper;

    @Override
    public HttpResponseTemp<?> createDockerfile(Dockerfile dockerfile, String projectName) {
        if (dockerfile == null || StringUtils.isBlank(projectName)) {
            return ResultStat.PARAM_ERROR.wrap(null, "blank info");
        }

        int basicId = projectBasicMapper.getProjectBasicIdByName(projectName);

        if (basicId < 0) {
            return ResultStat.PROJECT_NOT_EXIST.wrap(null);
        }

        dockerfile.setProjectId(basicId);
        dockerfile.setCreateTime(System.currentTimeMillis());

        return ResultStat.OK.wrap(dockerfileMapper.addDockerfile(dockerfile));
    }

    @Override
    public HttpResponseTemp<?> modifyDockerfile(Dockerfile dockerfile) {
        if (dockerfile == null) {
            return ResultStat.PARAM_ERROR.wrap(null, "blank info");
        }

        return ResultStat.OK.wrap(dockerfileMapper.updateDockerfile(dockerfile));
    }

    @Override
    public HttpResponseTemp<?> deleteDockerfile(int id) {
        return ResultStat.OK.wrap(dockerfileMapper.deleteDockerfile(id));
    }

    @Override
    public HttpResponseTemp<?> getDockerfile(int projectId) {
        return ResultStat.OK.wrap(dockerfileMapper.getDockerfileByProjectBasicId(projectId));
    }
}
