package org.domeos.framework.engine.k8s.util.filter;


import io.fabric8.kubernetes.api.model.Pod;
import io.fabric8.kubernetes.api.model.PodList;
import org.domeos.framework.engine.k8s.util.PodBriefStatus;
import org.domeos.framework.engine.k8s.util.PodUtils;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by anningluo on 2016/1/4.
 */
public class PodSuccessRunningFilter implements FilterInplace<PodList> {

    @Override
    public void filter(PodList data) {
        if (data == null || data.getItems() == null) {
            return;
        }
        List<Pod> podList = new ArrayList<>(data.getItems().size());
        for (Pod pod : data.getItems()) {
            if (PodBriefStatus.SuccessRunning.equals(PodUtils.getStatus(pod))) {
                podList.add(pod);
            }
        }
        data.setItems(podList);
    }
}
