package org.domeos.framework.api.biz.project;

import org.domeos.base.BaseTestCase;
import org.domeos.framework.api.model.ci.BuildHistory;
import org.junit.Test;
import org.springframework.beans.factory.annotation.Autowired;

/**
 * Created by feiliu206363 on 2016/4/7.
 */
public class ProjectBizTest extends BaseTestCase {
    @Autowired
    ProjectBiz projectBiz;

    @Test
    public void testInsertRow() throws Exception {
        BuildHistory history = new BuildHistory();
        history.setName("test");
        history.setSecret("aaa");
        history.setProjectId(1);
        projectBiz.addBuildHistory(history);
    }

}