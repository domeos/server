package org.domeos.framework.shiro.session;

import com.google.common.collect.Sets;
import org.apache.log4j.LogManager;
import org.apache.log4j.Logger;
import org.apache.shiro.cache.Cache;
import org.apache.shiro.cache.CacheException;
import org.apache.shiro.util.CollectionUtils;
import org.domeos.util.SerializeUtils;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.io.Serializable;
import java.util.*;

/**
 * Created by feiliu206363 on 2017/2/7.
 */
public class ShrioRedisCache<K, V> implements Cache<K, V> {
    private Logger log = LogManager.getLogger(getClass());
    private RedisTemplate<Serializable, V> redisTemplate;
    private String prefix = "shiro_redis:";

    public ShrioRedisCache(RedisTemplate<Serializable, V> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public ShrioRedisCache(RedisTemplate<Serializable, V> redisTemplate, String prefix) {
        this(redisTemplate);
        this.prefix = prefix;
    }

    @Override
    public V get(K key) throws CacheException {
        if (log.isDebugEnabled()) {
            log.debug("Key: " + key);
        }
        if (key == null) {
            return null;
        }

        byte[] bkey = getByteKey(key);
        return redisTemplate.opsForValue().get(bkey);
    }

    @Override
    public V put(K key, V value) throws CacheException {
        if (log.isDebugEnabled()) {
            log.debug("Key: " + key + ", value: " + value);
        }

        if (key == null || value == null) {
            return null;
        }

        byte[] bkey = getByteKey(key);
        redisTemplate.opsForValue().set(bkey, value);
        return value;
    }

    @Override
    public V remove(K key) throws CacheException {
        if (log.isDebugEnabled()) {
            log.debug("Key: " + key);
        }

        if (key == null) {
            return null;
        }

        byte[] bkey = getByteKey(key);
        ValueOperations<Serializable, V> vo = redisTemplate.opsForValue();
        V value = vo.get(bkey);
        redisTemplate.delete(bkey);
        return value;
    }

    @Override
    public void clear() throws CacheException {
        redisTemplate.getConnectionFactory().getConnection().flushDb();
    }

    @Override
    public int size() {
        Long len = redisTemplate.getConnectionFactory().getConnection().dbSize();
        return len.intValue();
    }

    @SuppressWarnings("unchecked")
    @Override
    public Set<K> keys() {
        byte[] bkey = (prefix + "*").getBytes();
        Set<Serializable> set = redisTemplate.keys(bkey);
        Set<K> result = Sets.newHashSet();

        if (CollectionUtils.isEmpty(set)) {
            return Collections.emptySet();
        }

        for (Serializable key : set) {
            result.add((K) key);
        }
        return result;
    }

    @Override
    public Collection<V> values() {
        Set<K> keys = keys();
        List<V> values = new ArrayList<>(keys.size());
        for (K k : keys) {
            byte[] bkey = getByteKey(k);
            values.add(redisTemplate.opsForValue().get(bkey));
        }
        return values;
    }

    private byte[] getByteKey(K key) {
        if (key instanceof String) {
            String preKey = this.prefix + key;
            return preKey.getBytes();
        } else {
            return SerializeUtils.serialize(key);
        }
    }

    public String getPrefix() {
        return prefix;
    }

    public void setPrefix(String prefix) {
        this.prefix = prefix;
    }
}
