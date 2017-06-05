package org.domeos.framework.api.model.monitor.falcon;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

/**
 * Created by baokangwang on 2016/3/1.
 */
public class GraphHistoryResponse {

    private String endpoint;
    private String counter;
    private String dstype;
    private int step;
    @JsonProperty(value = "Values")
    private List<CounterValue> Values;

    public GraphHistoryResponse() {
    }

    public GraphHistoryResponse(String endpoint, String counter, String dstype, int step, List<CounterValue> values) {
        this.endpoint = endpoint;
        this.counter = counter;
        this.dstype = dstype;
        this.step = step;
        Values = values;
    }

    public String getEndpoint() {
        return endpoint;
    }

    public void setEndpoint(String endpoint) {
        this.endpoint = endpoint;
    }

    public String getCounter() {
        return counter;
    }

    public void setCounter(String counter) {
        this.counter = counter;
    }

    public String getDstype() {
        return dstype;
    }

    public void setDstype(String dstype) {
        this.dstype = dstype;
    }

    public int getStep() {
        return step;
    }

    public void setStep(int step) {
        this.step = step;
    }

    public List<CounterValue> getValues() {
        return Values;
    }

    public void setValues(List<CounterValue> values) {
        Values = values;
    }
}
