package org.domeos.util.code;


import org.domeos.base.BaseTestCase;
import org.junit.runner.RunWith;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.context.web.WebAppConfiguration;

/**
 * Created by kairen on 16-1-15.
 */
@RunWith(SpringJUnit4ClassRunner.class)
@WebAppConfiguration(value = "src/main/webapp")
@ContextConfiguration(locations = {"file:src/main/webapp/WEB-INF/mvc-dispatcher-servlet.xml"})



public class GitlabApiTest extends BaseTestCase {
//    @Autowired
//    protected RSAKeyPairMapper rsaKeyPairMapper;
//
//    CodeApiInterface testsvnapi;
//
//    @Before
//    public void init(){
//        //login("admin", "admin");
//        testsvnapi = new GitlabApiWrapper("http://test.com", "test");
//        System.out.println("init");
//        for(int i = 900; i < 904; i++  )
//            create(4422, i);
//    }
//
//    public void create(int codeId, int projectId) {
//        //rsaKeyPairMapper.deleteRSAKeyPairByProjectId(project.getId());
//        RSAKeyPair keyPair = RSAKeyPairGenerator.generateKeyPair();
//        int keyId = testsvnapi.setDeployKey(codeId, "DomeOS", keyPair.getPublicKey());
//        if (keyId > 0) {
//            keyPair.setKeyId(keyId);
//            keyPair.setProjectId(projectId);
//            rsaKeyPairMapper.addRSAKeyPair(keyPair);
//        }
//    }
//
//    @After
//    public void clean(){
//        for(int i = 900; i < 904; i++ ) {
//            rsaKeyPairMapper.deleteRSAKeyPairByProjectId(i);
//        }
//        System.out.println("cleanout");
//
//    }
//
//    @Test
//    public void T010getDeployKey(){
//        for(int i = 900; i < 904; i++ ) {
//            RSAKeyPair keyPair = rsaKeyPairMapper.getRSAKeyPairByProjectId(i);
//            System.out.println("DeployId : " + keyPair.getKeyId());
//            System.out.println("Figerprint : " + keyPair.getFingerPrint());
//            System.out.println("ProjectId" + keyPair.getProjectId() );
//        }
//        testsvnapi.getDeployKey(4422);
//        for(int i = 900; i < 904; i++ ) {
//            RSAKeyPair keyPair = rsaKeyPairMapper.getRSAKeyPairByProjectId(i);
//            System.out.println("DeployId : " + keyPair.getKeyId());
//            System.out.println("Figerprint : " + keyPair.getFingerPrint());
//            System.out.println("ProjectId" + keyPair.getProjectId() );
//        }
//    }

}
