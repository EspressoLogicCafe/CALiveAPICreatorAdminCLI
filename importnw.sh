#! /bin/bash
# import Script for Northwind Jetty

## Export from local server
liveapicreatoradmin logout -a local
liveapicreatoradmin login -u admin -p Password1 http://localhost:8080 -a local
liveapicreatoradmin use local

#Libraries
liveapicreatoradmin libraries import --file nw/auth_libraries.json
liveapicreatoradmin libraries list

# Projects
liveapicreatoradmin project import --file nw/nwind.json
liveapicreatoradmin project list

#API Settings
liveapicreatoradmin settings list
liveapicreatoradmin settings import --file nw/nw_settings.json

# Data Sources
liveapicreatoradmin datasource list
#liveapicreatoradmin datasource update --prefix nw --password password1 -- Jetty does not use pw

#Auth Providers
liveapicreatoradmin authprovider list
liveapicreatoradmin authprovider import --file nw/nw_authprovider.json

#Rules
liveapicreatoradmin rule list --verbose
#liveapicreatoradmin rule import --file nw/rules.json

#Resources
liveapicreatoradmin resource list
#liveapicreatoradmin resource import --file nw/resources.json

#close connections
liveapicreatoradmin logout -a local