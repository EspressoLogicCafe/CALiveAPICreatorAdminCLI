#! /bin/bash

#Import into target server
liveapicreatoradmin logout -a target
liveapicreatoradmin login -u admin -p Password1 http://localhost:8080/APIServer -a target
liveapicreatoradmin use target
#Import Project
liveapicreatoradmin project import --file demo/demo_mysql.json
liveapicreatoradmin project list
## should automatically use imported project --url_name demo_mysql-20160114-173500.832p0000
#Fixup Datasources
liveapicreatoradmin datasource list
liveapicreatoradmin datasource update --url_name demo --password kahuna_local!
liveapicreatoradmin datasource update --url_name finance --password kahuna_local!
#Update Settings
liveapicreatoradmin settings list
liveapicreatoradmin settings import --file demo/demo_settings.json
#Import Libraries
liveapicreatoradmin libraries import --file demo/demo_libraries.json
#Import Authproviders
liveapicreatoradmin authprovider import --file demo/demo_authprovider.js

#Wrapup and close connects
liveapicreatoradmin logout -a local
liveapicreatoradmin logout -a target