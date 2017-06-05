package org.domeos.framework.api.controller.token;

import org.domeos.framework.api.controller.ApiController;
import org.domeos.framework.api.model.token.Token;
import org.domeos.framework.api.service.token.TokenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

/**
 * Created by KaiRen on 16/8/1.
 */
@Controller
@RequestMapping("/service/token")
public class TokenController extends ApiController {

    @Autowired
    private TokenService tokenservice;

    @ResponseBody
    @RequestMapping(value = "", method = RequestMethod.GET)
    public Token getToken(@RequestParam(required = false) String service, @RequestParam(required = false, value = "scope") String scope,
                          @RequestParam(required = false) String offline_token, @RequestHeader(value = "authorization") String authorization,
                          @RequestParam(required = false) String client_id) {
        return tokenservice.getToken(authorization, service, scope, offline_token, client_id);
    }

}