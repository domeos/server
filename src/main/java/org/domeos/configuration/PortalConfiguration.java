package org.domeos.configuration;

import com.alibaba.druid.pool.DruidDataSource;
import org.domeos.global.GlobalConstant;
import org.domeos.util.DatabaseType;
import org.domeos.util.StringUtils;
import org.mybatis.spring.SqlSessionFactoryBean;
import org.mybatis.spring.annotation.MapperScan;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.datasource.DataSourceTransactionManager;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import javax.sql.DataSource;

/**
 * Created by feiliu206363 on 2017/3/27.
 */
@Configuration
@EnableTransactionManagement
@MapperScan(basePackages = "org.domeos.framework.api.mapper.portal", sqlSessionFactoryRef = "portalSqlSessionFactory")
public class PortalConfiguration {

    @Bean(initMethod = "init", destroyMethod = "close", name = "portalDataSource")
    public DataSource portalDataSource() throws Exception {
        String mysqlHost = System.getenv(GlobalConstant.PORTAL_MYSQL_HOST);
        if (StringUtils.isBlank(mysqlHost)) {
            mysqlHost = System.getenv(GlobalConstant.DOMEOS_MYSQL_HOST);
        }
        String mysqlPort = System.getenv(GlobalConstant.PORTAL_MYSQL_PORT);
        if (StringUtils.isBlank(mysqlPort)) {
            mysqlPort = System.getenv(GlobalConstant.DOMEOS_MYSQL_PORT);
        }
        String mysqlUsername = System.getenv(GlobalConstant.PORTAL_MYSQL_USERNAME);
        if (StringUtils.isBlank(mysqlUsername)) {
            mysqlUsername = System.getenv(GlobalConstant.DOMEOS_MYSQL_USERNAME);
        }
        String mysqlPassword = System.getenv(GlobalConstant.PORTAL_MYSQL_PASSWORD);
        if (StringUtils.isBlank(mysqlPassword)) {
            mysqlPassword = System.getenv(GlobalConstant.DOMEOS_MYSQL_PASSWORD);
        }
        String mysqlDB = System.getenv(GlobalConstant.PORTAL_MYSQL_DB);
        if (StringUtils.isBlank(mysqlDB)) {
            mysqlDB = "portal";
        }

        DruidDataSource dataSource = new DruidDataSource();
        dataSource.setUrl("jdbc:mysql://" + mysqlHost + ":" + mysqlPort + "/" + mysqlDB
                + "?useUnicode=true&characterEncoding=UTF-8&autoReconnect=true");
        dataSource.setPassword(mysqlPassword);
        dataSource.setUsername(mysqlUsername);
        dataSource.setMaxActive(80);
        dataSource.setMaxWait(50000);
        dataSource.setDriverClassName("com.mysql.jdbc.Driver");
        dataSource.setMinEvictableIdleTimeMillis(20000);
        dataSource.setTimeBetweenEvictionRunsMillis(20000);
        dataSource.setInitialSize(5);
        dataSource.setMinIdle(1);
        dataSource.setFilters("stat,wall,log4j");
        return dataSource;
    }

    @Bean(name = "portalTransactionManager")
    public DataSourceTransactionManager portalTransactionManager() throws Exception {
        return new DataSourceTransactionManager(portalDataSource());
    }

    @Bean(name = "portalSqlSessionFactory")
    public SqlSessionFactoryBean sqlSessionFactory(@Qualifier("portalDataSource") DataSource dataSource) throws Exception {
        final SqlSessionFactoryBean sessionFactory = new SqlSessionFactoryBean();
        sessionFactory.setDataSource(dataSource);
        GlobalConstant.DATABASETYPE = DatabaseType.MYSQL;
        return sessionFactory;
    }
}
