package org.domeos.framework.api.biz.loadBalancer;

import org.domeos.framework.api.biz.base.BaseBiz;
import org.domeos.framework.api.model.LoadBalancer.LoadBalancer;
import org.domeos.framework.engine.exception.DaoException;

import java.util.List;

/**
 * Created by xupeng on 16-4-7.
 */
public interface LoadBalancerBiz extends BaseBiz{

    List<LoadBalancer> getLBSByDeploy(int deployId);

    void insertLoadBalancers(int deployId, List<LoadBalancer> loadBalancers) throws DaoException;

    void deleteLBSByDeploy(int deployId);
}
