package org.domeos.framework.api.model.alarm.falcon.portal;

import java.sql.Timestamp;

/**
 * Created by baokangwang on 2016/3/1.
 */
public class Mockcfg {

    // mockcfg

    private long id;
    private String name = "";
    private String obj = "";
    private String obj_type = "";
    private String metric = "";
    private String tags = "";
    private String dstype = "GAUGE";
    private long step = 60;
    private double mock = 0;
    private String creator = "";
    private Timestamp t_create;
    private Timestamp t_modify = new Timestamp(System.currentTimeMillis());

    public Mockcfg() {
    }

    public Mockcfg(long id) {
        this.id = id;
    }

    public Mockcfg(long id, String name, String obj, String obj_type, String metric, String tags, String dstype,
                   long step, double mock, String creator, Timestamp t_create, Timestamp t_modify) {
        this.id = id;
        this.name = name;
        this.obj = obj;
        this.obj_type = obj_type;
        this.metric = metric;
        this.tags = tags;
        this.dstype = dstype;
        this.step = step;
        this.mock = mock;
        this.creator = creator;
        this.t_create = t_create;
        this.t_modify = t_modify;
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getObj() {
        return obj;
    }

    public void setObj(String obj) {
        this.obj = obj;
    }

    public String getObj_type() {
        return obj_type;
    }

    public void setObj_type(String obj_type) {
        this.obj_type = obj_type;
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

    public String getDstype() {
        return dstype;
    }

    public void setDstype(String dstype) {
        this.dstype = dstype;
    }

    public long getStep() {
        return step;
    }

    public void setStep(long step) {
        this.step = step;
    }

    public double getMock() {
        return mock;
    }

    public void setMock(double mock) {
        this.mock = mock;
    }

    public String getCreator() {
        return creator;
    }

    public void setCreator(String creator) {
        this.creator = creator;
    }

    public Timestamp getT_create() {
        return t_create;
    }

    public void setT_create(Timestamp t_create) {
        this.t_create = t_create;
    }

    public Timestamp getT_modify() {
        return t_modify;
    }

    public void setT_modify(Timestamp t_modify) {
        this.t_modify = t_modify;
    }
}
