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
    private Double diskTotal = null;
    private Double diskRemain = null;
    private Integer node = null;
    private Integer nodeOnline = null;
    private Integer nodeOffline = null;
    private Integer pod = null;

    public void merge(ResourceOverview other) {
        this.memoryTotal = (other.memoryTotal == null ? this.memoryTotal : other.memoryTotal);
        this.memoryUsed = (other.memoryUsed == null ? this.memoryUsed : other.memoryUsed);
        this.cpu0To25 = (other.cpu0To25 == null ? this.cpu0To25 : other.cpu0To25);
        this.cpu25To50 = (other.cpu25To50 == null ? this.cpu25To50 : other.cpu25To50);
        this.cpu50To75 = (other.cpu50To75 == null ? this.cpu50To75 : other.cpu50To75);
        this.cpu75To100 = (other.cpu75To100 == null ? this.cpu75To100 : other.cpu75To100);
        this.diskTotal = (other.diskTotal == null ? this.diskTotal : other.diskTotal);
        this.diskRemain = (other.diskRemain == null ? this.diskRemain : other.diskRemain);
        this.node = (other.node == null ? this.node : other.node);
        this.nodeOnline = (other.nodeOnline == null ? this.nodeOnline : other.nodeOnline);
        this.nodeOffline = (other.nodeOffline == null ? this.nodeOffline : other.nodeOffline);
        this.pod = (other.pod == null ? this.pod : other.pod);
    }

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

    public Double getDiskTotal() {
        return diskTotal;
    }

    public void setDiskTotal(Double diskTotal) {
        this.diskTotal = diskTotal;
    }

    public Double getDiskRemain() {
        return diskRemain;
    }

    public void setDiskRemain(Double diskRemain) {
        this.diskRemain = diskRemain;
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

    public Integer getPod() {
        return pod;
    }

    public void setPod(Integer pod) {
        this.pod = pod;
    }
}
