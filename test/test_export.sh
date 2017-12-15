#! /bin/bash
LACSERVER=http://localhost:8080
#LACSERVER=http://localhost:8080/APIServer
USERNAME=admin
PW=Password1
PROJECT=demo

## Connect to a local server
node ../liveapicreatoradmin.js logout -a $PROJECT
node ../liveapicreatoradmin.js login -u $USERNAME -p $PW $LACSERVER -a $PROJECT
node ../liveapicreatoradmin.js use $PROJECT
node ../liveapicreatoradmin.js status

# Select a Project
node ../liveapicreatoradmin.js project use --url_name $PROJECT

## Export everything
mkdir -p $PROJECT

node ../liveapicreatoradmin.js snapshot start --snapshot_name snapshot1
#node ../liveapicreatoradmin.js project export --file $PROJECT/$PROJECT.json --format json
node ../liveapicreatoradmin.js apioptions export --file $PROJECT/apioptions.json
node ../liveapicreatoradmin.js datasource export --file $PROJECT/datasource.json
node ../liveapicreatoradmin.js libraries export --file $PROJECT/libraries.json
node ../liveapicreatoradmin.js authprovider export --file $PROJECT/authprovider.json
node ../liveapicreatoradmin.js rule export --file $PROJECT/rules.json
node ../liveapicreatoradmin.js resource export --ident 2022 --file $PROJECT/resources.json
node ../liveapicreatoradmin.js relationship export --file $PROJECT/relationships.json
node ../liveapicreatoradmin.js token export --file $PROJECT/tokens.json
node ../liveapicreatoradmin.js role export --file $PROJECT/roles.json
node ../liveapicreatoradmin.js user export --file $PROJECT/users.json
node ../liveapicreatoradmin.js namedsort export --file $PROJECT/sorts.json
node ../liveapicreatoradmin.js namedfilter export --file $PROJECT/filters.json
node ../liveapicreatoradmin.js apiversion export --file $PROJECT/apiversions.json
node ../liveapicreatoradmin.js event export --file $PROJECT/events.json
node ../liveapicreatoradmin.js handler export --file $PROJECT/handlers.json
node ../liveapicreatoradmin.js topic export --file $PROJECT/topic.json
node ../liveapicreatoradmin.js npa export --file $PROJECT/npa.json
node ../liveapicreatoradmin.js gateway export --file $PROJECT/gateway.json
node ../liveapicreatoradmin.js virtualkey export --file $PROJECT/virtualkey.json
#node ../liveapicreatoradmin.js snapshot restore --name snapshot1
node ../liveapicreatoradmin.js connection export --file $PROJECT/connection.json
node ../liveapicreatoradmin.js listener export --file $PROJECT/listener.json
node ../liveapicreatoradmin.js timer export --file $PROJECT/timer.json
node ../liveapicreatoradmin.js managedserver export --file $PROJECT/managedserver.json
# provider requires an sa login (project_ident=3)
node ../liveapicreatoradmin.js provider export --provider_name Startup --file $PROJECT/provider.json
node ../liveapicreatoradmin.js sequence export --file $PROJECT/sequence.json
node ../liveapicreatoradmin.js logout -a $PROJECT
