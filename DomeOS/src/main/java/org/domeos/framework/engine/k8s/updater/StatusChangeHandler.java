package org.domeos.framework.engine.k8s.updater;

/**
 * Created by anningluo on 2015/12/17.
 */
public interface StatusChangeHandler<T> {
    void handleStatusChange(final T status);
}
