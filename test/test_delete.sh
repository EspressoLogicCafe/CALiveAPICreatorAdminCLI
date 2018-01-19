#! /bin/bash
LACSERVER=http://localhost:8080
#LACSERVER=http://localhost:8080/APIServer
USERNAME=admin
PW=Password1
#original export and new import
PROJECT=demo
PROJECT_NEW=demo_new

## Connect to a local server
node ../liveapicreatoradmin.js logout -a $PROJECT
node ../liveapicreatoradmin.js login -u $USERNAME -p $PW $LACSERVER -a $PROJECT_NEW
node ../liveapicreatoradmin.js use $PROJECT_NEW
node ../liveapicreatoradmin.js status

## clean up first - ignore if does not exist
node ../liveapicreatoradmin.js project delete --project_name $PROJECT_NEW
node ../liveapicreatoradmin.js project create --project_name $PROJECT_NEW --url_name test --authprovider 1000

# Select a Project
node ../liveapicreatoradmin.js project use --url_name test

node ../liveapicreatoradmin.js apioptions import --file $PROJECT/apioptions.json
# IMPORT Datasource and delete by name
node ../liveapicreatoradmin.js datasource import --file $PROJECT/datasource.json
node ../liveapicreatoradmin.js datasource delete --prefix finance
# IMPORT Library and delete by name
node ../liveapicreatoradmin.js libraries import --file $PROJECT/libraries.json
node ../liveapicreatoradmin.js libraries delete --library_name LIB1
# IMPORT auth provider and delete by name
node ../liveapicreatoradmin.js authprovider import --file $PROJECT/authprovider.json
node ../liveapicreatoradmin.js authprovider delete --auth_name "New Provider"
# IMPORT a rule and delete by name
node ../liveapicreatoradmin.js rule import --file $PROJECT/rules.json
node ../liveapicreatoradmin.js rule delete --rule_name validation_vhkfs
# IMPORT a resource and delete by name
node ../liveapicreatoradmin.js resource import --ident 2022 --file $PROJECT/resources.json
node ../liveapicreatoradmin.js resource delete --resource_name AllCustomers
#IMPORT Relationships and delete by name
node ../liveapicreatoradmin.js relationship import --file $PROJECT/relationships.json
node ../liveapicreatoradmin.js relationship delete --relationship_name 3aff8dee662a77f73c4e67dd2dc4af83b21af56d

#node ../liveapicreatoradmin.js token import --file $PROJECT/tokens.json
node ../liveapicreatoradmin.js role import --file $PROJECT/roles.json
node ../liveapicreatoradmin.js role delete --role_name "API Documentation"

node ../liveapicreatoradmin.js user import --file $PROJECT/users.json
node ../liveapicreatoradmin.js user delete --user_name "demo"

node ../liveapicreatoradmin.js namedsort import --file $PROJECT/sorts.json
node ../liveapicreatoradmin.js namedsort delete --sort_name "New sort"

node ../liveapicreatoradmin.js namedfilter import --file $PROJECT/filters.json
node ../liveapicreatoradmin.js namedfilter delete --filter_name "New filter"

node ../liveapicreatoradmin.js apiversion import --file $PROJECT/apiversions.json

node ../liveapicreatoradmin.js event import --file $PROJECT/events.json
node ../liveapicreatoradmin.js event delete --event_name REQEvent

node ../liveapicreatoradmin.js handler import --file $PROJECT/handlers.json
node ../liveapicreatoradmin.js handler delete --handler_name "New custom endpoint"

node ../liveapicreatoradmin.js topic import --file $PROJECT/topic.json
node ../liveapicreatoradmin.js topic delete --topic_name "Check Credit"

#node ../liveapicreatoradmin.js npa import --file $PROJECT/npa.json
#node ../liveapicreatoradmin.js npa delete --ident 2000 <<there is no unique name for npa table/attr

node ../liveapicreatoradmin.js gateway import --file $PROJECT/gateway.json
node ../liveapicreatoradmin.js gateway delete --gateway_name "New CA API Gateway xuycy"

#node ../liveapicreatoradmin.js virtualkey import --file $PROJECT/virtualkey.json

node ../liveapicreatoradmin.js connection import --file $PROJECT/connection.json
node ../liveapicreatoradmin.js connection delete  --connection_name MQTTConnection

node ../liveapicreatoradmin.js listener import --file $PROJECT/listener.json
node ../liveapicreatoradmin.js listener delete --listener_name TempListener
 
node ../liveapicreatoradmin.js timer import --file $PROJECT/timer.json
node ../liveapicreatoradmin.js timer delete --timer_name "New Timer"

node ../liveapicreatoradmin.js managedserver import --file $PROJECT/managedserver.json
node ../liveapicreatoradmin.js managedserver delete --server_name "New managed data server MYSQL"
# provider requires an sa login (project_ident=3)
#node ../liveapicreatoradmin.js provider import --provider_name Startup --file $PROJECT/provider.json
#node ../liveapicreatoradmin.js sequence import --file $PROJECT/sequence.json
node ../liveapicreatoradmin.js logout -a $PROJECT_NEW
