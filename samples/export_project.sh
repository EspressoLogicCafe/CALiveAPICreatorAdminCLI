#! /bin/bash
LACSERVER=http://localhost:8080
#LACSERVER=http://localhost:8080/APIServer
USERNAME=admin
PW=Password1
PROJECT=demo

## Connect to a local server
lacadmin logout -a $PROJECT
lacadmin login -u $USERNAME -p $PW $LACSERVER -a $PROJECT
lacadmin use $PROJECT
lacadmin status

# Select a Project
lacadmin project use --url_name $PROJECT

## Export everything
mkdir -p $PROJECT

lacadmin project export --file $PROJECT/$PROJECT.json
lacadmin apioptions export --file $PROJECT/apioptions.json
lacadmin datasource export --file $PROJECT/datasource.json
lacadmin libraries export --file $PROJECT/libraries.json
lacadmin authprovider export --file $PROJECT/authprovider.json
lacadmin rule export --file $PROJECT/rules.json
lacadmin resource export --ident 2022 --file $PROJECT/resources.json
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
lacadmin virtualkey export --file $PROJECT/virtualkey.json
lacadmin connection export --file $PROJECT/connection.json
lacadmin listener export --file $PROJECT/listener.json
lacadmin timer export --file $PROJECT/timer.json
# provider requires an sa login (project_ident=3)
#lacadmin provider export --provider_name Startup --file $PROJECT/provider.json
$lacadmin sequence export --file $PROJECT/sequence.json
lacadmin logout -a $PROJECT
