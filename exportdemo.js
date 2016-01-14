#! /bin/bash

## Export from local server
liveapicreatoradmin logout -a local
liveapicreatoradmin login -u admin -p Password1 http://localhost:8080/APIServer -a local
# Projects
liveapicreatoradmin project list
liveapicreatoradmin project use --url_name demo_mysql
liveapicreatoradmin project export --url_name demo_mysql --file demo/demo_mysql.json
#API Settings
liveapicreatoradmin settings list
liveapicreatoradmin settings export --file demo/demo_settings.json
# Data Sources
liveapicreatoradmin datasource list
liveapicreatoradmin datasource export --prefix demo --file demo/demo_ds.json
liveapicreatoradmin datasource export --prefix demo2 --file demo/demo2_ds.json
liveapicreatoradmin datasource export --prefix finance --file demo/finance_ds.json
#Libraries
liveapicreatoradmin libraries list
liveapicreatoradmin libraries export --ident 2007 --file demo/demo_libraries.json
#Auth Providers
liveapicreatoradmin authprovider list
liveapicreatoradmin authprovider export --ident 2010 --file demo/demo_authprovider.js
#Rules
liveapicreatoradmin rules list --verbose
liveapicreatoradmin rules export --file demo/rules.json
#Resources
liveapicreatoradmin resource list
liveapicreatoradmin resource export --file demo/resources.json

#Import into target server
liveapicreatoradmin logout -a target
liveapicreatoradmin login -u admin -p Password1 http://localhost:8080/APIServer -a target
liveapicreatoradmin use target
#Import Project
#liveapicreatoradmin project import --file demo/demo_mysql.json
liveapicreatoradmin project list
liveapicreatoradmin project use --url_name demo_mysql-20160114-173500.832p0000
#Fixup Datasources
liveapicreatoradmin datasource list
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
