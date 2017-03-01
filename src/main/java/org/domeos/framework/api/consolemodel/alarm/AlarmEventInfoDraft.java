package org.domeos.framework.api.consolemodel.alarm;

/**
 * Created by baokangwang on 2016/3/31.
 */
public class AlarmEventInfoDraft {

    private String id;
    private String endpoint;
    private String metric;
    private String counter;
    private String func;
    private String left_value;
    private String operator;
    private String right_value;
    private String note;
    private int max_step;
    private int current_step;
    private int priority;
    private String status;
    private long timestamp;
    private int expression_id;
    private int strategy_id;
    private int template_id;

    public AlarmEventInfoDraft() {
    }

    public AlarmEventInfoDraft(String id, String endpoint, String metric, String counter, String func, String left_value,
                               String operator, String right_value, String note, int max_step, int current_step,
                               int priority, String status, long timestamp, int expression_id, int strategy_id, int template_id) {
        this.id = id;
        this.endpoint = endpoint;
        this.metric = metric;
        this.counter = counter;
        this.func = func;
        this.left_value = left_value;
        this.operator = operator;
        this.right_value = right_value;
        this.note = note;
        this.max_step = max_step;
        this.current_step = current_step;
        this.priority = priority;
        this.status = status;
        this.timestamp = timestamp;
        this.expression_id = expression_id;
        this.strategy_id = strategy_id;
        this.template_id = template_id;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getEndpoint() {
        return endpoint;
    }

    public void setEndpoint(String endpoint) {
        this.endpoint = endpoint;
    }

    public String getMetric() {
        return metric;
    }

    public void setMetric(String metric) {
        this.metric = metric;
    }

    public String getCounter() {
        return counter;
    }

    public void setCounter(String counter) {
        this.counter = counter;
    }

    public String getFunc() {
        return func;
    }

    public void setFunc(String func) {
        this.func = func;
    }

    public String getLeft_value() {
        return left_value;
    }

    public void setLeft_value(String left_value) {
        this.left_value = left_value;
    }

    public String getOperator() {
        return operator;
    }

    public void setOperator(String operator) {
        this.operator = operator;
    }

    public String getRight_value() {
        return right_value;
    }

    public void setRight_value(String right_value) {
        this.right_value = right_value;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

    public int getMax_step() {
        return max_step;
    }

    public void setMax_step(int max_step) {
        this.max_step = max_step;
    }

    public int getCurrent_step() {
        return current_step;
    }

    public void setCurrent_step(int current_step) {
        this.current_step = current_step;
    }

    public int getPriority() {
        return priority;
    }

    public void setPriority(int priority) {
        this.priority = priority;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public long getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(long timestamp) {
        this.timestamp = timestamp;
    }

    public int getExpression_id() {
        return expression_id;
    }

    public void setExpression_id(int expression_id) {
        this.expression_id = expression_id;
    }

    public int getStrategy_id() {
        return strategy_id;
    }

    public void setStrategy_id(int strategy_id) {
        this.strategy_id = strategy_id;
    }

    public int getTemplate_id() {
        return template_id;
    }

    public void setTemplate_id(int template_id) {
        this.template_id = template_id;
    }
}