#! /bin/bash
# Export Script for Northwind Jetty

## Export from local server
liveapicreatoradmin logout -a local
liveapicreatoradmin login -u admin -p Password1 http://localhost:8080 -a local
liveapicreatoradmin use local
# Projects
liveapicreatoradmin project list
liveapicreatoradmin project use --url_name nwind
liveapicreatoradmin project export --url_name nwind --file nw/nwind.json
#API Settings
liveapicreatoradmin settings list
liveapicreatoradmin settings export --file nw/nw_settings.json
# Data Sources
liveapicreatoradmin datasource list
liveapicreatoradmin datasource export --prefix nw --file nw/derby_ds.json
#Libraries
liveapicreatoradmin libraries list
liveapicreatoradmin libraries export --ident 2000 --file nw/auth_libraries.json
#Auth Providers
liveapicreatoradmin authprovider list
liveapicreatoradmin authprovider export --ident 2000 --file nw/nw_authprovider.json

#Rules
liveapicreatoradmin rule list --verbose
liveapicreatoradmin rule export --file nw/rules.json
#Resources
liveapicreatoradmin resource list
liveapicreatoradmin resource export --file nw/resources.json

#liveapicreatoradmin logout -a local

