package org.domeos.client.kubernetesclient.util.streambinder;

/**
 * Created by anningluo on 15-12-6.
 */
public class StreamId<T> {
    private long id;
    public StreamId(long identifier) {
        this.id = identifier;
    }
    public long getIdentifier() {
        return id;
    }
    public T get(Unit t) {
        return (T)t.getData();
    }
}
