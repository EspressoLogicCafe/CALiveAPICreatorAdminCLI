

mkdir demo
ECHO ON
REM Export from local server
call liveapicreatoradmin logout -a local
call liveapicreatoradmin login -u admin -p Password1 http://localhost:8080/APIServer -a local
call liveapicreatoradmin use local
call liveapicreatoradmin status

REM Projects
call liveapicreatoradmin project use --url_name demo
call liveapicreatoradmin project list
call liveapicreatoradmin project use --url_name demo_mysql
call liveapicreatoradmin project export --url_name demo_mysql --file demo/demo_mysql.json
#API Settings
call liveapicreatoradmin apioptions list
call liveapicreatoradmin apioptions export --file demo/apioptions.json
REM Data Sources
call liveapicreatoradmin datasource list
call liveapicreatoradmin datasource export --prefix demo --file demo/demo_ds.json
call liveapicreatoradmin datasource export --prefix finance --file demo/finance_ds.json
#Libraries - change the <ident> to the value from the list
call liveapicreatoradmin libraries list
call liveapicreatoradmin libraries export --ident 2041 --file demo/demo_libraries.json
#Auth Providers
call liveapicreatoradmin authprovider list
call liveapicreatoradmin authprovider export --ident 2022 --file demo/demo_authprovider.json
call liveapicreatoradmin authprovider export --name RESTAuthSecurityProviderCreateJS --file demo/demo_RESTAuthSecurityProviderCreateJS.json
#Rules
call liveapicreatoradmin rule list --verbose
call liveapicreatoradmin rule export --file demo/rules.json
#Resources
call liveapicreatoradmin resource list
call liveapicreatoradmin resource export --file demo/resources.json

call liveapicreatoradmin logout -a local

