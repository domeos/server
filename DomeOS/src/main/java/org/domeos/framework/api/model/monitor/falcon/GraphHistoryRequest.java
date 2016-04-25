package org.domeos.framework.api.model.monitor.falcon;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by baokangwang on 2016/3/1.
 */
public class GraphHistoryRequest {

    private long start;
    private long end;
    private String cf;
    private List<EndpointCounter> endpoint_counters;

    public GraphHistoryRequest() {
        endpoint_counters = new ArrayList<>();
    }

    public GraphHistoryRequest(long start, long end, String cf, List<EndpointCounter> endpoint_counters) {
        this.start = start;
        this.end = end;
        this.cf = cf;
        this.endpoint_counters = endpoint_counters;
    }

    public List<EndpointCounter> getEndpoint_counters() {
        return endpoint_counters;
    }

    public void setEndpoint_counters(List<EndpointCounter> endpoint_counters) {
        this.endpoint_counters = endpoint_counters;
    }

    public long getStart() {
        return start;
    }

    public void setStart(long start) {
        this.start = start;
    }

    public long getEnd() {
        return end;
    }

    public void setEnd(long end) {
        this.end = end;
    }

    public String getCf() {
        return cf;
    }

    public void setCf(String cf) {
        this.cf = cf;
    }
}
