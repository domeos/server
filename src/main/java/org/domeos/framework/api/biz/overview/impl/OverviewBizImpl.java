package org.domeos.framework.api.biz.overview.impl;

import org.domeos.framework.api.biz.overview.OverviewBiz;
import org.domeos.framework.api.mapper.domeos.base.RowMapper;
import org.domeos.framework.engine.exception.DaoConvertingException;
import org.domeos.framework.engine.model.RowMapperDao;
import org.domeos.util.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Created by junwuguo on 2017/5/10 0010.
 */
@Service("overviewBiz")
public class OverviewBizImpl implements OverviewBiz {

    @Autowired
    RowMapper mapper;

    @Override
    public Map<Integer, String> getIdNameMapIncludeRemovedByIdList(String tableName, List<Integer> idList) {
        try {
            if (StringUtils.isBlank(tableName) || idList == null || idList.size() == 0) {
                return new HashMap<>(1);
            }
            StringBuilder builder = new StringBuilder();
            builder.append(" ( ");
            for (int i = 0; i < idList.size(); i++) {
                builder.append(idList.get(i));
                if (i != idList.size() - 1) {
                    builder.append(" , ");
                }
            }
            builder.append(") ");
            List<RowMapperDao> list = mapper.getListIncludeRemovedByIdList(tableName, builder.toString());
            if (list == null || list.isEmpty()) {
                return new HashMap<>(1);
            }
            Map<Integer, String> result = new HashMap<>(list.size());
            for (RowMapperDao dao : list) {
                result.put(dao.getId(), dao.getName());
            }
            return result;
        } catch (Exception e) {
            throw new DaoConvertingException("Get MySQL Data failed! tableName=" + tableName
                    + ", id list = " + idList, e);
        }
    }

}
