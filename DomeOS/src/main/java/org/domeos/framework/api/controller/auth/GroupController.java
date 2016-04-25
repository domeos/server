package org.domeos.framework.api.controller.auth;

import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.basemodel.ResultStat;
import org.domeos.framework.api.consolemodel.auth.GroupMembers;
import org.domeos.framework.api.controller.ApiController;
import org.domeos.framework.api.model.auth.Group;
import org.domeos.framework.api.model.auth.User;
import org.domeos.framework.api.model.auth.UserGroupMap;
import org.domeos.framework.api.model.auth.related.Role;
import org.domeos.framework.api.service.auth.GroupService;
import org.domeos.framework.api.service.auth.UserGroupService;
import org.domeos.framework.engine.AuthUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

/**
 * Created by zhenfengchen on 15-11-19.
 */
@Controller
@RequestMapping("/api")
public class GroupController extends ApiController {
    @Autowired
    GroupService groupService;

    @Autowired
    UserGroupService userGroupService;

    @ResponseBody
    @RequestMapping(value = "/group/create", method = RequestMethod.POST)
    public HttpResponseTemp<?> createGroup(@RequestBody Group group) {
        int userId = AuthUtil.getUserId();
        HttpResponseTemp<?> ret1 = groupService.createGroup(group);
        if (ret1.getResultCode() == ResultStat.OK.responseCode) {
            UserGroupMap userGroup = new UserGroupMap();
            userGroup.setUserId(userId);
            userGroup.setGroupId(((Group) ret1.getResult()).getId());
            userGroup.setRole(Role.MASTER);
            userGroupService.addUserToGroup(userGroup);
        }
        return ret1;
    }

    @ResponseBody
    @RequestMapping(value = "/group/delete/{id}", method = RequestMethod.DELETE)
    public HttpResponseTemp<?> deleteGroup(@PathVariable int id) {
        int userId = AuthUtil.getUserId();
        HttpResponseTemp<?> ret1 = groupService.deleteGroup(userId, id);
        if (ret1.getResultCode() == ResultStat.OK.responseCode) {
            // start to delete all users in this group
            userGroupService.deleteAllUserInGroup(id);
        }
        return ret1;
    }

    @ResponseBody
    @RequestMapping(value = "/group/get/{id}", method = RequestMethod.GET)
    public HttpResponseTemp<?> getGroup(@PathVariable int id) {
        return groupService.getGroup(id);
    }

    @ResponseBody
    @RequestMapping(value = "/group/list", method = RequestMethod.GET)
    public HttpResponseTemp<?> listAllGroups() {
        int userId = AuthUtil.getUserId();
        return groupService.listAllGroupInfo(userId);
    }

    @ResponseBody
    @RequestMapping(value = "/group/modify", method = RequestMethod.POST)
    public HttpResponseTemp<?> modifyGroup(@RequestBody Group group) {
        return groupService.modifyGroup(group);
    }

    @ResponseBody
    @RequestMapping(value = "/namespace/list", method = RequestMethod.GET)
    public HttpResponseTemp<?> getNamespace() {
        User user = AuthUtil.getUser();
        return userGroupService.getNamespace(user);
    }

    /**
     * Post body is
     * { "group_id":groupId, "user_id":userId, "role": "#roleType" }
     */
    @ResponseBody
    @RequestMapping(value = "/group_members", method = RequestMethod.POST)
    public HttpResponseTemp<?> addGroupMember(@RequestBody UserGroupMap userGroup) {
        int userId = AuthUtil.getUserId();
        userGroup.setUpdateTime(System.currentTimeMillis());
        return userGroupService.addGroupMember(userId, userGroup);
    }

    @ResponseBody
    @RequestMapping(value = "/group_members/{groupId}", method = RequestMethod.POST)
    public HttpResponseTemp<?> addGroupMembers(@PathVariable int groupId, @RequestBody GroupMembers groupMembers) {
        int userId = AuthUtil.getUserId();
        groupMembers.setGroupId(groupId);
        return userGroupService.addGroupMembers(userId, groupMembers);
    }

    @ResponseBody
    @RequestMapping(value = "/group_members/{groupId}", method = RequestMethod.GET)
    public HttpResponseTemp<?> listGroupMembers(@PathVariable int groupId) {
        int userId = AuthUtil.getUserId();
        return userGroupService.listGroupMember(userId, groupId);
    }

    @ResponseBody
    @RequestMapping(value = "/group_members/{groupId}/{userId}", method = RequestMethod.DELETE)
    public HttpResponseTemp<?> deleteGroupMember(@PathVariable int groupId,
                                                 @PathVariable int userId) {
        HttpResponseTemp<?> ret = groupService.getGroup(groupId);
        if (ret.getResultCode() == ResultStat.OK.responseCode) {
            Group group = (Group) ret.getResult();
            UserGroupMap userGroup = new UserGroupMap();
            userGroup.setUserId(userId);
            userGroup.setGroupId(group.getId());
            return userGroupService.deleteGroupMember(AuthUtil.getUserId(), userGroup);
        } else {
            return ResultStat.GROUP_MEMBER_FAILED.wrap("delete group member failed");
        }
    }
}
