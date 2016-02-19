package org.domeos.api.controller.user;

import org.apache.log4j.Logger;
import org.domeos.api.controller.ApiController;
import org.domeos.api.model.console.user.UserInfo;
import org.domeos.api.model.resource.ResourceType;
import org.domeos.api.model.user.ChangeUserPassword;
import org.domeos.api.model.user.RoleType;
import org.domeos.api.model.user.User;
import org.domeos.api.model.user.UserPassword;
import org.domeos.api.service.user.UserService;
import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.basemodel.ResultStat;
import org.domeos.shiro.AuthUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Created by zhenfengchen on 15-11-16.
 */
@Controller
@RequestMapping("/api/user")
public class UserController extends ApiController {
    protected static Logger logger = Logger.getLogger(UserController.class);
    @Autowired
    UserService userService;

    @ResponseBody
    @RequestMapping(value = "/login", method = RequestMethod.POST)
    public HttpResponseTemp<?> normalLogin(@RequestBody UserPassword userPassword) {
        return userService.normalLogin(userPassword);
    }

    @ResponseBody
    @RequestMapping(value = "/create", method = RequestMethod.POST)
    public HttpResponseTemp<?> createUser(@RequestBody User addUserInfo) {
        User user = new User(addUserInfo.getUsername(), addUserInfo.getPassword());
        user.setEmail(addUserInfo.getEmail());
        user.setPhone(addUserInfo.getPhone());
        long userId = AuthUtil.getUserId();
        return userService.createUser(userId, user);
    }

    @ResponseBody
    @RequestMapping(value = "/delete/{username}", method = RequestMethod.DELETE)
    public HttpResponseTemp<?> deleteUser(@PathVariable String username) {
        long userId = AuthUtil.getUserId();
        return userService.deleteUser(userId, username);
    }

    @ResponseBody
    @RequestMapping(value = "/changePassword", method = RequestMethod.POST)
    public HttpResponseTemp<?> modifyPassword(@RequestBody ChangeUserPassword changeUserPassword) {
        return userService.changePassword(changeUserPassword);
    }

    @ResponseBody
    @RequestMapping(value = "/adminChangePassword", method = RequestMethod.POST)
    public HttpResponseTemp<?> modifyPassword(@RequestBody UserPassword userPassword) {
        long userId = AuthUtil.getUserId();
        return userService.changePasswordByAdmin(userId, userPassword);
    }

    @ResponseBody
    @RequestMapping(value = "/modify", method = RequestMethod.POST)
    public HttpResponseTemp<?> modifyUser(
            @RequestParam(value = "username", required = true) String username,
            @RequestParam(value = "email", required = true) String email) {
        long userId = AuthUtil.getUserId();
        return userService.modifyUser(userId, username, email);
    }

    @ResponseBody
    @RequestMapping(value = "/get/{username}", method = RequestMethod.GET)
    public HttpResponseTemp<?> getUser(@PathVariable String username) {
        return userService.getUserInfo(username);
    }

    @ResponseBody
    @RequestMapping(value = "/get", method = RequestMethod.GET)
    public HttpResponseTemp<?> getCurrentLoginUser() {
        String userName = AuthUtil.getCurrentUserName();
        return userService.getUserInfo(userName);
    }

    @ResponseBody
    @RequestMapping(value = "/list", method = RequestMethod.GET)
    public HttpResponseTemp<List<UserInfo>> listAllUsers() {
        long userId = AuthUtil.getUserId();
        if (userId <= 0) {
            return ResultStat.FORBIDDEN.wrap(null);
        }
        return userService.listAllUserInfo();
    }

    @ResponseBody
    @RequestMapping(value = "/resource/{type}/{id}", method = RequestMethod.GET)
    public HttpResponseTemp<?> getUserRoleInResource(@PathVariable ResourceType type, @PathVariable long id) {
        long userId = AuthUtil.getUserId();
        RoleType roleType = AuthUtil.getUserRoleInResource(type, id, userId);
        return ResultStat.OK.wrap(roleType);
    }
}
