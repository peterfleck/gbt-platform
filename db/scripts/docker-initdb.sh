#!/bin/bash

echo "shared_preload_libraries = 'pg_cron'" >> /var/lib/postgresql/data/postgresql.conf

# Required to load pg_cron
pg_ctl restart

psql --dbname "$POSTGRES_DB" --username "$POSTGRES_USER" -f /db/scripts/schema.sql
pg_restore -Fc --dbname "$POSTGRES_DB" --username "$POSTGRES_USER" /db/scripts/data.dump

# Refresh materialized views
psql --dbname "$POSTGRES_DB" --username "$POSTGRES_USER" -f /db/scripts/refresh_views.sql
