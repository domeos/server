package org.domeos.framework.engine.mapper;

import org.domeos.base.BaseTestCase;
import org.domeos.framework.api.mapper.loadBalancer.UniqPortMapper;
import org.junit.FixMethodOrder;
import org.junit.Test;
import org.junit.runners.MethodSorters;
import org.springframework.beans.factory.annotation.Autowired;

/**
 * Created by xupeng on 16-4-6.
 */
@FixMethodOrder(MethodSorters.NAME_ASCENDING)
public class UniqPortTest extends BaseTestCase {

    @Autowired
    UniqPortMapper mapper;

    @Test
    public void T010insert() {
        mapper.insertIndex(1, 80, 1);
    }

    @Test
    public void T020check() {
        Integer lbid = mapper.getLoadBalancerId(80, 1);
        System.out.println(lbid);
        lbid = mapper.getLoadBalancerId(8000, 1);
        System.out.println(lbid);
    }

    @Test
    public void T030delete() {
        mapper.deleteIndex(1);
    }
}
