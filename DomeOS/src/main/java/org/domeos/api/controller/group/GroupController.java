package org.domeos.api.controller.group;

import org.domeos.api.controller.ApiController;
import org.domeos.api.model.console.group.GroupMembers;
import org.domeos.api.model.group.Group;
import org.domeos.api.model.group.UserGroup;
import org.domeos.api.model.user.RoleType;
import org.domeos.api.model.user.User;
import org.domeos.api.service.group.GroupService;
import org.domeos.api.service.group.UserGroupService;
import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.basemodel.ResultStat;
import org.domeos.shiro.AuthUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.Date;

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
        long userId = AuthUtil.getUserId();
        HttpResponseTemp<?> ret1 = groupService.createGroup(group);
        if (ret1.getResultCode() == ResultStat.OK.responseCode) {
            UserGroup userGroup = new UserGroup(userId,
                ((Group)ret1.getResult()).getId());
            userGroup.setRole(RoleType.MASTER.getRoleName());
            userGroupService.addUserToGroup(userGroup);
        }
        return ret1;
    }

    @ResponseBody
    @RequestMapping(value = "/group/delete/{id}", method = RequestMethod.DELETE)
    public HttpResponseTemp<?> deleteGroup(@PathVariable long id) {
        long userId = AuthUtil.getUserId();
        HttpResponseTemp<?> ret1 = groupService.deleteGroup(userId, id);
        if (ret1.getResultCode() == ResultStat.OK.responseCode) {
            // start to delete all users in this group
            userGroupService.deleteAllUserInGroup(id);
        }
        return ret1;
    }

    @ResponseBody
    @RequestMapping(value = "/group/get/{id}", method = RequestMethod.GET)
    public HttpResponseTemp<?> getGroup(@PathVariable long id) {
        return groupService.getGroup(id);
    }

    @ResponseBody
    @RequestMapping(value = "/group/list", method = RequestMethod.GET)
    public HttpResponseTemp<?> listAllGroups() {
        long userId = AuthUtil.getUserId();
        return groupService.listAllGroupInfo(userId);
    }

    @ResponseBody
    @RequestMapping(value = "/group/modify", method = RequestMethod.POST)
    public HttpResponseTemp<?> modifyGroup(@RequestBody Group group) {
        return groupService.modifyGroup(group);
    }

    @ResponseBody
    @RequestMapping(value="/namespace/list", method = RequestMethod.GET)
    public HttpResponseTemp<?> getNamespace() {
        User user = AuthUtil.getUser();
        return userGroupService.getNamespace(user);
    }

    /**
     * Post body is
     *  { "group_id":groupId, "user_id":userId, "role": "#roleType" }
     */
    @ResponseBody
    @RequestMapping(value = "/group_members", method = RequestMethod.POST)
    public HttpResponseTemp<?> addGroupMember(@RequestBody UserGroup userGroup) {
        long userId = AuthUtil.getUserId();
        userGroup.setUpdate_time(new Date());
        return userGroupService.addGroupMember(userId, userGroup);
    }

    @ResponseBody
    @RequestMapping(value = "/group_members/{groupId}", method = RequestMethod.POST)
    public HttpResponseTemp<?> addGroupMembers(@PathVariable long groupId, @RequestBody GroupMembers groupMembers) {
        long userId = AuthUtil.getUserId();
        groupMembers.setGroupId(groupId);
        return userGroupService.addGroupMembers(userId, groupMembers);
    }

    @ResponseBody
    @RequestMapping(value = "/group_members/{groupId}", method = RequestMethod.GET)
    public HttpResponseTemp<?> listGroupMembers(@PathVariable long groupId) {
        long userId = AuthUtil.getUserId();
        return userGroupService.listGroupMember(userId, groupId);
    }

    @ResponseBody
    @RequestMapping(value = "/group_members/{groupId}/{userId}", method = RequestMethod.DELETE)
    public HttpResponseTemp<?> deleteGroupMember(@PathVariable long groupId,
                                                   @PathVariable long userId) {
        HttpResponseTemp<?> ret = groupService.getGroup(groupId);
        if (ret.getResultCode() == ResultStat.OK.responseCode) {
            Group group = (Group) ret.getResult();
            UserGroup userGroup = new UserGroup(userId, group.getId());
            return userGroupService.deleteGroupMember(AuthUtil.getUserId(), userGroup);
        } else {
            return ResultStat.GROUP_MEMBER_FAILED.wrap("delete group member failed");
        }
    }
}
