package org.domeos.util;

import org.domeos.global.GlobalConstant;
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
            GlobalConstant.DATABASETYPE = DatabaseType.MYSQL;
            return DatabaseType.MYSQL;
        }
    }
}
