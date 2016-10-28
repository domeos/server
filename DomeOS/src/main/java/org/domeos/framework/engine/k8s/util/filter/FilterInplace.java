package org.domeos.framework.engine.k8s.util.filter;

/**
 * Created by anningluo on 2016/1/4.
 */
public interface FilterInplace<T> {
    void filter(T data);
}
