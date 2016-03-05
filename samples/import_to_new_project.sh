#! /bin/bash

LACSERVER=http://localhost:8080/APIServer
#LACSERVER=http://localhost:8080
PROJECT=nwindb2b
NEWPROJECT=b2bcopy
PASSWORD=password
PREFIX=nw

## Connect to a local server
lacadmin logout -a $PROJECT
lacadmin login -u admin -p Password1 $LACSERVER -a $PROJECT
lacadmin use $PROJECT
lacadmin status

lacadmin project list
#This first way will import the entire project and all content 
##lacadmin project import --file $PROJECT/$PROJECT.json
##This shows how to create a new project from each json component
lacadmin project use --url_name $NEWPROJECT
lacadmin project delete --url_name $NEWPROJECT
lacadmin project create --project_name "NewProject - $NEWPROJECT" --url_name $NEWPROJECT
lacadmin project use --url_name $NEWPROJECT

## Start Import
lacadmin libraries import --file $PROJECT/libraries.json
lacadmin authprovider import --file $PROJECT/authprovider.json
lacadmin authprovider linkProject --ident 1000
lacadmin apioptions import --file $PROJECT/apioptions.json
lacadmin datasource import --file $PROJECT/datasource.json
lacadmin datasource update --password $PASSWORD --prefix $PREFIX
lacadmin datasource reload --prefix $PREFIX
lacadmin relationship import --file $PROJECT/relationships.json
lacadmin topic import --file $PROJECT/topic.json
lacadmin rule import --file $PROJECT/rules.json 
lacadmin resource import --file $PROJECT/resources.json
#security info
lacadmin role import --file $PROJECT/roles.json
lacadmin token import --file $PROJECT/tokens.json
lacadmin user import --file $PROJECT/users.json
#other stuff
lacadmin namedsort import --file $PROJECT/sorts.json
lacadmin namedfilter import --file $PROJECT/filters.json
lacadmin apiversion import --file $PROJECT/apiversions.json
lacadmin event import --file $PROJECT/events.json
lacadmin handler import --file $PROJECT/handlers.json
#lacadmin npa import --file $PROJECT/npa.json
lacadmin snapshot start --name 'first project'

lacadmin project list
#lacadmin logout nwind