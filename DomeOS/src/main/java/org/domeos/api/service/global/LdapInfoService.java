package org.domeos.api.service.global;

import org.domeos.api.model.global.LdapInfo;
import org.domeos.api.model.global.LdapLoginInfo;
import org.domeos.basemodel.HttpResponseTemp;

/**
 * Created by feiliu206363 on 2015/12/30.
 */
public interface LdapInfoService {
    /**
     *
     * @param userId
     * @return
     */
    HttpResponseTemp<?> getLdapInfo(Long userId);

    /**
     *
     * @param ldapInfo
     * @param userId
     * @return
     */
    HttpResponseTemp<?> setLdapInfo(LdapInfo ldapInfo, Long userId);

    /**
     *
     * @param ldapInfo
     * @param userId
     * @return
     */
    HttpResponseTemp<?> modifyLdapInfo(LdapInfo ldapInfo, Long userId);

    /**
     *
     *
     * @param id
     * @param userId
     * @return
     */
    HttpResponseTemp<?> deleteLdapInfo(int id, long userId);

    /**
     *
     * @param ldapLoginInfo
     * @return
     */
    HttpResponseTemp<?> ldapLoginTest(LdapLoginInfo ldapLoginInfo);
}
