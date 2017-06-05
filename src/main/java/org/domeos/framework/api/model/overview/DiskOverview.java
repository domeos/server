package org.domeos.framework.api.model.overview;

/**
 * Created by junwuguo on 2017/3/3 0003.
 */
public class DiskOverview {
    private Double diskTotal = null;
    private Double diskRemain = null;

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
}
