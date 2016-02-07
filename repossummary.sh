#! /bin/bash


## Connect to a local server
node liveapicreatoradmin.js logout -a local
node liveapicreatoradmin.js login -u admin -p Password1 http://localhost:8080 -a nwind
node liveapicreatoradmin.js use nwind s
node liveapicreatoradmin.js status

# Select a Project
node liveapicreatoradmin.js project use --url_name nwindb2b
node liveapicreatoradmin.js project list
node liveapicreatoradmin.js apioptions list
node liveapicreatoradmin.js datasource list
node liveapicreatoradmin.js libraries list
node liveapicreatoradmin.js authprovider list
node liveapicreatoradmin.js rule list 
node liveapicreatoradmin.js resource list
node liveapicreatoradmin.js relationship list
node liveapicreatoradmin.js token list
node liveapicreatoradmin.js role list
node liveapicreatoradmin.js user list
node liveapicreatoradmin.js namedsort list
node liveapicreatoradmin.js namedfilter list
node liveapicreatoradmin.js apiversion list
node liveapicreatoradmin.js event list
node liveapicreatoradmin.js handler list
node liveapicreatoradmin.js topic list

## Export everything
mkdir nwind
node liveapicreatoradmin.js project export --file nwind/nwind.json
node liveapicreatoradmin.js apioptions export --file nwind/apioptions.json
node liveapicreatoradmin.js datasource export --file nwind/datasource.json
node liveapicreatoradmin.js libraries export --file nwind/libraries.json
node liveapicreatoradmin.js authprovider export --file nwind/authprovider.json
node liveapicreatoradmin.js rule export --file nwind/rules.json 
node liveapicreatoradmin.js resource export --file nwind/resources.json
node liveapicreatoradmin.js relationship export --file nwind/relationships.json
node liveapicreatoradmin.js token export --file nwind/tokens.json
node liveapicreatoradmin.js role export --file nwind/roles.json
node liveapicreatoradmin.js user export --file nwind/users.json
node liveapicreatoradmin.js namedsort export --file nwind/sorts.json
node liveapicreatoradmin.js namedfilter export --file nwind/filters.json
node liveapicreatoradmin.js apiversion export --file nwind/apiversions.json
node liveapicreatoradmin.js event export --file nwind/events.json
node liveapicreatoradmin.js handler export --file nwind/handlers.json
node liveapicreatoradmin.js topic export --file nwind/topic.json

node liveapicreatoradmin.js logout -a nwind

