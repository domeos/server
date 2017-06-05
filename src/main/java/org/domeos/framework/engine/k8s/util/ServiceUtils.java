package org.domeos.framework.engine.k8s.util;

import io.fabric8.kubernetes.api.model.Service;

import java.util.Map;

/**
 * Created by anningluo on 2015/12/10.
 */
public class ServiceUtils {
    public static String getName(Service svc) {
        if (svc == null || svc.getMetadata() == null) {
            return null;
        }
        return svc.getMetadata().getName();
    }

    // this function will return an empty selector if it has an empty selector
    // and that case is often used as a way to access the host outside the
    // kubernetes cluster.
    // It will return null if there is not enough information to infer the selector
    public static Map<String, String> getSelector(Service svc) {
        if (svc == null || svc.getSpec() == null) {
            return null;
        }
        return svc.getSpec().getSelector();

    }
}
