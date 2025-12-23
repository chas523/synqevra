#!/bin/bash
set -e

docker-entrypoint.sh postgres &

until pg_isready -h mytb-db-data; do
  sleep 1 
done

psql -U postgres -d mythingsboard -f /docker-entrypoint-initdb.d/update_sysadmin_email.sql

wait