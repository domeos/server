package org.domeos.framework.api.model.alarm.falcon.portal;

/**
 * Created by baokangwang on 2016/3/1.
 */
public class Expression {

    // expression

    private long id;
    private String expression;
    private String func = "all(#1)";
    private String op = "";
    private String right_value = "";
    private int max_step = 1;
    private int priority = 0;
    private String note = "";
    private long action_id = 0;
    private String create_user = "";
    private boolean pause = false;

    public Expression() {
    }

    public Expression(long id) {
        this.id = id;
    }

    public Expression(long id, String expression, String func, String op, String right_value, int max_step,
                      int priority, String note, long action_id, String create_user, boolean pause) {
        this.id = id;
        this.expression = expression;
        this.func = func;
        this.op = op;
        this.right_value = right_value;
        this.max_step = max_step;
        this.priority = priority;
        this.note = note;
        this.action_id = action_id;
        this.create_user = create_user;
        this.pause = pause;
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public String getExpression() {
        return expression;
    }

    public void setExpression(String expression) {
        this.expression = expression;
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

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

    public long getAction_id() {
        return action_id;
    }

    public void setAction_id(long action_id) {
        this.action_id = action_id;
    }

    public String getCreate_user() {
        return create_user;
    }

    public void setCreate_user(String create_user) {
        this.create_user = create_user;
    }

    public boolean isPause() {
        return pause;
    }

    public void setPause(boolean pause) {
        this.pause = pause;
    }
}
