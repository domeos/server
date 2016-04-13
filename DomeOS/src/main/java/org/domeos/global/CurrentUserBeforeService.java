package org.domeos.global;

import org.apache.commons.lang3.tuple.Pair;
import org.domeos.framework.api.model.auth.User;

/**
 * Created by xupeng on 16-4-5.
 * not for use now
 */
@Deprecated
public class CurrentUserBeforeService {

    ThreadLocal<User> userThreadLocal = new ThreadLocal<>();

    private CurrentUserBeforeService() {}

    public CurrentUserBeforeService getInstance() {
        return Holder.instance;
    }

    private static class Holder {
        public static CurrentUserBeforeService instance = new CurrentUserBeforeService();
    }

    public Pair<Boolean, User> getUser() {
        User user = userThreadLocal.get();
        if (user != null) {
            userThreadLocal.remove();
            return Pair.of(Boolean.TRUE, user);
        } else {
            return Pair.of(Boolean.FALSE, null);
        }
    }

    public void setUser() {

    }
}
