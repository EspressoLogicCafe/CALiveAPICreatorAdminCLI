#! /bin/bash
## run test_export for demo then run #test_import for demo_new -
## this will use the new export to diff the 2 projects
LACSERVER=http://localhost:8080
#LACSERVER=http://localhost:8080/APIServer
USERNAME=admin
PW=Password1
PROJECT=demo
PROJECT_NEW=demo_new

## Connect to a local server
node ../liveapicreatoradmin.js logout -a $PROJECT
node ../liveapicreatoradmin.js login -u $USERNAME -p $PW $LACSERVER -a $PROJECT
node ../liveapicreatoradmin.js use $PROJECT
node ../liveapicreatoradmin.js status

# Select a Project
node ../liveapicreatoradmin.js project use --url_name $PROJECT

## Export everything as both JSON and ZIP
#rm -rf project_new_zip
ECHO =======================================
ECHO EXPORT $PROJECT as both zip and JSON
ECHO =======================================
mkdir -p $PROJECT

node ../liveapicreatoradmin.js project export --file $PROJECT/$PROJECT.json --format json
node ../liveapicreatoradmin.js project export --file $PROJECT/$PROJECT.zip  --format zip

mkdir -p project_zip

## Extract the files from zip and synchronize
node ../liveapicreatoradmin.js project extract --file $PROJECT/$PROJECT.zip  --directory project_zip
node ../liveapicreatoradmin.js project extract --file $PROJECT/$PROJECT.zip  --directory project_zip  --synchronize true
ECHO =======================================
ECHO Import this project and then repeat the export and diff
ECHO =======================================
node ../liveapicreatoradmin.js project import --file $PROJECT/$PROJECT.zip
ECHO =======================================
mkdir -p project_new_zip
ECHO =======================================
node ../liveapicreatoradmin.js project use --url_name $PROJECT
node ../liveapicreatoradmin.js project export --url_name $PROJECT --file $PROJECT/$PROJECT_NEW.json  --format json
node ../liveapicreatoradmin.js project export --file $PROJECT/$PROJECT_NEW.zip  --format zip
node ../liveapicreatoradmin.js project extract --file $PROJECT/$PROJECT_NEW.zip  --directory project_new_zip  --synchronize true
ECHO ====================================================
ECHO Compare original extract with import and new extract
ECHO ====================================================
diff source_project_zip project_new_zip

lacadmin logout $PROJECT




