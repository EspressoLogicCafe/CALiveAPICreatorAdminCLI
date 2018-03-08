#! /bin/bash
# Generate the contents of an existing repository
#SERVER=http://localhost:8080/APIServer
SERVER=http://localhost:8080
PROJECT=demo

## Connect to a local server $SERVER and use API Project $PROEJCT
node ../liveapicreatoradmin.js logout -a local
node ../liveapicreatoradmin.js login -u admin -p Password1 $SERVER  -a $PROJECT
node ../liveapicreatoradmin.js use $PROJECT
node ../liveapicreatoradmin.js status

# Select Northwind B2B Project
node ../liveapicreatoradmin.js api use --url_name $PROJECT
node ../liveapicreatoradmin.js api list
node ../liveapicreatoradmin.js apioptions list
node ../liveapicreatoradmin.js datasource list
node ../liveapicreatoradmin.js libraries list
node ../liveapicreatoradmin.js authprovider list
node ../liveapicreatoradmin.js rule list 
node ../liveapicreatoradmin.js apiversion list
node ../liveapicreatoradmin.js resource list
node ../liveapicreatoradmin.js relationship list
node ../liveapicreatoradmin.js authtoken list
node ../liveapicreatoradmin.js role list
node ../liveapicreatoradmin.js user list
node ../liveapicreatoradmin.js sort list
node ../liveapicreatoradmin.js filter list
node ../liveapicreatoradmin.js request_event list
node ../liveapicreatoradmin.js custom_endpoint list
node ../liveapicreatoradmin.js topic list
node ../liveapicreatoradmin.js npa list
node ../liveapicreatoradmin.js gateway list
node ../liveapicreatoradmin.js managedserver list
node ../liveapicreatoradmin.js function list
node ../liveapicreatoradmin.js license list
node ../liveapicreatoradmin.js eula accepted 
node ../liveapicreatoradmin.js virtualkey list
node ../liveapicreatoradmin.js sequence list
node ../liveapicreatoradmin.js timer list
node ../liveapicreatoradmin.js connection list
node ../liveapicreatoradmin.js listener list
node ../liveapicreatoradmin.js provider list
ECHO 'is user license accepted'
node ../liveapicreatoradmin.js eula accepted
node ../liveapicreatoradmin.js license list
node ../liveapicreatoradmin.js teamspace list --verbose

node ../liveapicreatoradmin.js logout -a $PROJECT

