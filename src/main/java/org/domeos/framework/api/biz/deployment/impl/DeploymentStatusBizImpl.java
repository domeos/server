package org.domeos.framework.api.biz.deployment.impl;

import org.domeos.framework.api.biz.base.impl.BaseBizImpl;
import org.domeos.framework.api.biz.deployment.DeploymentStatusBiz;
import org.domeos.framework.api.model.deployment.related.DeploymentStatus;
import org.domeos.global.GlobalConstant;
import org.springframework.stereotype.Repository;

/**
 * Created by sparkchen on 16/4/6.
 */

@Repository
public class DeploymentStatusBizImpl extends BaseBizImpl implements DeploymentStatusBiz {

    @Override
    public DeploymentStatus getDeploymentStatus(int deployId) {
        return DeploymentStatus.valueOf(super.getState(GlobalConstant.DEPLOY_TABLE_NAME, deployId));
    }

    @Override
    public void setDeploymentStatus(int deployId, DeploymentStatus status) {
        super.updateState(GlobalConstant.DEPLOY_TABLE_NAME, status.name(), deployId);
    }
}
