package org.domeos.framework.shiro.session;

import org.apache.shiro.session.Session;
import org.apache.shiro.session.UnknownSessionException;
import org.apache.shiro.session.mgt.eis.AbstractSessionDAO;
import org.domeos.global.GlobalConstant;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.stereotype.Component;

import java.io.Serializable;
import java.util.Collection;
import java.util.Collections;
import java.util.concurrent.TimeUnit;

/**
 * Created by feiliu206363 on 2016/12/21.
 */
@Component
public class RedisSessionDao extends AbstractSessionDAO {
    private static final String ACTIVE_SESSION = "atv:session:";
    private static final Logger logger = LoggerFactory.getLogger(RedisSessionDao.class);
    private RedisTemplate<Serializable, Session> redisTemplate;
    private ValueOperations<Serializable, Session> sessionOperations;

    public RedisSessionDao(RedisTemplate<Serializable, Session> redisTemplate) {
        this.redisTemplate = redisTemplate;
        sessionOperations = redisTemplate.opsForValue();
    }

    @Override
    protected Serializable doCreate(Session session) {
        final Serializable sessionId = generateSessionId(session);
        assignSessionId(session, sessionId);
        sessionOperations.set(sessionId, session, GlobalConstant.TIME_TO_LIVE_SECONDS, TimeUnit.SECONDS);
        return sessionId;
    }

    @Override
    protected Session doReadSession(Serializable sessionId) {
        return sessionOperations.get(sessionId);
    }

    @Override
    public void update(Session session) throws UnknownSessionException {
        sessionOperations.set(session.getId(), session, GlobalConstant.TIME_TO_LIVE_SECONDS, TimeUnit.SECONDS);
    }

    @Override
    public void delete(Session session) {
        final Serializable sessionId = session.getId();
        redisTemplate.delete(sessionId);
    }

    @Override
    public Collection<Session> getActiveSessions() {
        return Collections.emptySet();
    }
}