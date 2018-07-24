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
rm -rf temp2
mkdir -p temp2

lacadmin api export --section api --file temp2/api.json --format json --url_name $PROJECT
lacadmin api export --section connections --section_filter "name=MQTTConn" --file temp2/connections.json
lacadmin api export --section custom_endpoints --section_filter "name=New custom endpoint 2" --file temp2/custom_endpoints.json
lacadmin api export --section listeners --section_filter "name=START" --file temp2/listeners.json
lacadmin api export --section relationships --section_filter "parent_entity=demo:customer" --file temp2/relationships.json
lacadmin api export --section data_sources --section_filter "prefix=demo" --file temp2/datasources.json
lacadmin api export --section filters --section_filter "name=UserFilter" --file temp2/filters.json
lacadmin api export --section functions --section_filter "name=testFunction" --file temp2/functions.json
lacadmin api export --section libraries --section_filter "name=b2bB2B" --file temp2/libraries.json
lacadmin api export --section request_events --section_filter "name=ResponseEvent"  --file temp2/request_events.json
lacadmin api export --section sorts --section_filter "name=UserSort" --file temp2/sorts.json
lacadmin api export --section timers --section_filter "name=New Timer" --file temp2/timers.json
lacadmin api export --section topics --section_filter "name=Audit Orders"  --file temp2/topics.json
lacadmin api export --section security.authtokens  --section_filter "name=Admin key" --file temp2/authtokens.json
lacadmin api export --section security.roles --section_filter "name=Read only" --file temp2/roles.json
lacadmin api export --section security.users --section_filter "name=guest" --file temp2/users.json
lacadmin api export --section resources --section_filter "name=AllCustomers&version=v1" --file temp2/resources.json
lacadmin api export --section rules --section_filter "name=sum_balance&prefix=demo"  --file temp2/rules.json
lacadmin api export --section apioptions --section_filter "name=Force Binary Data as an Object" --file temp2/apioptions.json
lacadmin logout -a $PROJECT
