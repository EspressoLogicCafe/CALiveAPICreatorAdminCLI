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
liveapicreatoradmin datasource export --prefix finance --file demo/finance_ds.json
#Libraries
liveapicreatoradmin libraries list
liveapicreatoradmin libraries export --ident 2030 --file demo/demo_libraries.json
#Auth Providers
liveapicreatoradmin authprovider list
liveapicreatoradmin authprovider export --ident 2010 --file demo/demo_authprovider.json
#Rules
liveapicreatoradmin rules list --verbose
liveapicreatoradmin rules export --file demo/rules.json
#Resources
liveapicreatoradmin resource list
liveapicreatoradmin resource export --file demo/resources.json

