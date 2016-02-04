#! /bin/bash


## Connect to a local server
liveapicreatoradmin logout -a local
liveapicreatoradmin login -u admin -p Password1 http://localhost:8080/APIServer -a local
liveapicreatoradmin use local
liveapicreatoradmin status

# Select a Project
liveapicreatoradmin project use --url_name demo_mysql
liveapicreatoradmin project list
liveapicreatoradmin apioptions list
liveapicreatoradmin datasource list
liveapicreatoradmin libraries list
liveapicreatoradmin authprovider list
liveapicreatoradmin rule list --verbose
liveapicreatoradmin resource list
liveapicreatoradmin relationship list
liveapicreatoradmin token list
liveapicreatoradmin role list
liveapicreatoradmin user list
liveapicreatoradmin namedsort list
liveapicreatoradmin namedfilter list
liveapicreatoradmin apiversion list
liveapicreatoradmin event list
liveapicreatoradmin handler list
liveapicreatoradmin topic list
liveapicreatoradmin apiversion list
liveapicreatoradmin logout -a local

