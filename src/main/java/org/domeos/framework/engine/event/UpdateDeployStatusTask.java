package org.domeos.framework.engine.event;

import com.google.code.yanf4j.util.ConcurrentHashSet;

/**
 * Created by feiliu206363 on 2016/10/11.
 */
public interface UpdateDeployStatusTask {
    ConcurrentHashSet<Integer> UPDATE_DEPLOY_TASK = new ConcurrentHashSet<>();
}
