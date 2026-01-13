#!/bin/bash
set -e

echo "Dumping production..."
pg_dump "$PROD_DB_URL" --format=custom --no-owner --no-acl --file=prod_dump.dump

echo "Resetting dev schema..."
psql "$DEV_DB_URL" -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

echo "Restoring into dev..."
pg_restore --no-owner --no-privileges --dbname="$DEV_DB_URL" prod_dump.dump

echo "Done ✅"
