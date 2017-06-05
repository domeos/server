package org.domeos.framework.api.model.overview;

/**
 * Created by junwuguo on 2017/2/27 0027.
 */
public class ResourceOverview {
    private Double memoryTotal = null;
    private Double memoryUsed = null;
    private Integer cpu0To25 = null;
    private Integer cpu25To50 = null;
    private Integer cpu50To75 = null;
    private Integer cpu75To100 = null;
    private Integer node = null;
    private Integer nodeOnline = null;
    private Integer nodeOffline = null;

    public Double getMemoryTotal() {
        return memoryTotal;
    }

    public void setMemoryTotal(Double memoryTotal) {
        this.memoryTotal = memoryTotal;
    }

    public Double getMemoryUsed() {
        return memoryUsed;
    }

    public void setMemoryUsed(Double memoryUsed) {
        this.memoryUsed = memoryUsed;
    }

    public Integer getCpu0To25() {
        return cpu0To25;
    }

    public void setCpu0To25(Integer cpu0To25) {
        this.cpu0To25 = cpu0To25;
    }

    public Integer getCpu25To50() {
        return cpu25To50;
    }

    public void setCpu25To50(Integer cpu25To50) {
        this.cpu25To50 = cpu25To50;
    }

    public Integer getCpu50To75() {
        return cpu50To75;
    }

    public void setCpu50To75(Integer cpu50To75) {
        this.cpu50To75 = cpu50To75;
    }

    public Integer getCpu75To100() {
        return cpu75To100;
    }

    public void setCpu75To100(Integer cpu75To100) {
        this.cpu75To100 = cpu75To100;
    }

    public Integer getNode() {
        return node;
    }

    public void setNode(Integer node) {
        this.node = node;
    }

    public Integer getNodeOnline() {
        return nodeOnline;
    }

    public void setNodeOnline(Integer nodeOnline) {
        this.nodeOnline = nodeOnline;
    }

    public Integer getNodeOffline() {
        return nodeOffline;
    }

    public void setNodeOffline(Integer nodeOffline) {
        this.nodeOffline = nodeOffline;
    }
}
