REM Windows Command file to create a new project using exported parts
REM SERVER=http://localhost:8080/APIServer -- WAR
REM SERVER=http://localhost:8080 -- Jetty Only

REM  Connect to a local server
call lacadmin logout -a local
call lacadmin login -u admin -p Password1 http://localhost:8080/ -a nwind
call lacadmin status

call lacadmin project list
REM call lacadmin project import --file nwind/nwind.json
REM OR create a new project
call lacadmin project use --url_name newproj
call lacadmin project delete --url_name newproj
call lacadmin project create --project_name MyNewProject --url_name newproj
call lacadmin project use --url_name newproj

REM  Start Import
call lacadmin libraries import --file nwind/libraries.json
call lacadmin authprovider import --file nwind/authprovider.json
call lacadmin authprovider linkProject --ident 1000
call lacadmin apioptions import --file nwind/apioptions.json
call lacadmin datasource import --file nwind/datasource.json
call lacadmin datasource reload --prefix nw
call lacadmin relationship import --file nwind/relationships.json
call lacadmin topic import --file nwind/topic.json
call lacadmin rule import --file nwind/rules.json 
call lacadmin resource import --file nwind/resources.json
REM security info
call lacadmin role import --file nwind/roles.json
call lacadmin token import --file nwind/tokens.json
call lacadmin user import --file nwind/users.json
REM other stuff
call lacadmin namedsort import --file nwind/sorts.json
call lacadmin namedfilter import --file nwind/filters.json
call lacadmin apiversion import --file nwind/apiversions.json
call lacadmin event import --file nwind/events.json
call lacadmin handler import --file nwind/handlers.json
call lacadmin npa import --file nwind/npa.json
call lacadmin snapshot start --name 'first project'

call lacadmin project list
call lacadmin logout nwind