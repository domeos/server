package org.domeos.framework.shiro.session;

import org.apache.shiro.session.Session;
import org.apache.shiro.session.SessionListener;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * Created by feiliu206363 on 2016/12/22.
 */
@Component
public class ShiroSessionListener implements SessionListener {
    private static Logger logger = LoggerFactory.getLogger(ShiroSessionListener.class);

    @Autowired
    RedisSessionDao redisSessionDao;

    @Override
    public void onStart(Session session) {
    }

    @Override
    public void onStop(Session session) {
        if (redisSessionDao != null) {
            redisSessionDao.delete(session);
        }
    }

    @Override
    public void onExpiration(Session session) {
        if (redisSessionDao != null) {
            redisSessionDao.delete(session);
        }
    }
}
