package org.domeos.client.kubernetesclient.unitstream.factory;

import org.domeos.client.kubernetesclient.definitions.v1.Pod;
import org.domeos.client.kubernetesclient.unitstream.ClosableUnitInputStream;
import org.domeos.client.kubernetesclient.unitstream.WatchEventUnitInputStream;

/**
 * Created by anningluo on 15-12-4.
 */
public class PodInputStreamFactory implements ClosableUnitInputStreamFactory<Pod> {
    public ClosableUnitInputStream<Pod> createUnitInputStream() {
        return new WatchEventUnitInputStream<Pod>() {
            @Override
            protected Class<Pod> getDefinitionClass() {
                return Pod.class;
            }
        };
    }
}
