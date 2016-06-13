package org.domeos.client.kubernetesclient.util.filter;

import org.domeos.client.kubernetesclient.definitions.v1.Pod;
import org.domeos.client.kubernetesclient.definitions.v1.PodList;
import org.domeos.client.kubernetesclient.util.PodUtils;

import java.util.ArrayList;
import java.util.List;

public class PodNotTerminatedFilter implements FilterInplace<PodList> {
    @Override
    public void filter(PodList data) {
        if (data == null || data.getItems() == null) {
            return;
        }
        List<Pod> podList = new ArrayList<Pod>(data.getItems().length);
        for (Pod pod : data.getItems()) {
            if (PodUtils.isTerminal(pod))
                continue;
            podList.add(pod);
        }
        data.setItems(podList.toArray(new Pod[podList.size()]));
    }
}
