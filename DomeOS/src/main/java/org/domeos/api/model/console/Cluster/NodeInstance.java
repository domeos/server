package org.domeos.api.model.console.Cluster;

import org.domeos.api.model.console.deployment.Instance;

import java.util.LinkedList;
import java.util.List;

/**
 * Created by feiliu206363 on 2015/12/25.
 */
public class NodeInstance {
    String nodeName;
    List<Instance> instances;

    public String getNodeName() {
        return nodeName;
    }

    public void setNodeName(String nodeName) {
        this.nodeName = nodeName;
    }

    public List<Instance> getInstances() {
        return instances;
    }

    public void setInstances(List<Instance> instances) {
        this.instances = instances;
    }

    public void addInstance(Instance instance) {
        if (instance == null) {
            return;
        }
        if (instances == null) {
            instances = new LinkedList<>();
        }
        instances.add(instance);
    }
}
