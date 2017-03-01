package org.domeos.framework.api.controller.auth;

import org.apache.shiro.SecurityUtils;
import org.apache.shiro.subject.Subject;
import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.basemodel.ResultStat;
import org.domeos.framework.api.consolemodel.auth.ChangeUserPassword;
import org.domeos.framework.api.consolemodel.auth.UserPassword;
import org.domeos.framework.api.controller.ApiController;
import org.domeos.framework.api.model.auth.User;
import org.domeos.framework.api.model.auth.related.Role;
import org.domeos.framework.api.model.collection.related.ResourceType;
import org.domeos.framework.api.service.auth.UserService;
import org.domeos.framework.engine.AuthUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.ModelAndView;

import java.util.List;

/**
 * Created by zhenfengchen on 15-11-16.
 */
@Controller
@RequestMapping("/api/user")
public class UserController extends ApiController {
    protected static Logger logger = LoggerFactory.getLogger(UserController.class);
    @Autowired
    UserService userService;

    @ResponseBody
    @RequestMapping(value = "/login", method = RequestMethod.POST)
    public HttpResponseTemp<?> normalLogin(@RequestBody UserPassword userPassword) {
        return userService.normalLogin(userPassword);
    }

    @RequestMapping("/logout")
    public ModelAndView logout() {
        Subject subject = SecurityUtils.getSubject();
        subject.logout();
        return new ModelAndView("redirect:/login/login.html");
    }

    @ResponseBody
    @RequestMapping(value = "/create", method = RequestMethod.POST)
    public HttpResponseTemp<?> createUser(@RequestBody User addUserInfo) {
        User user = new User(addUserInfo.getUsername(), addUserInfo.getPassword());
        user.setEmail(addUserInfo.getEmail());
        user.setPhone(addUserInfo.getPhone());
        return userService.createUser(user);
    }

    @ResponseBody
    @RequestMapping(value = "/delete/{id}", method = RequestMethod.DELETE)
    public HttpResponseTemp<?> deleteUser(@PathVariable int id) {
        return userService.deleteUser(id);
    }

    @ResponseBody
    @RequestMapping(value = "/changePassword", method = RequestMethod.POST)
    public HttpResponseTemp<?> modifyPassword(@RequestBody ChangeUserPassword changeUserPassword) {
        return userService.changePassword(changeUserPassword);
    }

    @ResponseBody
    @RequestMapping(value = "/adminChangePassword", method = RequestMethod.POST)
    public HttpResponseTemp<?> modifyPassword(@RequestBody UserPassword userPassword) {
        return userService.changePasswordByAdmin(userPassword);
    }

    @ResponseBody
    @RequestMapping(value = "/modify", method = RequestMethod.POST)
    public HttpResponseTemp<?> modifyUser(@RequestBody User user) {
        return userService.modifyUser(user);
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
    public HttpResponseTemp<List<User>> listAllUsers() {
        long userId = AuthUtil.getUserId();
        if (userId <= 0) {
            return ResultStat.FORBIDDEN.wrap(null);
        }
        return userService.listAllUserInfo();
    }

    @ResponseBody
    @RequestMapping(value = "/resource/{type}/{id}", method = RequestMethod.GET)
    public HttpResponseTemp<?> getUserRoleInResource(@PathVariable ResourceType type, @PathVariable int id) {
        int userId = AuthUtil.getUserId();
        Role roleType = AuthUtil.getUserRoleInResource(type, id, userId);
        return ResultStat.OK.wrap(roleType);
    }
}
