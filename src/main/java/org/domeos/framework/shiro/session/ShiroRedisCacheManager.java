package org.domeos.framework.shiro.session;

import org.apache.shiro.cache.AbstractCacheManager;
import org.apache.shiro.cache.Cache;
import org.apache.shiro.cache.CacheException;
import org.apache.shiro.session.Session;
import org.springframework.data.redis.core.RedisTemplate;

import java.io.Serializable;

/**
 * Created by feiliu206363 on 2016/12/21.
 */
public class ShiroRedisCacheManager extends AbstractCacheManager {
    private RedisTemplate<Serializable, Session> redisTemplate;

    public ShiroRedisCacheManager(RedisTemplate<Serializable, Session> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    @Override
    protected Cache<Serializable, Session> createCache(String name) throws CacheException {
        return new ShrioRedisCache<>(redisTemplate, name);
    }
}
