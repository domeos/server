package org.domeos.api.mapper.user;

import org.apache.ibatis.annotations.*;
import org.domeos.api.model.user.User;
import org.domeos.api.model.console.user.UserInfo;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Created by zhenfengchen on 15-11-16.
 *
 * user management related
 */
@Repository
public interface UserMapper {
    @Select("SELECT * FROM sys_users WHERE id=#{userId}")
    User getUserById(@Param("userId") long userId);

    @Select("SELECT * FROM sys_users WHERE username=#{userName} and status='NORMAL'")
    User getUserByName(@Param("userName") String userName);

    @Select("SELECT id,username,email,phone,login_type,create_time FROM sys_users WHERE username=#{userName} and status='NORMAL'")
    UserInfo getUserInfoByName(@Param("userName") String userName);

    @Select("SELECT id,username,email,phone,login_type,create_time FROM sys_users WHERE id=#{userId}")
    UserInfo getUserInfoById(@Param("userId") long userId);

    @Select("SELECT id,username,email,phone,login_type,create_time FROM sys_users where status='NORMAL'")
    List<UserInfo> listAllUserInfo();

    @Insert("INSERT INTO sys_users (username, password, salt, email, phone, login_type, create_time, update_time, status) VALUES (" +
        "#{username}, #{password}, #{salt}, #{email}, #{phone}, #{login_type}, #{create_time},#{update_time}, #{status})")
    @Options(useGeneratedKeys = true, keyProperty = "id", keyColumn = "id")
    int addUser(User user);

    @Update("UPDATE sys_users set password=#{password},salt=#{salt}," +
        "email=#{email},phone=#{phone},update_time=#{update_time} WHERE id=#{id}")
    boolean modifyUser(User user);

    @Update("UPDATE sys_users set password=#{password},salt=#{salt},update_time=#{update_time} WHERE username=#{username} and status='NORMAL'")
    boolean changePassword(User user);

    @Update("UPDATE sys_users set status=#{status},update_time=#{update_time} where username=#{username} and status='NORMAL'")
    int deleteUser(User user);

    @Select("SELECT role FROM sys_admin_roles ar,sys_users u WHERE u.username=#{username} and u.status='NORMAL' and u.id = ar.user_id")
    List<String> getRole(@Param("username") String username);

}
