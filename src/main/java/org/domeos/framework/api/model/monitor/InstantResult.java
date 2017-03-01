package org.domeos.framework.api.model.monitor;

/**
 * Created by baokangwang on 2016/3/1.
 */
public class InstantResult {

    private long timeStamp;
    private double value;

    public InstantResult() {
    }

    public InstantResult(long timeStamp, double value) {
        this.timeStamp = timeStamp;
        this.value = value;
    }

    public long getTimeStamp() {
        return timeStamp;
    }

    public void setTimeStamp(long timeStamp) {
        this.timeStamp = timeStamp;
    }

    public double getValue() {
        return value;
    }

    public void setValue(double value) {
        this.value = value;
    }
}
