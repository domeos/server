package org.domeos.util.code;


import org.domeos.api.mapper.project.SubversionMapper;
import org.domeos.api.model.ci.CodeType;
import org.domeos.api.model.console.git.CodeSourceInfo;
import org.domeos.api.model.git.Subversion;
import org.domeos.api.service.project.impl.ProjectServiceImpl;
import org.junit.Before;
import org.junit.After;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.web.WebAppConfiguration;

import java.util.List;

/**
 * Created by kairen on 16-1-15.
 */
@WebAppConfiguration
@RunWith(org.domeos.base.JUnit4ClassRunner.class)
@ContextConfiguration(locations = {"file:src/main/webapp/WEB-INF/mvc-dispatcher-servlet.xml"})



public class SubversionApiTest {
    @Autowired
    protected SubversionMapper subversionMapper;
    @Autowired
    protected ProjectServiceImpl projectService;

    CodeApiInterface testsvnapi;

    @Before
    public void init(){
        Subversion svn = new Subversion(20, "rkasdf", "123456", System.currentTimeMillis(), "svn://10.2.86.82/test123/trunk/ttttt");
        //subversionMapper.addSubversionInfo(svn);
        testsvnapi = ReflectFactory.createCodeApiInterface(CodeType.subversion.getCodeType(), 0);
        System.out.println("init");


    }

    @After
    public void clean(){
        subversionMapper.deleteSubversionInfoById(40);
        System.out.println("test");

    }

    @Test
    public void T010listEntires(){
        //testsvnapi.listEntries("");
    }

    @Test
    public void T020getFile(){
       // byte[]  dockerfile = testsvnapi.getFile("tomcat_docker/Dockerfile");

        //System.out.println(dockerfile);
    }

    @Test
    public void T030getNoFile(){
        //byte[] dockerfile = testsvnapi.getFile("tomcat_docker/dddd");
        //System.out.println(dockerfile);
    }
    @Test
    public void T040listCodeInfo(){
        List<CodeSourceInfo> testlist = testsvnapi.listCodeInfo(20);
        System.out.println(testlist);

    }

    @Test
    public void T050getCommitinfo(){
        testsvnapi.getCommitInfo(1,"");

    }
}
