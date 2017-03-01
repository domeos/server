package org.domeos.framework.api.model.alarm.falcon.portal;

/**
 * Created by baokangwang on 2016/3/1.
 */
public class Strategy {

    // strategy

    private long id;
    private String metric = "";
    private String tags = "";
    private int max_step = 1;
    private int priority = 0;
    private String func = "all(#1)";
    private String op = "";
    private String right_value;
    private String note = "";
    private String run_begin = "";
    private String run_end = "";
    private long tpl_id = 0;

    public Strategy() {
    }

    public Strategy(long id) {
        this.id = id;
    }

    public Strategy(long id, String metric, String tags, int max_step, int priority, String func, String op,
                    String right_value, String note, String run_begin, String run_end, long tpl_id) {
        this.id = id;
        this.metric = metric;
        this.tags = tags;
        this.max_step = max_step;
        this.priority = priority;
        this.func = func;
        this.op = op;
        this.right_value = right_value;
        this.note = note;
        this.run_begin = run_begin;
        this.run_end = run_end;
        this.tpl_id = tpl_id;
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

    public String getTags() {
        return tags;
    }

    public void setTags(String tags) {
        this.tags = tags;
    }

    public int getMax_step() {
        return max_step;
    }

    public void setMax_step(int max_step) {
        this.max_step = max_step;
    }

    public int getPriority() {
        return priority;
    }

    public void setPriority(int priority) {
        this.priority = priority;
    }

    public String getFunc() {
        return func;
    }

    public void setFunc(String func) {
        this.func = func;
    }

    public String getOp() {
        return op;
    }

    public void setOp(String op) {
        this.op = op;
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

    public String getRun_begin() {
        return run_begin;
    }

    public void setRun_begin(String run_begin) {
        this.run_begin = run_begin;
    }

    public String getRun_end() {
        return run_end;
    }

    public void setRun_end(String run_end) {
        this.run_end = run_end;
    }

    public long getTpl_id() {
        return tpl_id;
    }

    public void setTpl_id(long tpl_id) {
        this.tpl_id = tpl_id;
    }
}
