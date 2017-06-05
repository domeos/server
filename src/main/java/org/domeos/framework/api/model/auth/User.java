package org.domeos.framework.api.model.auth;

import org.domeos.util.StringUtils;
import org.domeos.framework.api.model.auth.related.LoginType;
import org.domeos.framework.api.model.auth.related.UserState;
import org.domeos.util.CryptoUtil;

/**
 * Created by feiliu206363 on 2016/4/5.
 */
public class User {
    private int id;
    private String username;
    private String password;
    private String salt;
    private String email;
    private String phone;
    private LoginType loginType;
    private UserState state;
    private long createTime;
    private long updateTime;

    public User() {
    }

    public User(String username, String password) {
        this.username = username;
        this.password = password;
        this.salt = CryptoUtil.generateSalt();
        this.loginType = LoginType.USER;
        this.state = UserState.NORMAL;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }

        User user = (User) o;
        return id == user.getId();
    }

    @Override
    public String toString() {
        return "User{" +
                "id=" + id +
                ", username='" + username + '\'' +
                ", password='" + password + '\'' +
                ", salt='" + salt + '\'' +
                ", loginType='" + loginType + '\'' +
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

    public int getId() {
        return id;
    }

    public void setId(int id) {
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

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public LoginType getLoginType() {
        return loginType;
    }

    public void setLoginType(LoginType loginType) {
        this.loginType = loginType;
    }

    public UserState getState() {
        return state;
    }

    public void setState(UserState state) {
        this.state = state;
    }

    public long getCreateTime() {
        return createTime;
    }

    public void setCreateTime(long createTime) {
        this.createTime = createTime;
    }

    public long getUpdateTime() {
        return updateTime;
    }

    public void setUpdateTime(long updateTime) {
        this.updateTime = updateTime;
    }
}
