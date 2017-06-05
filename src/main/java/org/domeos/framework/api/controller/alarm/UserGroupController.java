package org.domeos.framework.api.controller.alarm;

import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.framework.api.consolemodel.alarm.UserGroupDraft;
import org.domeos.framework.api.controller.ApiController;
import org.domeos.framework.api.model.alarm.UserInfo;
import org.domeos.framework.api.service.alarm.UserGroupService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Created by KaiRen on 2016/9/27.
 */
@Controller
@RequestMapping("/api")
public class UserGroupController extends ApiController {
    @Autowired
    UserGroupService userGroupService;

    @ResponseBody
    @RequestMapping(value = "/alarm/usergroup", method = RequestMethod.GET)
    public HttpResponseTemp<?> listUserGroupInfo() {
        return userGroupService.listUserGroupInfo();
    }

    @ResponseBody
    @RequestMapping(value = "/alarm/usergroup", method = RequestMethod.POST)
    public HttpResponseTemp<?> createUserGroup(@RequestBody UserGroupDraft userGroupDraft) {
        return userGroupService.createUserGroup(userGroupDraft);
    }

    @ResponseBody
    @RequestMapping(value = "/alarm/usergroup", method = RequestMethod.PUT)
    public HttpResponseTemp<?> modifyUserGroup(@RequestBody UserGroupDraft userGroupDraft) {
        return userGroupService.modifyUserGroup(userGroupDraft);
    }

    @ResponseBody
    @RequestMapping(value = "/alarm/usergroup/{id}", method = RequestMethod.DELETE)
    public HttpResponseTemp<?> deleteUserGroup(@PathVariable long id) {
        return userGroupService.deleteUserGroup(id);
    }

    @ResponseBody
    @RequestMapping(value = "/alarm/usergroup/bind/{id}", method = RequestMethod.POST)
    public HttpResponseTemp<?> bindUserList(@PathVariable long id, @RequestBody List<UserInfo> userInfoList) {
        return userGroupService.bindUserList(id, userInfoList);
    }

    @ResponseBody
    @RequestMapping(value = "/alarm/usergroup/bind/{id}/{userId}", method = RequestMethod.DELETE)
    public HttpResponseTemp<?> unbindUser(@PathVariable long id, @PathVariable int userId) {
        return userGroupService.unbindUser(id, userId);
    }
}
