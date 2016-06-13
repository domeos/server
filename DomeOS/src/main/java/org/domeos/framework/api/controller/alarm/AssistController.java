package org.domeos.framework.api.controller.alarm;

import org.domeos.framework.api.controller.ApiController;
import org.domeos.framework.api.model.alarm.assist.ActionWrap;
import org.domeos.framework.api.model.alarm.assist.UserWrap;
import org.domeos.framework.api.service.alarm.AssistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

/**
 * Created by baokangwang on 2016/4/14.
 */
@Controller
@RequestMapping("/api")
public class AssistController extends ApiController {

    @Autowired
    AssistService assistService;

    @ResponseBody
    @RequestMapping(value = "/alarm/action/wrap/{actionId}", method = RequestMethod.GET)
    public ActionWrap getActionById(@PathVariable long actionId) {
        return assistService.getActionById(actionId);
    }

    @ResponseBody
    @RequestMapping(value = "/alarm/group/users/wrap", method = RequestMethod.GET)
    public UserWrap getUsers(@RequestParam(value = "group", required = false) String group) {
        return assistService.getUsers(group);
    }

    @ResponseBody
    @RequestMapping(value = "/alarm/link/store", method = RequestMethod.POST)
    public String storeLink(@RequestBody String content) {
        return assistService.storeLink(content);
    }

    @ResponseBody
    @RequestMapping(value = "/alarm/link/{linkId}", method = RequestMethod.GET)
    public String retrieveLink(@PathVariable long linkId) {
        return assistService.retrieveLink(linkId);
    }
}
