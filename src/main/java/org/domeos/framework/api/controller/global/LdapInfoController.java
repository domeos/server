package org.domeos.framework.api.controller.global;

import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.framework.api.controller.ApiController;
import org.domeos.framework.api.model.global.LdapInfo;
import org.domeos.framework.api.model.global.LdapLoginInfo;
import org.domeos.framework.api.service.global.LdapInfoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

/**
 * Created by feiliu206363 on 2015/12/30.
 */
@Controller
@RequestMapping("/api/global/ldapconfig")
public class LdapInfoController extends ApiController {
    @Autowired
    LdapInfoService ldapInfoService;

    @ResponseBody
    @RequestMapping(value = "", method = RequestMethod.GET)
    HttpResponseTemp<?> getLdapInfo() {
        return ldapInfoService.getLdapInfo();
    }

    @ResponseBody
    @RequestMapping(value = "", method = RequestMethod.POST)
    HttpResponseTemp<?> setLdapInfo(@RequestBody LdapInfo LdapInfo) {
        return ldapInfoService.setLdapInfo(LdapInfo);
    }

    @ResponseBody
    @RequestMapping(value = "", method = RequestMethod.PUT)
    HttpResponseTemp<?> modifyLdapInfo(@RequestBody LdapInfo ldapInfo) {
        return ldapInfoService.modifyLdapInfo(ldapInfo);
    }

    @ResponseBody
    @RequestMapping(value = "", method = RequestMethod.DELETE)
    HttpResponseTemp<?> deleteLdapInfo() {
        return ldapInfoService.deleteLdapInfo();
    }

    @ResponseBody
    @RequestMapping(value = "/login", method = RequestMethod.POST)
    HttpResponseTemp<?> ldapLoginTest(@RequestBody LdapLoginInfo ldapLoginInfo) {
        return ldapInfoService.ldapLoginTest(ldapLoginInfo);
    }
}
