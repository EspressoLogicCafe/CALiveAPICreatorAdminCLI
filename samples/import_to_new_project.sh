#! /bin/bash

#LACSERVER=http://localhost:8080/APIServer
LACSERVER=http://localhost:8080


## Connect to a local server
lacadmin logout -a nwind
lacadmin login -u admin -p Password1 $LACSERVER -a nwind
lacadmin use nwind
lacadmin status

lacadmin project list
##lacadmin project import --file nwind/nwind.json
##OR create a new project
lacadmin project use --url_name newproj
lacadmin project delete --url_name newproj
lacadmin project create --project_name NorthWindCopy --url_name newproj
lacadmin project use --url_name newproj

## Start Import
lacadmin libraries import --file nwind/libraries.json
lacadmin authprovider import --file nwind/authprovider.json
lacadmin authprovider linkProject --ident 1000
lacadmin apioptions import --file nwind/apioptions.json
lacadmin datasource import --file nwind/datasource.json
lacadmin datasource reload --prefix nw
lacadmin relationship import --file nwind/relationships.json
lacadmin topic import --file nwind/topic.json
lacadmin rule import --file nwind/rules.json 
lacadmin resource import --file nwind/resources.json
#security info
lacadmin role import --file nwind/roles.json
lacadmin token import --file nwind/tokens.json
lacadmin user import --file nwind/users.json
#other stuff
lacadmin namedsort import --file nwind/sorts.json
lacadmin namedfilter import --file nwind/filters.json
lacadmin apiversion import --file nwind/apiversions.json
lacadmin event import --file nwind/events.json
lacadmin handler import --file nwind/handlers.json
#lacadmin npa import --file nwind/npa.json
lacadmin snapshot start --name 'first project'

lacadmin project list
#lacadmin logout nwind