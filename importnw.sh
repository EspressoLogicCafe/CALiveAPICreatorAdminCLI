#! /bin/bash
# import Script for Northwind Jetty

## Logon to local  Jetty server (if WAR file use http://localhost:8080/APIServer) 
liveapicreatoradmin logout -a local
liveapicreatoradmin login -u admin -p Password1 http://localhost:8080/APIServer -a local
liveapicreatoradmin use local
liveapicreatoradmin status
liveapicreatoradmin project use --url_name nwind
#Libraries - need to import these before import of JSON project
#We can create the Library and use an existing JS library.  To update / delete and recreate.
#liveapicreatoradmin libraries create --name RESTAuthSecurityProviderCreateJS project --short_name restauth --libtype javascript --ver 1.0 --file nw/RESTAuthSecurityProvider.js  --comments RESTAuthProvider js Demo 
liveapicreatoradmin libraries import --linkProject --file nw/auth_libraries.json
liveapicreatoradmin libraries list

# Projects - this is the default NorthWind JSON project - if you import - load libraries first
#liveapicreatoradmin project import --file nw/nwind.json
liveapicreatoradmin project use --url_name nwind
liveapicreatoradmin project list

#API Settings [Optional]
liveapicreatoradmin apioptions list
liveapicreatoradmin apioptions import --file nw/apioptionsjson

# Data Sources [optional] for other databases - set the password
liveapicreatoradmin datasource list
#liveapicreatoradmin datasource update --prefix nw --password password1 -- Jetty does not use pw

#Auth Providers - lets create a new one and link it to the current project
liveapicreatoradmin authprovider list
liveapicreatoradmin authprovider create --name RESTAuthSecurityProviderCreateJS --createFunction RESTAuthSecurityProviderCreate --paramMap logonApiKey=Lvnq9CYXN5oYoiToWGkN,loginBaseURL=http://localhost:8080/rest/default/nwind/v1/nw%3AEmployees,loginGroupURL=http://localhost:8080/rest/default/nwind/v1/nw%3ARegion --comments Uses NW Employees for REST Validation
liveapicreatoradmin authprovider linkProject --name RESTAuthSecurityProviderCreateJS

#Rules [optional] - this will export each rule in a single JSON file, but the --verbose will output each rule for create
liveapicreatoradmin rule list --verbose
#liveapicreatoradmin rule import --file nw/rules.json

#Resources [optional] how to load a complete set of reseources
liveapicreatoradmin resource list
#liveapicreatoradmin resource import --file nw/resources.json

#close connections
liveapicreatoradmin logout -a local