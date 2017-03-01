package org.domeos.configuration;

import org.apache.commons.dbcp.BasicDataSource;
import org.domeos.util.StringUtils;
import org.apache.ibatis.session.SqlSessionFactory;
import org.domeos.global.GlobalConstant;
import org.domeos.util.DatabaseType;
import org.mybatis.spring.SqlSessionFactoryBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;

/**
 * Created by feiliu206363 on 2017/2/8.
 */
@Configuration
public class DatabaseConfig {
    private DataSource dataSource() throws Exception {
        String mysqlHost = System.getenv(GlobalConstant.MYSQL_HOST);
        if (StringUtils.isBlank(mysqlHost)) {
            throw new Exception("env MYSQL_HOST do not set!");
        }
        String mysqlPort = System.getenv(GlobalConstant.MYSQL_PORT);
        if (StringUtils.isBlank(mysqlPort)) {
            mysqlPort = "3306";
        }
        String mysqlUsername = System.getenv(GlobalConstant.MYSQL_USERNAME);
        if (StringUtils.isBlank(mysqlUsername)) {
            mysqlUsername = "domeos";
        }
        String mysqlPassword = System.getenv(GlobalConstant.MYSQL_PASSWORD);
        if (StringUtils.isBlank(mysqlPassword)) {
            mysqlPassword = "domeos";
        }
        String mysqlDB = System.getenv(GlobalConstant.MYSQL_DB);
        if (StringUtils.isBlank(mysqlDB)) {
            mysqlDB = "domeos";
        }

        BasicDataSource basicDataSource = new BasicDataSource();
        basicDataSource.setUrl("jdbc:mysql://" + mysqlHost + ":" + mysqlPort + "/" + mysqlDB
                + "?useUnicode=true&characterEncoding=UTF-8&autoReconnect=true");
        basicDataSource.setPassword(mysqlPassword);
        basicDataSource.setUsername(mysqlUsername);
        basicDataSource.setMaxIdle(50);
        basicDataSource.setMaxWait(50);
        basicDataSource.setDriverClassName("com.mysql.jdbc.Driver");
        basicDataSource.setMinEvictableIdleTimeMillis(20000);
        basicDataSource.setTimeBetweenEvictionRunsMillis(20000);
        return basicDataSource;
    }

    @Bean
    public SqlSessionFactory sqlSessionFactory() throws Exception {
        final SqlSessionFactoryBean sessionFactory = new SqlSessionFactoryBean();
        sessionFactory.setDataSource(dataSource());
        GlobalConstant.DATABASETYPE = DatabaseType.MYSQL;
        return sessionFactory.getObject();
    }
}
