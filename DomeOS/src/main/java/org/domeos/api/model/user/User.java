package org.domeos.api.model.user;

import org.apache.commons.lang3.StringUtils;
import org.domeos.util.CryptoUtil;
import org.domeos.util.DateUtil;

import java.util.Date;

/**
 * Created by zhenfengchen on 15-11-16.
 */

/**
 * user related info which is stored in mysql
 */
public class User {
    private Long id;
    private String username;
    private String password;
    private String salt;
    private String email;
    private String phone;
    private String login_type;
    private String status;
    private Date create_time;
    private Date update_time = new Date();

    public User() {

    }

    public User(String username, String password) {
        this.username = username;
        this.password = password;
        this.salt = CryptoUtil.generateSalt();
        this.login_type = UserLoginType.USER.name();
        this.status = UserStatusType.NORMAL.name();
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        User user = (User) o;
        if (id != null ? !id.equals(user.id) : user.id != null)
            return false;
        return true;
    }

    @Override
    public int hashCode() {
        return id != null ? id.hashCode() : 0;
    }

    @Override
    public String toString() {
        return "User{" +
            "id=" + id +
            ", username='" + username + '\'' +
            ", password='" + password + '\'' +
            ", salt='" + salt + '\'' +
            ", login_type='" + login_type + '\'' +
            '}';
    }

    public String checkLegality() {
        String error = null;
        if (StringUtils.isBlank(username)) {
            error = "username is blank";
        } else if (StringUtils.isBlank(password)) {
            error = "password is blank";
        } else if (StringUtils.isBlank(email)) {
            error = "email is blank";
        }
        return error;
    }

    public String getCreate_time() {
        return DateUtil.getDatetime(create_time);
    }

    public void setCreate_time(Date create_time) {
        this.create_time = create_time;
    }

    public String getUpdate_time() {
        return DateUtil.getDatetime(update_time);
    }

    public void setUpdate_time(Date update_time) {
        this.update_time = update_time;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
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

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getSalt() {
        return salt;
    }

    public void setSalt(String salt) {
        this.salt = salt;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getLogin_type() {
        return login_type;
    }

    public void setLogin_type(String login_type) {
        this.login_type = login_type;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}

