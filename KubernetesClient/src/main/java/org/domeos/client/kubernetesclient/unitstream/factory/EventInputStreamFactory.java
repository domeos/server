package org.domeos.client.kubernetesclient.unitstream.factory;

import org.domeos.client.kubernetesclient.definitions.v1.Event;
import org.domeos.client.kubernetesclient.unitstream.ClosableUnitInputStream;
import org.domeos.client.kubernetesclient.unitstream.WatchEventUnitInputStream;

/**
 * Created by xupeng on 16-3-28.
 */
public class EventInputStreamFactory implements ClosableUnitInputStreamFactory<Event> {
    @Override
    public ClosableUnitInputStream<Event> createUnitInputStream() {
        return new WatchEventUnitInputStream<Event>() {
            @Override
            protected Class<Event> getDefinitionClass() {
                return Event.class;
            }
        };
    }
}
