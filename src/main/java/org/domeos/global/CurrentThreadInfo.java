package org.domeos.global;

import org.domeos.framework.api.model.auth.User;

/**
 * Created by xupeng on 16-4-5.
 * not for use now
 */
public class CurrentThreadInfo {

    private static ThreadLocal<User> userThreadLocal = new ThreadLocal<>();

    private CurrentThreadInfo() {}

    /**
     * get user info for logged in user in current thread
     * @return user info if user logged in, or null if no user logged in
     */
    public static User getUser() {
        return userThreadLocal.get();
    }

    /**
     * get user id in current thread for logged in user
     * @return user id if user logged in, or -1 if no user logged in
     */
    public static int getUserId() {
        User user = userThreadLocal.get();
        if (user == null) {
            return -1;
        }
        return user.getId();
    }

    /**
     * get user name in current thread for logged in user
     * @return user name if user logged in, or "NOBODY" if no user logged in
     */
    public static String getUserName() {
        User user = userThreadLocal.get();
        if (user == null) {
            return "NOBODY";
        }
        return user.getUsername();
    }

    /**
     * set logged in user for current thread
     * @param user user info for current thread
     */
    public static void setUser(User user) {
        userThreadLocal.set(user);
    }

//    public static void main(String[] args) {
//        new Thread(new Runnable() {
//            @Override
//            public void run() {
//                User user = new User();
//                user.setId(1);
//                user.setUsername("conan");
//                CurrentThreadInfo.setUser(user);
//                print(CurrentThreadInfo.getUserId());
//                print(CurrentThreadInfo.getUserName());
//            }
//        }).start();
//        new Thread(new Runnable() {
//            @Override
//            public void run() {
//                print(CurrentThreadInfo.getUserId());
//                print(CurrentThreadInfo.getUserName());
//                print(CurrentThreadInfo.getUser());
//            }
//        }).start();
//    }
//
//    public static void print(Object s) {
//        System.out.println(Thread.currentThread().getName() + ":" + s);
//    }

}
