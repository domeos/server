package org.domeos.util;

import org.apache.commons.lang3.StringUtils;
import org.springframework.jdbc.datasource.lookup.AbstractRoutingDataSource;

/**
 * Created by feiliu206363 on 2016/1/15.
 */
public class MultipleDataSource extends AbstractRoutingDataSource {

    @Override
    protected Object determineCurrentLookupKey() {
        if (StringUtils.isBlank(System.getenv("MYSQL_HOST")) || StringUtils.isBlank(System.getenv("MYSQL_PORT"))
                || StringUtils.isBlank(System.getenv("MYSQL_DB"))) {
            return DatabaseType.H2;
        } else {
            return DatabaseType.MYSQL;
        }
    }
}
