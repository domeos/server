package org.domeos.framework.api.model.monitor;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by baokangwang on 2016/3/1.
 */
public class TargetResult {

    private TargetInfo targetInfo;
    private List<CounterResult> counterResults;

    public TargetResult() {
        counterResults = new ArrayList<>();
    }

    public TargetResult(TargetInfo targetInfo, List<CounterResult> counterResults) {
        this.targetInfo = targetInfo;
        this.counterResults = counterResults;
    }

    public TargetInfo getTargetInfo() {
        return targetInfo;
    }

    public void setTargetInfo(TargetInfo targetInfo) {
        this.targetInfo = targetInfo;
    }

    public List<CounterResult> getCounterResults() {
        return counterResults;
    }

    public void setCounterResults(List<CounterResult> counterResults) {
        this.counterResults = counterResults;
    }
}
