package org.domeos.framework.engine.k8s.util.filter;


import io.fabric8.kubernetes.api.model.Pod;
import io.fabric8.kubernetes.api.model.PodList;
import org.domeos.framework.engine.k8s.util.PodUtils;

import java.util.ArrayList;
import java.util.List;

public class PodNotTerminatedFilter implements FilterInplace<PodList> {
    @Override
    public void filter(PodList data) {
        if (data == null || data.getItems() == null) {
            return;
        }
        List<Pod> podList = new ArrayList<>(data.getItems().size());
        for (Pod pod : data.getItems()) {
            if (PodUtils.isTerminal(pod)) {
                continue;
            }
            podList.add(pod);
        }
        data.setItems(podList);
    }
}
