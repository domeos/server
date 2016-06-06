package org.domeos.framework.api.model.alarm;

/**
 * Created by baokangwang on 2016/3/31.
 */
public enum OperatorType {

    equal("=="),
    unequal("!="),
    greater(">"),
    equal_greater(">="),
    less("<"),
    equal_less("<=");

    public final String type;

    OperatorType(String type) {
        this.type = type;
    }

    public String getType() {
        return this.type;
    }
}
