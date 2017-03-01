#!/bin/sh

if [ -z "$MYSQL_PORT" ]; then
	MYSQL_PORT=3306
fi

echo "
create database if not exists domeos;
create database if not exists graph;
create database if not exists portal;
" > ./create.sql;

mysql -h ${MYSQL_HOST} -P ${MYSQL_PORT} -u ${MYSQL_USERNAME} -p${MYSQL_PASSWORD} < ./create.sql;

sleep 5

echo "use domeos;" > ./init.sql
cat ./create-db.sql >> ./init.sql
cat ./insert-data.sql >> ./init.sql

mysql -h ${MYSQL_HOST} -P ${MYSQL_PORT} -u ${MYSQL_USERNAME} -p${MYSQL_PASSWORD} < ./init.sql

sleep 5

mysql -h ${MYSQL_HOST} -P ${MYSQL_PORT} -u ${MYSQL_USERNAME} -p${MYSQL_PASSWORD} < ./graph-db-schema.sql

sleep 5

mysql -h ${MYSQL_HOST} -P ${MYSQL_PORT} -u ${MYSQL_USERNAME} -p${MYSQL_PASSWORD} < ./portal-db-schema.sql

