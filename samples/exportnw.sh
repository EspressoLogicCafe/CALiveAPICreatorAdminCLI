#! /bin/bash
# Export Script for Northwind Jetty

#npm install liveapicreator-admin-cli -g
echo "Create export directory nw"
mkdir nw

ehco' Export from local server (use localhost:8080/APIServer for WAR install)'
liveapicreatoradmin logout -a local
liveapicreatoradmin login -u admin -p Password1 http://localhost:8080/APIServer -a local
liveapicreatoradmin use local

echo 'Export NW Project by name'
liveapicreatoradmin project list
liveapicreatoradmin project use --url_name nwindb2b
liveapicreatoradmin project export --url_name nwindb2b --file nw/nwind.json

echo 'API Option Settings'
liveapicreatoradmin apioptions list
liveapicreatoradmin apioptions export --file nw/nw_apioptions.json

echo 'Export Data Sources'
liveapicreatoradmin datasource list
liveapicreatoradmin datasource export --prefix nw --file nw/derby_ds.json

#Libraries
liveapicreatoradmin libraries list
liveapicreatoradmin libraries export --name RESTAuthSecurityProviderCreate --file nw/auth_libraries.json

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

