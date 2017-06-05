#!/bin/sh
if [ -z "$MYSQL_PORT" ]; then
	MYSQL_PORT=3306
fi

echo "use domeos;" > ./init.sql
cat ./create-db.sql >> ./init.sql
cat ./insert-data.sql >> ./init.sql

mysql -u${MYSQL_USER} -P ${MYSQL_PORT} -h ${MYSQL_HOST} -p${MYSQL_PASSWORD} < ./init.sql
