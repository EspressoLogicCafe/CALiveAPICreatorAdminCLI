#! /bin/bash
# Generate the contents of an existing repository
SERVER=http://localhost:8080/APIServer
#SERVER=http://localhost:8080
PROJECT=demo

## Connect to a local server $SERVER and use API Project $PROEJCT
lacadmin logout -a local
lacadmin login -u admin -p Password1 $SERVER  -a $PROJECT
lacadmin use $PROJECT
lacadmin status

# Select Northwind B2B Project
lacadmin project use --url_name $PROJECT
lacadmin project list
lacadmin apioptions list
lacadmin datasource list
lacadmin libraries list
lacadmin authprovider list
lacadmin rule list 
lacadmin resource list
lacadmin relationship list
lacadmin token list
lacadmin role list
lacadmin user list
lacadmin namedsort list
lacadmin namedfilter list
lacadmin apiversion list
lacadmin event list
lacadmin handler list
lacadmin topic list
lacadmin npa list
lacadmin gateway list
lacadmin snapshot list

lacadmin logout -a $PROJECT

