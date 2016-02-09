REM Export Northwind B2B example into smaller JSON parts 
REM SERVER=http://localhost:8080/APIServer
REM SERVER=http://localhost:8080 -- Jetty Only
REM  Connect to a local server
call lacadmin logout -a nwind
call lacadmin login -u admin -p Password1 http://localhost:8080 -a nwind
call lacadmin use nwind
call lacadmin status

REM  Select a Project
call lacadmin project use --url_name nwindb2b

REM  Export everything
mkdir -p nwind

call lacadmin snapshot start --name snapshot1
call lacadmin project export --file nwind/nwind.json
call lacadmin apioptions export --file nwind/apioptions.json
call lacadmin datasource export --file nwind/datasource.json
call lacadmin libraries export --file nwind/libraries.json
call lacadmin authprovider export --file nwind/authprovider.json
call lacadmin rule export --file nwind/rules.json 
call lacadmin resource export --file nwind/resources.json
call lacadmin relationship export --file nwind/relationships.json
call lacadmin token export --file nwind/tokens.json
call lacadmin role export --file nwind/roles.json
call lacadmin user export --file nwind/users.json
call lacadmin namedsort export --file nwind/sorts.json
call lacadmin namedfilter export --file nwind/filters.json
call lacadmin apiversion export --file nwind/apiversions.json
call lacadmin event export --file nwind/events.json
call lacadmin handler export --file nwind/handlers.json
call lacadmin topic export --file nwind/topic.json
call lacadmin snapshot restore --name snapshot1

call lacadmin logout -a nwind

