#! /bin/bash

#SERVER=http://localhost:8080/APIServer
SERVER=http://localhost:8080
## Connect to a local server
lacadmin logout -a nwind
lacadmin login -u admin -p Password1 $SERVER -a nwind
lacadmin use nwind
lacadmin status

# Select a Project
lacadmin project use --url_name nwindb2b

## Export everything
mkdir -p nwind

lacadmin snapshot start --name snapshot1
lacadmin project export --file nwind/nwind.json
lacadmin apioptions export --file nwind/apioptions.json
lacadmin datasource export --file nwind/datasource.json
lacadmin libraries export --file nwind/libraries.json
lacadmin authprovider export --file nwind/authprovider.json
lacadmin rule export --file nwind/rules.json 
lacadmin resource export --file nwind/resources.json
lacadmin relationship export --file nwind/relationships.json
lacadmin token export --file nwind/tokens.json
lacadmin role export --file nwind/roles.json
lacadmin user export --file nwind/users.json
lacadmin namedsort export --file nwind/sorts.json
lacadmin namedfilter export --file nwind/filters.json
lacadmin apiversion export --file nwind/apiversions.json
lacadmin event export --file nwind/events.json
lacadmin handler export --file nwind/handlers.json
lacadmin topic export --file nwind/topic.json
#lacadmin npa export --file nwind/npa.json
#lacadmin snapshot restore --name snapshot1

lacadmin logout -a nwind

