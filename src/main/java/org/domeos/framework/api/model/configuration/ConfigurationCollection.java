package org.domeos.framework.api.model.configuration;

import org.domeos.framework.engine.model.RowModelBase;
import org.domeos.util.StringUtils;

/**
 * Created by feiliu206363 on 2017/1/19.
 */
public class ConfigurationCollection extends RowModelBase {
    private int creatorId;

    public int getCreatorId() {
        return creatorId;
    }

    public ConfigurationCollection setCreatorId(int creatorId) {
        this.creatorId = creatorId;
        return this;
    }

    public String checkLegality() {
        if (StringUtils.isBlank(getName())) {
            return "name must be set";
        }
        return null;
    }
}
