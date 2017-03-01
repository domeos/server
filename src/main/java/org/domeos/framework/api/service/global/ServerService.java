package org.domeos.framework.api.service.global;

import org.domeos.framework.api.model.global.Server;
import org.domeos.basemodel.HttpResponseTemp;

/**
 * Created by feiliu206363 on 2015/8/28.
 */
public interface ServerService {
    /**
     * server info must be set before other option
     * get server info in database
     *
     * @return
     */
    HttpResponseTemp<?> getServer();

    /**
     * put server info into database
     *
     * @param server can be found in api/global/Server.java
     * @return
     */
    HttpResponseTemp<?> setServer(Server server);

    /**
     * update server info in database by id
     *
     * @param server
     * @return
     */
    HttpResponseTemp<?> updateServer(Server server);

    /**
     * delete server info in database
     *
     * @return
     */
    HttpResponseTemp<?> deleteServer();
}
