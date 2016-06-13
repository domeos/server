package org.domeos.framework.api.biz.base.impl;

import org.domeos.base.BaseTestCase;
import org.domeos.framework.api.biz.base.BaseBiz;
import org.domeos.framework.engine.exception.DaoException;
import org.junit.Test;
import org.springframework.beans.factory.annotation.Autowired;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

/**
 * Created by sparkchen on 16/4/5.
 */
public class BaseBizImplTest extends BaseTestCase {

    @Autowired
    BaseBiz baseBiz;
    @Autowired
    Model2Biz model2Biz;

    @Test
    public void testInsertRow() throws Exception {
        Model1 model1 = new Model1();
        model1.setField1(1001);
        model1.setName("test1");
        model1.setDescription("des1");
        model1.setField2("line1\r\nline2\r\nline3\r\n");
        baseBiz.insertRow("testmodel1", model1);

        model1 = new Model1();
        model1.setField1(1002);
        model1.setName("test12");
        model1.setDescription("des12");
        baseBiz.insertRow("testmodel1", model1);
        Model1 out = baseBiz.getById("testmodel1", 1, model1.getClass());
        System.out.println("Out:" + out.toString() + ", model1.field2=" + out.getField2());

        Model2 model2 = new Model2();
        model2.setField1(2001);
        model2.setColumn1(3001);
        model2.setName("test2");
        model2.setDescription("des2");
        try {
            baseBiz.insertRow("testmodel2", model2);
            assertTrue(false);
        } catch (DaoException e) {
            // correct

        }
        model2Biz.InsertRow("testmodel2", model2);
        Model2 out2 = baseBiz.getById("testmodel2", 1, model2.getClass());
        System.out.println("Out2:" + out2.toString() + ", column1:" + out2.getColumn1());
        assertEquals(out2.getColumn1(), 10);
    }

    @Test
    public void testGetById() throws Exception {

    }

    @Test
    public void testGetByName() throws Exception {
        Model1 model1 = baseBiz.getByName("testmodel1", "test1", Model1.class);
        assertEquals(model1.getField1(), 1001);
        model1 = baseBiz.getByName("testmodel1", "test12", Model1.class);
        assertEquals(model1.getField1(), 1002);
        model1 = baseBiz.getByName("testmodel1", "test12xxx", Model1.class);
        assertEquals(model1, null);
    }

    @Test
    public void testGetListByReousrce() throws Exception {

    }

    @Test
    public void testRemoveById() throws Exception {

    }

    @Test
    public void testUpdateRow() throws Exception {

    }

}

