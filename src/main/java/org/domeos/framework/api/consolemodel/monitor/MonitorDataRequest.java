package org.domeos.framework.api.consolemodel.monitor;

import org.domeos.framework.api.model.monitor.TargetInfo;

import java.util.List;

/**
 * Created by baokangwang on 2016/3/1.
 */
public class MonitorDataRequest {

    private long startTime;
    private long endTime;
    private String dataSpec;
    private String targetType;
    private List<TargetInfo> targetInfos;

    public MonitorDataRequest() {
    }

    public MonitorDataRequest(long startTime, long endTime, String dataSpec, String targetType, List<TargetInfo> targetInfos) {
        this.startTime = startTime;
        this.endTime = endTime;
        this.dataSpec = dataSpec;
        this.targetType = targetType;
        this.targetInfos = targetInfos;
    }

    public long getStartTime() {
        return startTime;
    }

    public void setStartTime(long startTime) {
        this.startTime = startTime;
    }

    public long getEndTime() {
        return endTime;
    }

    public void setEndTime(long endTime) {
        this.endTime = endTime;
    }

    public String getDataSpec() {
        return dataSpec;
    }

    public void setDataSpec(String dataSpec) {
        this.dataSpec = dataSpec;
    }

    public String getTargetType() {
        return targetType;
    }

    public void setTargetType(String targetType) {
        this.targetType = targetType;
    }

    public List<TargetInfo> getTargetInfos() {
        return targetInfos;
    }

    public void setTargetInfos(List<TargetInfo> targetInfos) {
        this.targetInfos = targetInfos;
    }

    public String checkLegality() {

        if (startTime > endTime) {
            return "time range is invalid";
        }
        if (!dataSpec.equals("AVERAGE") && !dataSpec.equals("MAX") && !dataSpec.equals("MIN")) {
            return "data spec is invalid";
        }
        if (!targetType.equals("node") && !targetType.equals("pod") && !targetType.equals("container")) {
            return "target type is invalid";
        }
        if (targetInfos == null){
            return "target info is null";
        }
        if (targetInfos.size() == 0) {
            return "target info is empty";
        }

        for (TargetInfo targetInfo : targetInfos) {
            if (!targetInfo.checkTargetType(targetType)) {
                return "target info is invalid";
            }
        }

        return null;
    }
}