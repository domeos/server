package org.domeos.client.kubernetesclient.util.filter;

/**
 * Created by anningluo on 2016/1/4.
 */
public interface FilterInplace<T> {
    void filter(T data);
}
