REM Generate the contents of an existing repository
REM SERVER=http://localhost:8080 -- Jetty
REM SERVER=http://localhost:8080/APIServer
REMO PROJECT=demo

REM  Connect to a local Jetty server
call lacadmin logout -a demo
call lacadmin login -u admin -p Password1 http://localhost:8080  -a demo
call lacadmin use demo
call lacadmin status

REM  Select Demo, nwnd (Northwind) or B2B Project
call lacadmin project use --url_name demo
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
call lacadmin license list
call lacadmin gateway list
call lacadmin managedserver list
call lacadmin function list
call lacadmin virtualkey list
call lacadmin sequence list
call lacadmin timer list
call lacadmin connection list
call lacadmin listener list
call lacadmin provider list

call lacadmin logout -a nwind

