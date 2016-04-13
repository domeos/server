package org.domeos.framework.api.model.monitor;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by baokangwang on 2016/3/1.
 */
public class CounterResult {

    private String counter;
    private int interval;
    private List<InstantResult> instantResults;

    public CounterResult() {
        instantResults = new ArrayList<>();
    }

    public CounterResult(String counter, int interval, List<InstantResult> instantResults) {
        this.counter = counter;
        this.interval = interval;
        this.instantResults = instantResults;
    }

    public String getCounter() {
        return counter;
    }

    public void setCounter(String counter) {
        this.counter = counter;
    }

    public int getInterval() {
        return interval;
    }

    public void setInterval(int interval) {
        this.interval = interval;
    }

    public List<InstantResult> getInstantResults() {
        return instantResults;
    }

    public void setInstantResults(List<InstantResult> instantResults) {
        this.instantResults = instantResults;
    }
}
