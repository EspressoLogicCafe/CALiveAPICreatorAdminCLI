
## Connect to a local server
node liveapicreatoradmin.js logout -a local
node liveapicreatoradmin.js login -u admin -p Password1 http://localhost:8080 -a nwind
node liveapicreatoradmin.js status
## import into new project 
node liveapicreatoradmin.js project list
##node liveapicreatoradmin.js project import --file nwind/nwind.json
node liveapicreatoradmin.js project use --url_name foo
node liveapicreatoradmin.js project delete --url_name foo
node liveapicreatoradmin.js project create --project_name foo --url_name foo
node liveapicreatoradmin.js project use --url_name foo
node liveapicreatoradmin.js libraries import --file nwind/libraries.json
node liveapicreatoradmin.js authprovider import --file nwind/authprovider.json
node liveapicreatoradmin.js apioptions import --file nwind/apioptions.json
node liveapicreatoradmin.js datasource import --file nwind/datasource.json
node liveapicreatoradmin.js relationship import --file nwind/relationships.json

node liveapicreatoradmin.js topic import --file nwind/topic.json
node liveapicreatoradmin.js rule import --file nwind/rules.json 
#node liveapicreatoradmin.js resource import --file nwind/resources.json

node liveapicreatoradmin.js role import --file nwind/roles.json
node liveapicreatoradmin.js token import --file nwind/tokens.json
node liveapicreatoradmin.js user import --file nwind/users.json

node liveapicreatoradmin.js namedsort import --file nwind/sorts.json
node liveapicreatoradmin.js namedfilter import --file nwind/filters.json
node liveapicreatoradmin.js apiversion import --file nwind/apiversions.json
node liveapicreatoradmin.js event import --file nwind/events.json
node liveapicreatoradmin.js handler import --file nwind/handlers.json

node liveapicreatoradmin.js project list
#node liveapicreatoradmin.js logout nwind