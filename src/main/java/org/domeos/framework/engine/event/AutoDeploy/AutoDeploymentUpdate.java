package org.domeos.framework.engine.event.AutoDeploy;

import org.domeos.framework.engine.event.DMEvent;

/**
 * Created by feiliu206363 on 2016/11/4.
 */
public class AutoDeploymentUpdate extends DMEvent<AutoUpdateInfo> {
    public AutoDeploymentUpdate(AutoUpdateInfo source) {
        super(source);
    }
}
