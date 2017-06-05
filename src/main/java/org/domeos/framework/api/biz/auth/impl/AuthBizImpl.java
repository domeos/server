package org.domeos.framework.api.biz.auth.impl;

import org.domeos.framework.api.biz.auth.AuthBiz;
import org.domeos.framework.api.biz.base.impl.BaseBizImpl;
import org.domeos.framework.api.mapper.domeos.auth.AdminRolesMapper;
import org.domeos.framework.api.mapper.domeos.auth.UserMapper;
import org.domeos.framework.api.model.auth.AdminRole;
import org.domeos.framework.api.model.auth.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Created by feiliu206363 on 2016/4/5.
 */
@Service("authBiz")
public class AuthBizImpl extends BaseBizImpl implements AuthBiz {
    @Autowired
    AdminRolesMapper adminRolesMapper;
    @Autowired
    UserMapper userMapper;


    @Override
    public boolean isAdmin(int userId) {
        AdminRole adminRole = adminRolesMapper.getAdminById(userId);
        if (adminRole != null) {
            return true;
        }
        return false;
    }

    @Override
    public int getUserId(String userName) {
        User user = userMapper.getUserByName(userName);
        if (user == null) {
            return -1;
        }
        return user.getId();
    }

    @Override
    public User getUser(String userName) {
        return userMapper.getUserByName(userName);
    }

    @Override
    public User getUserById(int userId) {
        return userMapper.getUserById(userId);
    }


    @Override
    public String getUserNameById(int id) {
        return userMapper.getUserNameById(id);
    }

    @Override
    public User getUserByName(String username) {
        return userMapper.getUserByName(username);
    }

    @Override
    public void addUser(User user) {
        userMapper.addUser(user);
    }

    @Override
    public void modifyUser(User existUser) {
        userMapper.modifyUser(existUser);
    }

    @Override
    public void deleteUser(User user) {
        userMapper.deleteUser(user);
    }

    @Override
    public void changePassword(User user) {
        userMapper.changePassword(user);
    }

    @Override
    public List<User> listAllUser() {
        return userMapper.listAllUserInfo();
    }

    @Override
    public List<String> getRole(String username) {
        return userMapper.getRole(username);
    }

}