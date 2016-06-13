package org.domeos.client.kubernetesclient.util.streambinder;

/**
 * Created by anningluo on 15-12-6.
 */
public class Unit {
    private long identifier;
    private Object data;

    public long getIdentifier() {
        return identifier;
    }

    public void setIdentifier(long id) {
        this.identifier = identifier;
    }

    public Object getData() {
        return data;
    }

    public void setData(Object data) {
        this.data = data;
    }
}
