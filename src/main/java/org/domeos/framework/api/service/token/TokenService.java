package org.domeos.framework.api.service.token;

import org.domeos.framework.api.model.global.Registry;
import org.domeos.framework.api.model.token.Token;

/**
 * Created by KaiRen on 16/8/1.
 */
public interface TokenService {

    /**
     * get token for docker client
     *
     * @param service       service name;
     * @param scope         the imageName and auth list
     * @param offline_token
     * @param client_id
     * @return
     */
    Token getToken(String authorization, String service, String scope, String offline_token, String client_id);

    /**
     * get if current server is auth used
     *
     * @param registry current private registry
     * @return
     */
    Boolean isAuthUsed(Registry registry);

    /**
     * get auth token for current login user
     *
     * @return
     */
    String getCurrentUserToken(String name, String type);

    /**
     * get catalog token to list all the image name in registry
     *
     * @return
     */
    String getCatalogToken();

    /**
     * get admin token for specified image
     *
     * @param imageName the image name to authorize admin access
     * @return
     */
    String getAdminToken(String imageName);


}
