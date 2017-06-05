package org.domeos.framework.api.biz.overview;

import java.util.List;
import java.util.Map;

/**
 * Created by junwuguo on 2017/5/10 0010.
 */
public interface OverviewBiz {

    Map<Integer, String> getIdNameMapIncludeRemovedByIdList(String tableName, List<Integer> idList);
}
