package org.domeos.util.code;


import org.domeos.api.mapper.ci.RSAKeyPairMapper;
import org.domeos.api.mapper.project.SubversionMapper;
import org.domeos.api.model.ci.CodeType;
import org.domeos.api.model.ci.RSAKeyPair;
import org.domeos.api.model.console.git.CodeSourceInfo;
import org.domeos.api.model.git.Subversion;
import org.domeos.api.service.project.impl.ProjectServiceImpl;
import org.domeos.base.BaseTestCase;
import org.domeos.util.RSAKeyPairGenerator;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.context.web.WebAppConfiguration;

import java.util.List;

/**
 * Created by kairen on 16-1-15.
 */
@RunWith(SpringJUnit4ClassRunner.class)
@WebAppConfiguration(value = "src/main/webapp")
@ContextConfiguration(locations = {"file:src/main/webapp/WEB-INF/mvc-dispatcher-servlet.xml"})



public class GitlabApiTest extends BaseTestCase {
    @Autowired
    protected RSAKeyPairMapper rsaKeyPairMapper;

    CodeApiInterface testsvnapi;

    @Before
    public void init(){
        //login("admin", "admin");
        testsvnapi = new GitlabApiWrapper("http://code.sohuno.com", "Q6k4quNvfmtmGb2rPcDa");
        System.out.println("init");
        for(int i = 900; i < 904; i++  )
            create(4422, i);
    }

    public void create(int codeId, int projectId) {
        //rsaKeyPairMapper.deleteRSAKeyPairByProjectId(project.getId());
        RSAKeyPair keyPair = RSAKeyPairGenerator.generateKeyPair();
        int keyId = testsvnapi.setDeployKey(codeId, "DomeOS", keyPair.getPublicKey());
        if (keyId > 0) {
            keyPair.setKeyId(keyId);
            keyPair.setProjectId(projectId);
            rsaKeyPairMapper.addRSAKeyPair(keyPair);
        }
    }

    @After
    public void clean(){
        for(int i = 900; i < 904; i++ ) {
            rsaKeyPairMapper.deleteRSAKeyPairByProjectId(i);
        }
        System.out.println("cleanout");

    }

    @Test
    public void T010getDeployKey(){
        for(int i = 900; i < 904; i++ ) {
            RSAKeyPair keyPair = rsaKeyPairMapper.getRSAKeyPairByProjectId(i);
            System.out.println("DeployId : " + keyPair.getKeyId());
            System.out.println("Figerprint : " + keyPair.getFingerPrint());
            System.out.println("ProjectId" + keyPair.getProjectId() );
        }
        testsvnapi.getDeployKey(4422);
        for(int i = 900; i < 904; i++ ) {
            RSAKeyPair keyPair = rsaKeyPairMapper.getRSAKeyPairByProjectId(i);
            System.out.println("DeployId : " + keyPair.getKeyId());
            System.out.println("Figerprint : " + keyPair.getFingerPrint());
            System.out.println("ProjectId" + keyPair.getProjectId() );
        }
    }

}
