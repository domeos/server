package org.domeos.framework.api.model.global;

/**
 * Created by feiliu206363 on 2015/12/23.
 */
public class CpuMonitorInfo {

    long timeStamp;
    double value;

    public CpuMonitorInfo() {
    }

    public CpuMonitorInfo(long timeStamp, double value) {
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
