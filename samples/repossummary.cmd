REM Generate the contents of an existing repository

SERVER=http://localhost:8080/APIServer
REM SERVER=http://localhost:8080 -- Jetty Only
REM  Connect to a local Jetty server
call lacadmin logout -a local
call lacadmin login -u admin -p Password1 http://localhost:8080  -a nwind
call lacadmin use nwind
call lacadmin status

REM  Select Northwind B2B Project
call lacadmin project use --url_name nwindb2b
call lacadmin project list
call lacadmin apioptions list
call lacadmin datasource list
call lacadmin libraries list
call lacadmin authprovider list
call lacadmin rule list 
call lacadmin resource list
call lacadmin relationship list
call lacadmin token list
call lacadmin role list
call lacadmin user list
call lacadmin namedsort list
call lacadmin namedfilter list
call lacadmin apiversion list
call lacadmin event list
call lacadmin handler list
call lacadmin topic list
call lacadmin npa list
call lacadmin snapshot list

call lacadmin logout -a nwind

