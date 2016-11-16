package org.domeos.framework.api.consolemodel.alarm;

import org.domeos.framework.api.model.alarm.HostInfo;

import java.util.Comparator;

/**
 * Created by baokangwang on 2016/3/31.
 */
public class AlarmEventInfo {

    private String id;
    private String templateType;
    private HostInfo hostInfo;
    private DeploymentAlarmInfo deploymentAlarmInfo;
    private String metric;
    private String tag;
    private double leftValue;
    private String operator;
    private double rightValue;
    private String note;
    private int currentStep;
    private int maxStep;
    private long timeStamp;

    public AlarmEventInfo() {
    }

    public AlarmEventInfo(String id, String templateType, HostInfo hostInfo, DeploymentAlarmInfo deploymentAlarmInfo,
                          String metric, String tag, double leftValue, String operator, double rightValue, String note,
                          int currentStep, int maxStep, long timeStamp, long creatorId) {
        this.id = id;
        this.templateType = templateType;
        this.hostInfo = hostInfo;
        this.deploymentAlarmInfo = deploymentAlarmInfo;
        this.metric = metric;
        this.tag = tag;
        this.leftValue = leftValue;
        this.operator = operator;
        this.rightValue = rightValue;
        this.note = note;
        this.currentStep = currentStep;
        this.maxStep = maxStep;
        this.timeStamp = timeStamp;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTemplateType() {
        return templateType;
    }

    public void setTemplateType(String templateType) {
        this.templateType = templateType;
    }

    public HostInfo getHostInfo() {
        return hostInfo;
    }

    public void setHostInfo(HostInfo hostInfo) {
        this.hostInfo = hostInfo;
    }

    public DeploymentAlarmInfo getDeploymentAlarmInfo() {
        return deploymentAlarmInfo;
    }

    public void setDeploymentAlarmInfo(DeploymentAlarmInfo deploymentAlarmInfo) {
        this.deploymentAlarmInfo = deploymentAlarmInfo;
    }

    public String getMetric() {
        return metric;
    }

    public void setMetric(String metric) {
        this.metric = metric;
    }

    public String getTag() {
        return tag;
    }

    public void setTag(String tag) {
        this.tag = tag;
    }

    public double getLeftValue() {
        return leftValue;
    }

    public void setLeftValue(double leftValue) {
        this.leftValue = leftValue;
    }

    public String getOperator() {
        return operator;
    }

    public void setOperator(String operator) {
        this.operator = operator;
    }

    public double getRightValue() {
        return rightValue;
    }

    public void setRightValue(double rightValue) {
        this.rightValue = rightValue;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

    public int getCurrentStep() {
        return currentStep;
    }

    public void setCurrentStep(int currentStep) {
        this.currentStep = currentStep;
    }

    public int getMaxStep() {
        return maxStep;
    }

    public void setMaxStep(int maxStep) {
        this.maxStep = maxStep;
    }

    public long getTimeStamp() {
        return timeStamp;
    }

    public void setTimeStamp(long timeStamp) {
        this.timeStamp = timeStamp;
    }

    public static class AlarmEventInfoComparator implements Comparator<AlarmEventInfo> {
        @Override
        public int compare(AlarmEventInfo t1, AlarmEventInfo t2) {
            if (t2.getTimeStamp() - t1.getTimeStamp() > 0) {
                return 1;
            } else if (t2.getTimeStamp() - t1.getTimeStamp() < 0) {
                return -1;
            } else {
                return 0;
            }
        }
    }
}
