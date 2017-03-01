package org.domeos.framework.api.biz.base;

import org.domeos.framework.api.model.collection.CollectionResourceMap;
import org.domeos.framework.engine.exception.DaoException;
import org.domeos.framework.engine.model.RowModelBase;

import java.util.List;

/**
 * Created by sparkchen on 16/4/5.
 */
public interface BaseBiz {

    // Three Generic methods to get data from MySQL
    <T extends RowModelBase> T getById(String tableName, int id, Class<T> clazz);

    <T extends RowModelBase> T getByName(String tableName, String name, Class<T> clazz);

    <T extends RowModelBase> List<T> getList(String tableName, Class<T> clazz);

    <T extends RowModelBase> List<T> getListByName(String tableName, String name, Class<T> clazz);

    <T extends RowModelBase> List<T> getListByIdList(String tableName, List<Integer> idList, Class<T> clazz);

    <T extends RowModelBase> List<T> getWholeTable(String tableName, Class<T> clazz);

    <T extends RowModelBase> List<T> getListByCollections(String tableName, List<CollectionResourceMap> authorityMaps, Class<T> clazz);

    void removeById(String tableName, int id);

    void updateState(String tableName, String state, int id);

    String getState(String tableName, int id);

    String getNameById(String tableName, int id);

    @Deprecated
    void updateRow(String tableName, RowModelBase rowModelBase) throws DaoException;

    @Deprecated
    void insertRow(String tableName, RowModelBase rowModelBase) throws DaoException;

}
