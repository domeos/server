package org.domeos.api.service.global;

import org.domeos.api.model.cluster.CiCluster;
import org.domeos.basemodel.HttpResponseTemp;

/**
 * Created by feiliu206363 on 2015/12/4.
 */
public interface CiClusterService {
    /**
     * get kubernetes cluster by id from database
     *
     * @param userId
     * @return
     */
    HttpResponseTemp<?> getCiCluster(long userId);

    /**
     * put kubenetes cluster into database
     *
     * @param ciCluster can be found in api/model/cluster/KubeCluster.java
     * @param userId
     * @return
     */
    HttpResponseTemp<?> setCiCluster(CiCluster ciCluster, long userId);

    /**
     * update kubernetes cluster in database by id
     *
     * @param ciCluster
     * @param userId
     * @return
     */
    HttpResponseTemp<?> updateCiCluster(CiCluster ciCluster, long userId);

    /**
     * delete kubernetes cluster from database by id
     *
     * @param userId
     * @return
     */
    HttpResponseTemp<?> deleteCiCluster(long userId);
}
