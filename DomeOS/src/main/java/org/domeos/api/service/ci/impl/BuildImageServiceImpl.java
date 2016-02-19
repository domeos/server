package org.domeos.api.service.ci.impl;

import org.domeos.api.model.ci.BuildImage;
import org.domeos.api.service.ci.BuildImageService;
import org.domeos.api.service.global.GlobalService;
import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.basemodel.ResultStat;
import org.domeos.shiro.AuthUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * Created by feiliu206363 on 2015/8/26.
 */
@Service("buildImageService")
public class BuildImageServiceImpl implements BuildImageService {
    @Autowired
    GlobalService globalService;

    @Override
    public HttpResponseTemp<?> getBuildImage() {
        if (!AuthUtil.isAdmin()) {
            return ResultStat.FORBIDDEN.wrap(null, "only admin can do this");
        }
        return ResultStat.OK.wrap(globalService.getBuildImage());
    }

    @Override
    public HttpResponseTemp<?> setBuildImage(BuildImage buildImage) {
        if (!AuthUtil.isAdmin()) {
            return ResultStat.FORBIDDEN.wrap(null, "only admin can do this");
        }
        if (buildImage == null) {
            return ResultStat.PARAM_ERROR.wrap(null, "build image info is null");
        }
        globalService.deleteBuildImage();
        buildImage.setLastUpdate(System.currentTimeMillis());
        globalService.setBuildImage(buildImage);
        return ResultStat.OK.wrap(buildImage);
    }
}
