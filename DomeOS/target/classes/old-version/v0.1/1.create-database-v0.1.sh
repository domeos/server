#!/bin/sh

if [ -z "$MYSQL_PORT" ]; then
	MYSQL_PORT=3306
fi

echo "
create database if not exists `domeos`;
create database if not exists `graph`;
create database if not exists `dashboard`;
grant all privileges on domeos.* to 'domeos'@'%' with grant option;
grant all privileges on graph.* to 'domeos'@'%' with grant option;
grant all privileges on dashboard.* to 'domeos'@'%' with grant option;
" > ./create.sql;

mysql -uroot -h ${MYSQL_HOST} -P ${MYSQL_PORT} -p${MYSQL_ROOT_PASSWORD} < ./create.sql;

