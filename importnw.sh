#! /bin/bash
# import Script for Northwind Jetty

## Export from local server
liveapicreatoradmin logout -a local
liveapicreatoradmin login -u admin -p Password1 http://localhost:8080 -a local
liveapicreatoradmin use local

#Libraries
#liveapicreatoradmin libraries create --name RestAuthProviderJS  --comments RESTAuthProvider js Demo --shortName restauth --libtype javascript --ver 1.0 --file nw/RESTAuthSecurityProvider.js
liveapicreatoradmin import --file nw/RestAuthSecurityProvider.json
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
liveapicreatoradmin authprovider create --name RESTAuthSecurityProviderCreate --createFunction LDAPAuthProviderCreate --paramMap logonApiKey=Lvnq9CYXN5oYoiToWGkN,loginBaseURL=http://localhost:8080/rest/default/nwind/v1/nw%3AEmployees,loginGroupURL=http://localhost:8080/rest/default/nwind/v1/nw%3ARegion --comments none --name customAuth
liveapicreatoradmin authprovider linkProject --name RESTAuthSecurityProviderCreateJS

#Rules
liveapicreatoradmin rule list --verbose
#liveapicreatoradmin rule import --file nw/rules.json

#Resources
liveapicreatoradmin resource list
#liveapicreatoradmin resource import --file nw/resources.json

#close connections
liveapicreatoradmin logout -a local