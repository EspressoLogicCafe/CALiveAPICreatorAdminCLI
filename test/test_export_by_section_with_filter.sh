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
rm -rf temp2
mkdir -p temp2

node ../liveapicreatoradmin.js api export -section api --file temp2/api.json --format json --url_name $PROJECT
node ../liveapicreatoradmin.js api export --section connections --section_filter "name=MQTTConn" --file temp2/connections.json
node ../liveapicreatoradmin.js api export --section custom_endpoints --section_filter "name=New custom endpoint 2" --file temp2/custom_endpoints.json
node ../liveapicreatoradmin.js api export --section listeners --section_filter "name=START" --file temp2/listeners.json
node ../liveapicreatoradmin.js api export --section relationships --section_filter "parent_entity=demo:customer" --file temp2/relationships.json
node ../liveapicreatoradmin.js api export --section data_sources --section_filter "prefix=demo" --file temp2/datasources.json
node ../liveapicreatoradmin.js api export --section filters --section_filter "name=UserFilter" --file temp2/filters.json
node ../liveapicreatoradmin.js api export --section functions --section_filter "name=testFunction" --file temp2/functions.json
node ../liveapicreatoradmin.js api export --section libraries --section_filter "name=b2bB2B" --file temp2/libraries.json
node ../liveapicreatoradmin.js api export --section request_events --section_filter "name=ResponseEvent"  --file temp2/request_events.json
node ../liveapicreatoradmin.js api export --section sorts --section_filter "name=UserSort" --file temp2/sorts.json
node ../liveapicreatoradmin.js api export --section timers --section_filter "name=New Timer" --file temp2/timers.json
node ../liveapicreatoradmin.js api export --section topics --section_filter "name=Audit Orders"  --file temp2/topics.json
node ../liveapicreatoradmin.js api export --section security.authtokens  --section_filter "name=Admin key" --file temp2/authtokens.json
node ../liveapicreatoradmin.js api export --section security.roles --section_filter "name=Read only" --file temp2/roles.json
node ../liveapicreatoradmin.js api export --section security.users --section_filter "name=guest" --file temp2/users.json
node ../liveapicreatoradmin.js api export --section resources --section_filter "name=AllCustomers&version=v1" --file temp2/resources.json
node ../liveapicreatoradmin.js api export --section rules --section_filter "name=sum_balance&prefix=demo"  --file temp2/rules.json
node ../liveapicreatoradmin.js api export --section apioptions --section_filter "name=Force Binary Data as an Object" --file temp2/apioptions.json
node ../liveapicreatoradmin.js logout -a $PROJECT
