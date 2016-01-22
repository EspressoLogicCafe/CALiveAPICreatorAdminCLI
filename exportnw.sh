#! /bin/bash
# Export Script for Northwind Jetty

mkdir nw

## Export from local server (use localhost:8080/APIServer for WAR install)
liveapicreatoradmin logout -a local
liveapicreatoradmin login -u admin -p Password1 http://localhost:8080/APIServer -a local
liveapicreatoradmin use local

# Projects
liveapicreatoradmin project list
liveapicreatoradmin project use --url_name nwind
liveapicreatoradmin project export --url_name nwind --file nw/nwind.json

#API Option Settings
liveapicreatoradmin apioptions list
liveapicreatoradmin apioptions export --file nw/nw_apioptions.json

# Data Sources
liveapicreatoradmin datasource list
liveapicreatoradmin datasource export --prefix nw --file nw/derby_ds.json

#Libraries
liveapicreatoradmin libraries list
liveapicreatoradmin libraries export --short_name restjs --file nw/auth_libraries.json

#Auth Providers
liveapicreatoradmin authprovider list
liveapicreatoradmin authprovider export --name RESTAuthSecurityProviderCreateJS --file nw/nw_authprovider.json

#Rules
liveapicreatoradmin rule list --verbose
liveapicreatoradmin rule export --file nw/rules.json

#Resources
liveapicreatoradmin resource list
liveapicreatoradmin resource export --file nw/resources.json

liveapicreatoradmin logout -a local

