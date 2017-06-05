package org.domeos.framework.api.service.global;

import org.domeos.framework.api.model.global.CiCluster;
import org.domeos.basemodel.HttpResponseTemp;

/**
 * Created by feiliu206363 on 2015/12/4.
 */
public interface CiClusterService {
    /**
     * get kubernetes cluster by id from database
     *
     * @return
     */
    HttpResponseTemp<?> getCiCluster();

    /**
     * put kubenetes cluster into database
     *
     * @param ciCluster can be found in api/model/cluster/KubeCluster.java
     * @return
     */
    HttpResponseTemp<?> setCiCluster(CiCluster ciCluster);

    /**
     * update kubernetes cluster in database by id
     *
     * @param ciCluster
     * @return
     */
    HttpResponseTemp<?> updateCiCluster(CiCluster ciCluster);

    /**
     * delete kubernetes cluster from database by id
     *
     * @return
     */
    HttpResponseTemp<?> deleteCiCluster();
}
