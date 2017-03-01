package org.domeos.framework.api.biz.auth;

import org.domeos.framework.api.biz.base.BaseBiz;
import org.domeos.framework.api.model.auth.User;

import java.util.List;

/**
 * Created by feiliu206363 on 2016/4/5.
 */
public interface AuthBiz extends BaseBiz {
    boolean isAdmin(int userId);

    int getUserId(String userName);

    User getUser(String userName);

    String getUserNameById(int id);

    User getUserById(int userId);

    User getUserByName(String username);

    void addUser(User user);

    void modifyUser(User existUser);

    void deleteUser(User user);

    void changePassword(User user);

    List<User> listAllUser();

    List<String> getRole(String username);
}
