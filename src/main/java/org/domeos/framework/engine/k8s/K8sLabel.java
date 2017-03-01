package org.domeos.framework.engine.k8s;

import java.util.HashMap;

/**
 * Created by sparkchen on 16/4/12.
 */
public class K8sLabel extends HashMap<String, String> {
    public K8sLabel() {
    }
    public K8sLabel(String key, String value) {
        this.put(key, value);
    }
    public void add(String key, String value) {
        this.put(key, value);
    }
}
