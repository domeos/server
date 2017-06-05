package org.domeos.framework.api.model.overview.related;

/**
 * Created by junwuguo on 2017/3/15 0015.
 */
public class DeploymentOnlineDetail {
    private Integer startNumber = 0;
    private Integer updateNumber = 0;
    private Integer rollbackNumber = 0;
    private Integer scaleUpNumber = 0;
    private Integer scaleDownNumber = 0;

    public Integer getStartNumber() {
        return startNumber;
    }

    public void setStartNumber(Integer startNumber) {
        this.startNumber = startNumber;
    }

    public Integer getUpdateNumber() {
        return updateNumber;
    }

    public void setUpdateNumber(Integer updateNumber) {
        this.updateNumber = updateNumber;
    }

    public Integer getRollbackNumber() {
        return rollbackNumber;
    }

    public void setRollbackNumber(Integer rollbackNumber) {
        this.rollbackNumber = rollbackNumber;
    }

    public Integer getScaleUpNumber() {
        return scaleUpNumber;
    }

    public void setScaleUpNumber(Integer scaleUpNumber) {
        this.scaleUpNumber = scaleUpNumber;
    }

    public Integer getScaleDownNumber() {
        return scaleDownNumber;
    }

    public void setScaleDownNumber(Integer scaleDownNumber) {
        this.scaleDownNumber = scaleDownNumber;
    }
}
