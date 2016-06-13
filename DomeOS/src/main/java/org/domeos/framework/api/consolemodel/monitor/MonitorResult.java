package org.domeos.framework.api.consolemodel.monitor;

import java.util.List;
import java.util.Map;
import java.util.TreeMap;

/**
 * Created by baokangwang on 2016/3/7.
 */
public class MonitorResult {

    private String targetType;
    private int interval;
    private String dataSpec;
    private Map<String, List<Map<String, Double>>> counterResults;

    public MonitorResult() {
        counterResults = new TreeMap<>();

    }

    public MonitorResult(String targetType, int interval, String dataSpec, Map<String, List<Map<String, Double>>> counterResults) {
        this.targetType = targetType;
        this.interval = interval;
        this.dataSpec = dataSpec;
        this.counterResults = counterResults;
    }

    public String getTargetType() {
        return targetType;
    }

    public void setTargetType(String targetType) {
        this.targetType = targetType;
    }

    public int getInterval() {
        return interval;
    }

    public void setInterval(int interval) {
        this.interval = interval;
    }

    public String getDataSpec() {
        return dataSpec;
    }

    public void setDataSpec(String dataSpec) {
        this.dataSpec = dataSpec;
    }

    public Map<String, List<Map<String, Double>>> getCounterResults() {
        return counterResults;
    }

    public void setCounterResults(Map<String, List<Map<String, Double>>> counterResults) {
        this.counterResults = counterResults;
    }
}