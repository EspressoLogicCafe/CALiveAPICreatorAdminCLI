
## Connect to a local server
lacadmin logout -a local
lacadmin login -u admin -p Password1 http://localhost:8080 -a nwind
lacadmin status

lacadmin project list
##lacadmin project import --file nwind/nwind.json
lacadmin project use --url_name MyNewProject
lacadmin project delete --url_name MyNewProject
lacadmin project create --project_name MyNewProject --url_name newproj
lacadmin project use --url_name newproj

## Start Import
lacadmin libraries import --file nwind/libraries.json
lacadmin authprovider import --file nwind/authprovider.json
lacadmin apioptions import --file nwind/apioptions.json
lacadmin datasource import --file nwind/datasource.json
lacadmin relationship import --file nwind/relationships.json
lacadmin topic import --file nwind/topic.json
lacadmin rule import --file nwind/rules.json 
lacadmin resource import --file nwind/resources.json

lacadmin role import --file nwind/roles.json
lacadmin token import --file nwind/tokens.json
lacadmin user import --file nwind/users.json

lacadmin namedsort import --file nwind/sorts.json
lacadmin namedfilter import --file nwind/filters.json
lacadmin apiversion import --file nwind/apiversions.json
lacadmin event import --file nwind/events.json
lacadmin handler import --file nwind/handlers.json

lacadmin project list
lacadmin logout nwind