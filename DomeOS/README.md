# DomeOS server

## 升级说明

v0.2版本数据库结构改动较大，无法兼容v0.1版本数据库格式，请重新创数据库。

## 配置说明

该模块是系统的控制管理模块。

该模需要与数据库连接，支持h2和mysql两种。默认使用h2内存数据库

如果接入mysql，需要在启动时设置如下环境变量

  MYSQL_USERNAME： 数据库用户名
  
  MYSQL_PASSWORD： 密码
  
  MYSQL_HOST： 数据库地址（ip或域名）
  
  MYSQL_PORT： 数据库服务端口
  
  MYSQL_DB： database名，如果使用代码中脚本创建表，则该处为domeos
  

## 数据库初始化说明

初始化脚本在server\DomeOS\src\main\resources

请顺序执行1.create-database.sh 2.create-monitor-table.sh 3.domeos-init.sh

## 初始用户

系统超级用户为admin，初始密码为admin，请及时修改用户密码。
