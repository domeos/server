package org.domeos.framework.api.consolemodel.monitor;

import org.domeos.framework.api.model.monitor.TargetInfo;

import java.util.List;

/**
 * Created by baokangwang on 2016/3/1.
 */
public class TargetRequest {

    private int clusterId;
    private String targetType;
    private List<TargetInfo> targetInfos;

    public TargetRequest() {
    }

    public TargetRequest(int clusterId, String targetType, List<TargetInfo> targetInfos) {
        this.clusterId = clusterId;
        this.targetType = targetType;
        this.targetInfos = targetInfos;
    }

    public int getClusterId() {
        return clusterId;
    }

    public void setClusterId(int clusterId) {
        this.clusterId = clusterId;
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

        if (!targetType.equals("node") && !targetType.equals("pod") && !targetType.equals("container")) {
            return "target type is invalid";
        }
        if (targetInfos == null){
            return "target info is null";
        }

        for (TargetInfo targetInfo:targetInfos) {
            if (!targetInfo.checkTargetType(targetType)) {
                return "target info is invalid";
            }
        }
        return null;
    }

}
