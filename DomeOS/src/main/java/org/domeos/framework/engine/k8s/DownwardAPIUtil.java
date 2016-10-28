package org.domeos.framework.engine.k8s;

import io.fabric8.kubernetes.api.model.EnvVar;
import io.fabric8.kubernetes.api.model.EnvVarSource;
import io.fabric8.kubernetes.api.model.ObjectFieldSelector;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by xupeng on 16-2-29.
 */
public class DownwardAPIUtil {
    public static List<EnvVar> generateDownwardEnvs() {
        List<EnvVar> envs = new ArrayList<>(3);
        envs.add(generateDownwardEnv("MY_POD_NAME", "metadata.name"));
        envs.add(generateDownwardEnv("MY_POD_NAMESPACE", "metadata.namespace"));
        envs.add(generateDownwardEnv("MY_POD_IP", "status.podIP"));
        // not supported yet
//        envs.add(generateDownwardEnv("MY_HOST_IP", "status.hostIP"));
//        envs.add(generateDownwardEnv("MY_NODE_NAME", "spec.nodeName"));
        return envs;
    }

    public static EnvVar generateDownwardEnv(String name, String fieldPath) {
        EnvVar var = new EnvVar();
        var.setName(name);
        EnvVarSource source = new EnvVarSource();
        ObjectFieldSelector fieldRef = new ObjectFieldSelector();
        fieldRef.setFieldPath(fieldPath);
        source.setFieldRef(fieldRef);
        var.setValueFrom(source);
        return var;
    }
}
