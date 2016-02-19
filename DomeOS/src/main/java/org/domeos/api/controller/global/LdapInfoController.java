package org.domeos.api.controller.global;

import org.domeos.api.model.global.LdapInfo;
import org.domeos.api.model.global.LdapLoginInfo;
import org.domeos.api.service.global.LdapInfoService;
import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.shiro.AuthUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

/**
 * Created by feiliu206363 on 2015/12/30.
 */
@Controller
@RequestMapping("/api/global/ldapconfig")
public class LdapInfoController {
    @Autowired
    LdapInfoService ldapInfoService;

    @ResponseBody
    @RequestMapping(value = "", method = RequestMethod.GET)
    HttpResponseTemp<?> getLdapInfo() {
        long userId = AuthUtil.getUserId();
        return ldapInfoService.getLdapInfo(userId);
    }

    @ResponseBody
    @RequestMapping(value = "", method = RequestMethod.POST)
    HttpResponseTemp<?> setLdapInfo(@RequestBody LdapInfo LdapInfo) {
        long userId = AuthUtil.getUserId();
        return ldapInfoService.setLdapInfo(LdapInfo, userId);
    }

    @ResponseBody
    @RequestMapping(value = "", method = RequestMethod.PUT)
    HttpResponseTemp<?> modifyLdapInfo(@RequestBody LdapInfo ldapInfo) {
        long userId = AuthUtil.getUserId();
        return ldapInfoService.modifyLdapInfo(ldapInfo, userId);
    }

    @ResponseBody
    @RequestMapping(value = "/{id}", method = RequestMethod.DELETE)
    HttpResponseTemp<?> deleteLdapInfo(@PathVariable int id) {
        long userId = AuthUtil.getUserId();
        return ldapInfoService.deleteLdapInfo(id, userId);
    }

    @ResponseBody
    @RequestMapping(value = "/login", method = RequestMethod.POST)
    HttpResponseTemp<?> ldapLoginTest(@RequestBody LdapLoginInfo ldapLoginInfo) {
        return ldapInfoService.ldapLoginTest(ldapLoginInfo);
    }
}
