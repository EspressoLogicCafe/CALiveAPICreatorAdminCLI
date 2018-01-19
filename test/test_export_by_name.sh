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

#node ../liveapicreatoradmin.js project export --file temp/$PROJECT.json --format json
node ../liveapicreatoradmin.js apioptions export --file temp/apioptions.json
node ../liveapicreatoradmin.js datasource export --db_name "demo_derby" --file temp/datasource.json
node ../liveapicreatoradmin.js libraries export --library_name B2BLib --file temp/libraries.json
node ../liveapicreatoradmin.js authprovider export --auth_name "Built-in authentication" --file temp/authprovider.json
node ../liveapicreatoradmin.js rule --rule_name formula_amount  export --file temp/rules.json
node ../liveapicreatoradmin.js resource export --file temp/resources.json
node ../liveapicreatoradmin.js relationship export --relationship_name foo  --file temp/relationships.json
node ../liveapicreatoradmin.js authtoken export  --token_name "Admin key" --file temp/tokens.json
node ../liveapicreatoradmin.js role export  --role_name "Read Only" --file temp/roles.json
node ../liveapicreatoradmin.js user export --user_name demo --file temp/users.json
node ../liveapicreatoradmin.js sort export --sort_name "UserSort" --file temp/sorts.json
node ../liveapicreatoradmin.js filter export --filter_name "UserFilter"  --file temp/filters.json
node ../liveapicreatoradmin.js apiversion export --version_name v1 --file temp/apiversions.json
node ../liveapicreatoradmin.js request_event export --event_name "OptionsEvent" --file temp/events.json
node ../liveapicreatoradmin.js custom_endpoint export --handler_name foo --file temp/custom_endpoint.json
node ../liveapicreatoradmin.js topic export --topic_name "Check Credit" --file temp/topic.json
node ../liveapicreatoradmin.js npa export --npa_name foo --file temp/npa.json
node ../liveapicreatoradmin.js gateway export --gateway_name foo --file temp/gateway.json
node ../liveapicreatoradmin.js virtualkey export --virtual_keyname foo --file temp/virtualkey.json
node ../liveapicreatoradmin.js connection export --connection_name MQTTConn --file temp/connection.json
node ../liveapicreatoradmin.js listener export --listener_name MQTTListener --file temp/listener.json
node ../liveapicreatoradmin.js timer export --timer_name "New Timer" --file temp/timer.json
node ../liveapicreatoradmin.js managedserver export --file temp/managedserver.json
# provider requires an sa login (project_ident=3)
node ../liveapicreatoradmin.js provider export --provider_name Startup --file temp/provider.json
node ../liveapicreatoradmin.js sequence export --file temp/sequence.json
node ../liveapicreatoradmin.js logout -a $PROJECT
