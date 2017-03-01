package org.domeos.framework.api.service.global;

import org.domeos.framework.api.model.global.Registry;
import org.domeos.basemodel.HttpResponseTemp;

/**
 * Created by feiliu206363 on 2015/8/31.
 */
public interface RegistryService {
    /**
     * private registry must be set before other option
     * get private registry from database
     *
     * @return
     */
    HttpResponseTemp<?> getPrivateRegistry();

    /**
     * put private registry info into database
     *
     * @param registry can be found in api/global/Registry.java
     * @return
     */
    HttpResponseTemp<?> setPrivateRegistry(Registry registry);

    String getCertification();
}
