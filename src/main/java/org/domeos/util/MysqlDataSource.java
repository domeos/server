package org.domeos.util;

import org.apache.commons.dbcp.BasicDataSource;
import org.domeos.util.StringUtils;
import org.springframework.util.Assert;

/**
 * Created by feiliu206363 on 2016/12/13.
 */
public class MysqlDataSource extends BasicDataSource {

    private volatile boolean restartNeeded = false;

    @Override
    public synchronized void setUrl(String url) {
        String envHost = System.getenv("MYSQL_HOST");
        String envPort = System.getenv("MYSQL_PORT");
        String envDB = System.getenv("MYSQL_DB");
        if (StringUtils.isBlank(envHost) || StringUtils.isBlank(envPort) || StringUtils.isBlank(envDB)) {
            Assert.hasText(url, "Property 'url' must not be empty");
            super.setUrl(url);
        } else {
            String envUrl = "jdbc:mysql://" + envHost + ":" + envPort + "/" + envDB + "?useUnicode=true&characterEncoding=UTF-8&autoReconnect=true";
            super.setUrl(envUrl);
        }
        // this.url = url;
        this.restartNeeded = true;
    }

    @Override
    public void setUsername(String username) {
        String envUsename = System.getenv("MYSQL_USERNAME");
        if (StringUtils.isBlank(envUsename)) {
            super.setUsername(username);
        } else {
            super.setUsername(envUsename);
        }
    }

    @Override
    public void setPassword(String password) {
        String envPassword = System.getenv("MYSQL_PASSWORD");
        if (StringUtils.isBlank(envPassword)) {
            super.setPassword(password);
        } else {
            super.setPassword(envPassword);
        }
    }
}
