package org.domeos.framework.api.biz.base.impl;

import org.domeos.framework.api.biz.base.BaseBiz;
import org.domeos.framework.engine.exception.DaoException;
import org.domeos.framework.engine.mapper.Model2Mapper;
import org.domeos.framework.engine.model.RowMapperDao;
import org.domeos.framework.engine.model.RowModelBase;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;


/**
 * Created by sparkchen on 16/4/5.
 */

@Repository("model2Biz")
public class Model2Biz extends BaseBizImpl implements BaseBiz {

    @Autowired
    Model2Mapper mapper;

    public void UpdateRow(String tableName, RowModelBase rowModelBase)throws DaoException {

    }
    public void InsertRow(String tableName, Model2 rowModelBase)throws DaoException {
        mapper.insertRow(tableName, new RowMapperDao(rowModelBase), rowModelBase.getColumn1());
    }

}
