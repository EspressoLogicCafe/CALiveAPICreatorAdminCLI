#! /bin/bash

#LACSERVER=http://localhost:8080/APIServer
LACSERVER=http://localhost:8080
PROJECT=demo

## Connect to a local server
lacadmin logout -a $PROJECT
lacadmin login -u admin -p Password1 $LACSERVER -a $PROJECT
lacadmin use $PROJECT
lacadmin status

# Select a Project
lacadmin project use --url_name $PROJECT

## Export everything
mkdir -p $PROJECT

lacadmin snapshot start --name snapshot1
lacadmin project export --file $PROJECT/$PROJECT.json
lacadmin apioptions export --file $PROJECT/apioptions.json
lacadmin datasource export --file $PROJECT/datasource.json
lacadmin libraries export --file $PROJECT/libraries.json
lacadmin authprovider export --file $PROJECT/authprovider.json
lacadmin rule export --file $PROJECT/rules.json 
lacadmin resource export --file $PROJECT/resources.json
lacadmin relationship export --file $PROJECT/relationships.json
lacadmin token export --file $PROJECT/tokens.json
lacadmin role export --file $PROJECT/roles.json
lacadmin user export --file $PROJECT/users.json
lacadmin namedsort export --file $PROJECT/sorts.json
lacadmin namedfilter export --file $PROJECT/filters.json
lacadmin apiversion export --file $PROJECT/apiversions.json
lacadmin event export --file $PROJECT/events.json
lacadmin handler export --file $PROJECT/handlers.json
lacadmin topic export --file $PROJECT/topic.json
lacadmin npa export --file $PROJECT/npa.json
lacadmin gateway export --file $PROJECT/gateway.json
#lacadmin snapshot restore --name snapshot1

lacadmin logout -a $PROJECT

