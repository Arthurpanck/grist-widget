#!/bin/sh
# Package the driver as a Metabase plugin jar (source-only: Metabase compiles the namespace when it loads it).
set -e
cd "$(dirname "$0")"
mkdir -p ../plugins
rm -f ../plugins/grist.metabase-driver.jar
(cd resources && zip -q -X ../../plugins/grist.metabase-driver.jar metabase-plugin.yaml)
(cd src && zip -q -X -r ../../plugins/grist.metabase-driver.jar metabase)
echo "built plugins/grist.metabase-driver.jar"
