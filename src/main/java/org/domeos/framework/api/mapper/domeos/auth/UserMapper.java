package org.domeos.framework.api.mapper.domeos.auth;

import org.apache.ibatis.annotations.*;
import org.domeos.framework.api.model.auth.User;

import java.util.List;

/**
 * Created by feiliu206363 on 2016/4/5.
 */
@Mapper
public interface UserMapper {
    @Select("SELECT * FROM users WHERE id=#{userId}")
    User getUserById(@Param("userId") int userId);

    @Select("SELECT * FROM users WHERE username=#{userName} and state='NORMAL'")
    User getUserByName(@Param("userName") String userName);

    @Select("SELECT id, username, email, phone, loginType, createTime FROM users WHERE" +
            " username=#{userName} and state='NORMAL'")
    User getUserInfoByName(@Param("userName") String userName);

    @Select("SELECT id, username, email, phone, loginType, createTime FROM users WHERE id=#{userId}")
    User getUserInfoById(@Param("userId") int userId);

    @Select("SELECT id, username, email, phone, loginType, createTime FROM users where state='NORMAL'")
    List<User> listAllUserInfo();

    @Insert("INSERT INTO users (username, password, salt, email, phone, loginType, createTime, updateTime, state) VALUES (" +
            "#{username}, #{password}, #{salt}, #{email}, #{phone}, #{loginType}, #{createTime},#{updateTime}, #{state})")
    @Options(useGeneratedKeys = true, keyProperty = "id", keyColumn = "id")
    int addUser(User user);

    @Update("UPDATE users set password=#{password}, salt=#{salt}," +
            "email=#{email}, phone=#{phone}, updateTime=#{updateTime} WHERE id=#{id}")
    boolean modifyUser(User user);

    @Update("UPDATE users set password=#{password}, salt=#{salt}, updateTime=#{updateTime} WHERE" +
            " username=#{username} and state='NORMAL'")
    boolean changePassword(User user);

    @Update("UPDATE users set state=#{state}, updateTime=#{updateTime} where username=#{username} and state='NORMAL'")
    int deleteUser(User user);

    @Select("SELECT role FROM admin_roles ar,users u WHERE u.username=#{username} and u.state='NORMAL' and u.id = ar.userId")
    List<String> getRole(@Param("username") String username);

    @Select("SELECT username FROM users WHERE id=#{id}")
    String getUserNameById(@Param("id") int id);
}
