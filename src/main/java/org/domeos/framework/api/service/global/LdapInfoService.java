package org.domeos.framework.api.service.global;

import org.domeos.framework.api.model.global.LdapInfo;
import org.domeos.framework.api.model.global.LdapLoginInfo;
import org.domeos.basemodel.HttpResponseTemp;

/**
 * Created by feiliu206363 on 2015/12/30.
 */
public interface LdapInfoService {
    /**
     *
     * @return
     */
    HttpResponseTemp<?> getLdapInfo();

    /**
     *
     * @param ldapInfo
     * @return
     */
    HttpResponseTemp<?> setLdapInfo(LdapInfo ldapInfo);

    /**
     *
     * @param ldapInfo
     * @return
     */
    HttpResponseTemp<?> modifyLdapInfo(LdapInfo ldapInfo);

    /**
     *
     *
     * @return
     */
    HttpResponseTemp<?> deleteLdapInfo();

    /**
     *
     * @param ldapLoginInfo
     * @return
     */
    HttpResponseTemp<?> ldapLoginTest(LdapLoginInfo ldapLoginInfo);
}
