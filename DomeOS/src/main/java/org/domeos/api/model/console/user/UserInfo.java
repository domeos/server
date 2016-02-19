package org.domeos.api.model.console.user;

import org.domeos.util.DateUtil;

import java.util.Date;

/**
 * Created by zhenfengchen on 15-11-16.
 */

/**
 * get user'info from database to show on front ui
 */
public class UserInfo {
    private Long id;
    private String username;
    private String email;
    private String phone;
    private String login_type;
    private Date create_time;

    public UserInfo() {

    }

    @Override
    public String toString() {
        return "User{" +
            "id=" + id +
            ", username='" + username + '\'' +
            ", email='" + email + '\'' +
            ", phone='" + phone + '\'' +
            ", login_type='" + login_type + '\'' +
            ", create_time='" + create_time + '\'' +
            '}';
    }

    public String getCreate_time() {
        return DateUtil.getDatetime(create_time);
    }

    public void setCreate_time(Date create_time) {
        this.create_time = create_time;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getLogin_type() {
        return login_type;
    }

    public void setLogin_type(String login_type) {
        this.login_type = login_type;
    }
}
