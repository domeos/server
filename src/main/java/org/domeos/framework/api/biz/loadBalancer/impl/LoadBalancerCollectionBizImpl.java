package org.domeos.framework.api.biz.loadBalancer.impl;

import java.util.ArrayList;
import java.util.List;

import org.domeos.framework.api.biz.base.impl.BaseBizImpl;
import org.domeos.framework.api.biz.loadBalancer.LoadBalancerCollectionBiz;
import org.domeos.framework.api.mapper.domeos.loadBalancer.LoadBalancerCollectionMapper;
import org.domeos.framework.api.model.loadBalancer.LoadBalancerCollection;
import org.domeos.framework.engine.exception.DaoConvertingException;
import org.domeos.global.GlobalConstant;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * Created by jackfan on 2017/2/27.
 */
@Service("loadBalancerCollectionBiz")
public class LoadBalancerCollectionBizImpl extends BaseBizImpl implements LoadBalancerCollectionBiz {
    
    @Autowired
    LoadBalancerCollectionMapper mapper;
    
    @Override
    public void createLoadBalancerCollection(LoadBalancerCollection lbc) {
        mapper.insertLoadBalancerCollection(lbc, lbc.toString());
    }

    @Override
    public void deleteLoadBalancerCollection(int lbcId) {
        super.removeById(LOADBALANCER_COLLECTION_NAME, lbcId);
    }

    @Override
    public void updateLoadBalancerCollection(LoadBalancerCollection lbc) {
        mapper.updateLoadBalancerCollection(lbc, lbc.toString());
    }

    @Override
    public LoadBalancerCollection getLoadBalancerCollection(int ldcId) {
        return super.getById(LOADBALANCER_COLLECTION_NAME, ldcId, LoadBalancerCollection.class);
    }

    @Override
    public List<LoadBalancerCollection> getLoadBalancerCollection(String name) {
        return super.getListByName(LOADBALANCER_COLLECTION_NAME, name, LoadBalancerCollection.class);
    }
    
    @Override
    public List<LoadBalancerCollection> listLoadBalancerCollectionIncludeRemovedByIdList(List<Integer> idList) {
        try {
            if (idList == null || idList.size() == 0) {
                return new ArrayList<>(1);
            }
            StringBuilder builder = new StringBuilder();
            builder.append(" ( ");
            for (int i = 0; i < idList.size(); i++) {
                builder.append(idList.get(i));
                if (i != idList.size() - 1) {
                    builder.append(" , ");
                }
            }
            builder.append(") ");
            return mapper.listLoadBalancerCollectionIncludeRemovedByIdList(builder.toString());
        }catch (Exception e) {
            throw new DaoConvertingException("Get MySQL Data failed! tableName=" + GlobalConstant.LOADBALANCER_COLLECTION_TABLE_NAME
                    + ", resourceList=" + idList, e );
        }
    }
    
    @Override
    public List<LoadBalancerCollection> listAllLoadBalancerCollections() {
        return super.getWholeTable(LOADBALANCER_COLLECTION_NAME, LoadBalancerCollection.class);
    }
}
