package org.domeos.framework.api.model.project.related;

import java.util.List;

/**
 * Created by feiliu206363 on 2016/4/4.
 */
public class AutoBuild {
    private int tag;
    private List<String> branches;

    public int getTag() {
        return tag;
    }

    public void setTag(int tag) {
        this.tag = tag;
    }

    public List<String> getBranches() {
        return branches;
    }

    public void setBranches(List<String> branches) {
        this.branches = branches;
    }
}
