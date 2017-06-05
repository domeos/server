package org.domeos.framework.api.model.alarm;

/**
 * Created by baokangwang on 2016/3/31.
 */
public class StrategyInfo {

    private long id;
    private String metric;
    private String tag;
    private int pointNum;
    private String aggregateType;
    private String operator;
    private double rightValue;
    private String note;
    private int maxStep;

    public StrategyInfo() {
    }

    public StrategyInfo(long id, String metric, String tag, int pointNum, String aggregateType, String operator, double rightValue, String note, int maxStep) {
        this.id = id;
        this.metric = metric;
        this.tag = tag;
        this.pointNum = pointNum;
        this.aggregateType = aggregateType;
        this.operator = operator;
        this.rightValue = rightValue;
        this.note = note;
        this.maxStep = maxStep;
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
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

    public int getPointNum() {
        return pointNum;
    }

    public void setPointNum(int pointNum) {
        this.pointNum = pointNum;
    }

    public String getAggregateType() {
        return aggregateType;
    }

    public void setAggregateType(String aggregateType) {
        this.aggregateType = aggregateType;
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

    public int getMaxStep() {
        return maxStep;
    }

    public void setMaxStep(int maxStep) {
        this.maxStep = maxStep;
    }
}