package org.domeos.util;

import org.apache.commons.lang3.StringUtils;
import org.springframework.jdbc.datasource.AbstractDriverBasedDataSource;
import org.springframework.jdbc.datasource.SimpleDriverDataSource;
import org.springframework.util.Assert;
import org.springframework.util.ClassUtils;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.Properties;

/**
 * Created by feiliu206363 on 2016/1/12.
 */

public class MysqlDriverManagerDataSource extends AbstractDriverBasedDataSource {
    /**
     * Constructor for bean-style configuration.
     */
    public MysqlDriverManagerDataSource() {
    }

    /**
     * Create a new DriverManagerDataSource with the given JDBC URL,
     * not specifying a username or password for JDBC access.
     * @param url the JDBC URL to use for accessing the DriverManager
     * @see java.sql.DriverManager#getConnection(String)
     */
    public MysqlDriverManagerDataSource(String url) {
        setUrl(url);
    }

    /**
     * Create a new DriverManagerDataSource with the given standard
     * DriverManager parameters.
     * @param url the JDBC URL to use for accessing the DriverManager
     * @param username the JDBC username to use for accessing the DriverManager
     * @param password the JDBC password to use for accessing the DriverManager
     * @see java.sql.DriverManager#getConnection(String, String, String)
     */
    public MysqlDriverManagerDataSource(String url, String username, String password) {
        setUrl(url);
        setUsername(username);
        setPassword(password);
    }

    /**
     * Create a new DriverManagerDataSource with the given JDBC URL,
     * not specifying a username or password for JDBC access.
     * @param url the JDBC URL to use for accessing the DriverManager
     * @param conProps JDBC connection properties
     * @see java.sql.DriverManager#getConnection(String)
     */
    public MysqlDriverManagerDataSource(String url, Properties conProps) {
        setUrl(url);
        setConnectionProperties(conProps);
    }

    @Override
    public void setUrl(String url) {
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

    /**
     * Create a new DriverManagerDataSource with the given standard
     * DriverManager parameters.
     * @param driverClassName the JDBC driver class name
     * @param url the JDBC URL to use for accessing the DriverManager
     * @param username the JDBC username to use for accessing the DriverManager
     * @param password the JDBC password to use for accessing the DriverManager
     * @deprecated since Spring 2.5. DriverManagerDataSource is primarily
     * intended for accessing <i>pre-registered</i> JDBC drivers.
     * If you need to register a new driver, consider using
     * {@link SimpleDriverDataSource} instead.
     */
    @Deprecated
    public MysqlDriverManagerDataSource(String driverClassName, String url, String username, String password) {
        setDriverClassName(driverClassName);
        setUrl(url);
        setUsername(username);
        setPassword(password);
    }


    /**
     * Set the JDBC driver class name. This driver will get initialized
     * on startup, registering itself with the JDK's DriverManager.
     * <p><b>NOTE: DriverManagerDataSource is primarily intended for accessing
     * <i>pre-registered</i> JDBC drivers.</b> If you need to register a new driver,
     * consider using {@link SimpleDriverDataSource} instead. Alternatively, consider
     * initializing the JDBC driver yourself before instantiating this DataSource.
     * The "driverClassName" property is mainly preserved for backwards compatibility,
     * as well as for migrating between Commons DBCP and this DataSource.
     * @see java.sql.DriverManager#registerDriver(java.sql.Driver)
     * @see SimpleDriverDataSource
     */
    public void setDriverClassName(String driverClassName) {
        Assert.hasText(driverClassName, "Property 'driverClassName' must not be empty");
        String driverClassNameToUse = driverClassName.trim();
        try {
            Class.forName(driverClassNameToUse, true, ClassUtils.getDefaultClassLoader());
        }
        catch (ClassNotFoundException ex) {
            throw new IllegalStateException("Could not load JDBC driver class [" + driverClassNameToUse + "]", ex);
        }
        if (logger.isInfoEnabled()) {
            logger.info("Loaded JDBC driver: " + driverClassNameToUse);
        }
    }


    @Override
    protected Connection getConnectionFromDriver(Properties props) throws SQLException {
        String url = getUrl();
        if (logger.isDebugEnabled()) {
            logger.debug("Creating new JDBC DriverManager Connection to [" + url + "]");
        }
        return getConnectionFromDriverManager(url, props);
    }

    /**
     * Getting a Connection using the nasty static from DriverManager is extracted
     * into a protected method to allow for easy unit testing.
     * @see java.sql.DriverManager#getConnection(String, java.util.Properties)
     */
    protected Connection getConnectionFromDriverManager(String url, Properties props) throws SQLException {
        return DriverManager.getConnection(url, props);
    }
}
