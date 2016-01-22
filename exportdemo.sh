#! /bin/bash

mkdir demo

## Export from local server
liveapicreatoradmin logout -a local
liveapicreatoradmin login -u admin -p Password1 http://localhost:8080/APIServer -a local
liveapicreatoradmin use local
liveapicreatoradmin status

# Projects
liveapicreatoradmin project use --url_name demo
liveapicreatoradmin project list
liveapicreatoradmin project use --url_name demo_mysql
liveapicreatoradmin project export --url_name demo_mysql --file demo/demo_mysql.json
#API Settings
liveapicreatoradmin apioptions list
liveapicreatoradmin apioptions export --file demo/apioptions.json
# Data Sources
liveapicreatoradmin datasource list
liveapicreatoradmin datasource export --prefix demo --file demo/demo_ds.json
liveapicreatoradmin datasource export --prefix finance --file demo/finance_ds.json
#Libraries - change the <ident> to the value from the list
liveapicreatoradmin libraries list
liveapicreatoradmin libraries export --ident 2041 --file demo/demo_libraries.json
#Auth Providers
liveapicreatoradmin authprovider list
liveapicreatoradmin authprovider export --ident 2022 --file demo/demo_authprovider.json
liveapicreatoradmin authprovider export --name RESTAuthSecurityProviderCreateJS --file demo/demo_RESTAuthSecurityProviderCreateJS.json
#Rules
liveapicreatoradmin rule list --verbose
liveapicreatoradmin rule export --file demo/rules.json
#Resources
liveapicreatoradmin resource list
liveapicreatoradmin resource export --file demo/resources.json

liveapicreatoradmin logout -a local

