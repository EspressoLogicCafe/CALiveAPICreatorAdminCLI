#! /bin/bash
LACSERVER=http://localhost:8080
#LACSERVER=http://localhost:8080/APIServer
USERNAME=admin
PW=Password1
PROJECT=test

## Connect to a local server
node ../liveapicreatoradmin.js logout -a $PROJECT
node ../liveapicreatoradmin.js login -u $USERNAME -p $PW $LACSERVER -a $PROJECT
node ../liveapicreatoradmin.js use $PROJECT
node ../liveapicreatoradmin.js status

# Select a Project
node ../liveapicreatoradmin.js project use --url_name $PROJECT

## Export everything
mkdir -p $PROJECT
rm -rf temp
mkdir -p temp

node ../liveapicreatoradmin.js snapshot start --snapshot_name snapshot1
node ../liveapicreatoradmin.js api export --section api --file temp/api.json --format json
node ../liveapicreatoradmin.js api export --file temp/API.zip --format zip
node ../liveapicreatoradmin.js api export --section connections --file temp/connections.json
node ../liveapicreatoradmin.js api export --section custom_endpoints --file temp/custom_endpoints.json
node ../liveapicreatoradmin.js api export --section listeners --file temp/listeners.json
node ../liveapicreatoradmin.js api export --section relationships --file temp/relationships.json
node ../liveapicreatoradmin.js api export --section relationships --file temp/relationships.json
node ../liveapicreatoradmin.js api export --section data_sources --file temp/datasources.json
node ../liveapicreatoradmin.js api export --section filters --file temp/filters.json
node ../liveapicreatoradmin.js api export --section functions --file temp/functions.json
node ../liveapicreatoradmin.js api export --section libraries --file temp/libraries.json
node ../liveapicreatoradmin.js api export --section request_events --file temp/request_events.json
node ../liveapicreatoradmin.js api export --section sorts --file temp/sorts.json
node ../liveapicreatoradmin.js api export --section timers --file temp/timers.json
node ../liveapicreatoradmin.js api export --section topics --file temp/topics.json
node ../liveapicreatoradmin.js api export --section security  --file temp/security.json
node ../liveapicreatoradmin.js api export --section security.authtokens  --file temp/authtokens.json
node ../liveapicreatoradmin.js api export --section security.roles --file temp/roles.json
node ../liveapicreatoradmin.js api export --section security.users --file temp/users.json
node ../liveapicreatoradmin.js api export --section resources --file temp/resources.json
node ../liveapicreatoradmin.js api export --section rules --file temp/rules.json
node ../liveapicreatoradmin.js api export --section apioptions --file temp/apioptions.json
node ../liveapicreatoradmin.js logout -a $PROJECT
