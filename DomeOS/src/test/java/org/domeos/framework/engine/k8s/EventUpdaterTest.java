package org.domeos.framework.engine.k8s;

import org.domeos.base.WebContextLoader;
import org.domeos.framework.api.biz.cluster.ClusterBiz;
import org.domeos.framework.api.model.cluster.Cluster;
import org.domeos.framework.engine.exception.DaoException;
import org.domeos.framework.engine.k8s.updater.EventUpdater;
import org.domeos.global.GlobalConstant;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.context.web.WebAppConfiguration;

import java.util.concurrent.TimeUnit;

/**
 * Created by xupeng on 16-4-6.
 */
@RunWith(SpringJUnit4ClassRunner.class)
@WebAppConfiguration(value = "src/main/webapp")
@ContextConfiguration(loader = WebContextLoader.class, value ={"classpath:/META-INF/test-config.xml"})
public class EventUpdaterTest {

    @Autowired
    EventUpdater eventUpdater;

    @Autowired
    ClusterBiz clusterBiz;

//    ClusterBasicMapper clusterBasicMapper;

    private Cluster buildClusterBasic(String clusterName, String api) {
        Cluster clusterBasic = new Cluster();
        clusterBasic.setApi(api);
        clusterBasic.setCreateTime(System.currentTimeMillis());
        clusterBasic.setName(clusterName);
        clusterBasic.setEtcd("0.0.0.0:4001");
        return clusterBasic;
    }

    @Test
    public void T010CheckCluster() throws InterruptedException, DaoException {
        Cluster cluster = buildClusterBasic("mycluster", "0.0.0.0:8080");
        clusterBiz.insertCluster( cluster);
//        eventUpdater.checkUpdateTask();
        TimeUnit.SECONDS.sleep(10);
        cluster = buildClusterBasic("mytest", "0.0.0.0:8080");
        clusterBiz.insertCluster( cluster);
        TimeUnit.SECONDS.sleep(10);
        clusterBiz.insertCluster( cluster);
        TimeUnit.SECONDS.sleep(10);

    }
}
