#!/bin/sh
if [ -z "$MYSQL_PORT" ]; then
	MYSQL_PORT=3306
fi

mysql -u${MYSQL_USER} -P ${MYSQL_PORT} -h ${MYSQL_HOST} -p${MYSQL_PASSWORD} < ./dashboard-db-schema.sql
mysql -u${MYSQL_USER} -P ${MYSQL_PORT} -h ${MYSQL_HOST} -p${MYSQL_PASSWORD} < ./graph-db-schema.sql

