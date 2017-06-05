package org.domeos.framework.api.model.overview;

import java.util.List;

/**
 * Created by junwuguo on 2017/2/21 0021.
 */
public class ProjectOverview {
    private List<Integer> autoBuild;
    private List<Integer> manualBuild;

    public List<Integer> getAutoBuild() {
        return autoBuild;
    }

    public void setAutoBuild(List<Integer> autoBuild) {
        this.autoBuild = autoBuild;
    }

    public List<Integer> getManualBuild() {
        return manualBuild;
    }

    public void setManualBuild(List<Integer> manualBuild) {
        this.manualBuild = manualBuild;
    }
}
