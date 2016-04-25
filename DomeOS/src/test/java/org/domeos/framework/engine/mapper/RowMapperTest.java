package org.domeos.framework.engine.mapper;

import org.domeos.base.BaseTestCase;
import org.domeos.framework.api.model.project.Project;
import org.domeos.framework.engine.model.CustomObjectMapper;
import org.junit.Test;
import org.springframework.beans.factory.annotation.Autowired;

/**
 * Created by feiliu206363 on 2016/4/5.
 */
public class RowMapperTest extends BaseTestCase {
    @Autowired
    RowMapper rowMapper;

    @Autowired
    CustomObjectMapper objectMapper;

    @Test
    public void T010Create() {
        String dataString = "";
        Project project = new Project();
        project.setName("mytest");
        project.setAuthority(1);
//        project.setId(10);
        project.setCreateTime(System.currentTimeMillis());
        System.out.println(project.toString());
//        rowMapper.insertProject(project, project.toString());
        System.out.println("!!!!!!! id = " + project.getId());
//        RowMapperDao dao = rowMapper.getById("project", 1);
//        System.out.println(dao.toString());
    }
}