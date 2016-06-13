package org.domeos.framework.api.biz.base.impl;

import org.domeos.framework.engine.model.RowModelBase;

import java.util.HashSet;
import java.util.Set;

/**
 * Created by sparkchen on 16/4/5.
 */
public class Model2 extends RowModelBase {
    private int field1 = 100;
    private String field2 = "101";
    private float field3 = 1.1f;
    private int column1 = 10;

    public static Set<String> toExclude = new HashSet<String>(){{
        addAll(RowModelBase.toExclude);
        add("column1");
    }};
    @Override
    public Set<String> excludeForJSON() {
        return toExclude;
    }

    public int getColumn1() {
        return column1;
    }

    public void setColumn1(int column1) {
        this.column1 = column1;
    }

    public int getField1() {
        return field1;
    }

    public void setField1(int field1) {
        this.field1 = field1;
    }

    public String getField2() {
        return field2;
    }

    public void setField2(String field2) {
        this.field2 = field2;
    }

    public float getField3() {
        return field3;
    }

    public void setField3(float field3) {
        this.field3 = field3;
    }
}
