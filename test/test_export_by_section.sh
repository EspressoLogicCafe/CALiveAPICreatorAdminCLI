#! /bin/bash
LACSERVER=http://localhost:8080
#LACSERVER=http://localhost:8080/APIServer
USERNAME=admin
PW=Password1
PROJECT=test

## Connect to a local server
lacadmin logout -a $PROJECT
lacadmin login -u $USERNAME -p $PW $LACSERVER -a $PROJECT
lacadmin use $PROJECT
lacadmin status

# Select a Project
lacadmin project use --url_name $PROJECT

## Export everything
mkdir -p $PROJECT
rm -rf temp
mkdir -p temp

lacadmin api export --section api --file temp/api.json --format json
lacadmin api export --file temp/API.zip --format zip
lacadmin api export --section connections --file temp/connections.json
lacadmin api export --section custom_endpoints --file temp/custom_endpoints.json
lacadmin api export --section listeners --file temp/listeners.json
lacadmin api export --section relationships --file temp/relationships.json
lacadmin api export --section relationships --file temp/relationships.json
lacadmin api export --section data_sources --file temp/datasources.json
lacadmin api export --section filters --file temp/filters.json
lacadmin api export --section functions --file temp/functions.json
lacadmin api export --section libraries --file temp/libraries.json
lacadmin api export --section request_events --file temp/request_events.json
lacadmin api export --section sorts --file temp/sorts.json
lacadmin api export --section timers --file temp/timers.json
lacadmin api export --section topics --file temp/topics.json
lacadmin api export --section security  --file temp/security.json
lacadmin api export --section security.authtokens  --file temp/authtokens.json
lacadmin api export --section security.roles --file temp/roles.json
lacadmin api export --section security.users --file temp/users.json
lacadmin api export --section resources --file temp/resources.json
lacadmin api export --section rules --file temp/rules.json
lacadmin api export --section apioptions --file temp/apioptions.json
lacadmin logout -a $PROJECT
