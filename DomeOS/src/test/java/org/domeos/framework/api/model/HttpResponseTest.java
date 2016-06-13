package org.domeos.framework.api.model;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.domeos.base.BaseTestCase;
import org.domeos.basemodel.HttpResponseTemp;
import org.domeos.basemodel.ResultStat;
import org.domeos.framework.api.model.cluster.Cluster;
import org.domeos.framework.engine.model.ModelObjectMapper;
import org.junit.Test;

/**
 * Created by xupeng on 16-4-7.
 */
public class HttpResponseTest extends BaseTestCase{

//    @Autowired
    ObjectMapper objectMapper = new ModelObjectMapper();

    @Test
    public void T010tojson() throws JsonProcessingException {
        Cluster cluster = buildClusterBasic("mytest", "0.0.0.0:8080");
        HttpResponseTemp<Cluster> tmpl = ResultStat.OK.wrap(null);
        System.out.println(objectMapper.writeValueAsString(cluster));
        System.out.println(objectMapper.writeValueAsString(tmpl));
    }

    private Cluster buildClusterBasic(String clusterName, String api) {
        Cluster clusterBasic = new Cluster();
        clusterBasic.setApi(api);
        clusterBasic.setCreateTime(System.currentTimeMillis());
        clusterBasic.setName(clusterName);
        clusterBasic.setEtcd("0.0.0.0:4002");
        return clusterBasic;
    }
}
