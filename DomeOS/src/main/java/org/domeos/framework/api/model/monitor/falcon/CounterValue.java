package org.domeos.framework.api.model.monitor.falcon;

/**
 * Created by baokangwang on 2016/3/1.
 */
public class CounterValue {

    private long timestamp;
    private Double value;

    public CounterValue() {
    }

    public CounterValue(long timestamp, Double value) {
        this.timestamp = timestamp;
        this.value = value;
    }

    public Double getValue() {
        return value;
    }

    public void setValue(Double value) {
        this.value = value;
    }

    public long getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(long timestamp) {
        this.timestamp = timestamp;
    }
}
