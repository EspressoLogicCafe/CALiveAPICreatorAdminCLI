#! /bin/bash
#! /bin/bash
# Generate the contents of an existing repository
SERVER=http://localhost:8080/APIServer
#SERVER=http://localhost:8080
PROJECT=demo

mkdir demo

## Export from local server
lacadmin logout -a local
lacadmin login -u admin -p Password1 $SERVER -a $PROJECT
lacadmin use $PROJECT
lacadmin status

# Projects
lacadmin project list
lacadmin project use --url_name $PROJECT

lacadmin project use --url_name demo_mysql
lacadmin project export --url_name demo_mysql --file demo/demo_mysql.json
#API Settings
lacadmin apioptions list
lacadmin apioptions export --file demo/apioptions.json
# Data Sources
lacadmin datasource list
lacadmin datasource export --prefix demo --file demo/demo_ds.json
lacadmin datasource export --prefix finance --file demo/finance_ds.json
#Libraries - change the <ident> to the value from the list
lacadmin libraries list
lacadmin libraries export --ident 2041 --file demo/demo_libraries.json
#Auth Providers
lacadmin authprovider list
lacadmin authprovider export --ident 2022 --file demo/demo_authprovider.json
lacadmin authprovider export --name RESTAuthSecurityProviderCreateJS --file demo/demo_RESTAuthSecurityProviderCreateJS.json
#Rules (--verbose will print out rules in lacadmin create format)
lacadmin rule list --verbose
lacadmin rule export --file demo/rules.json
#Resources
lacadmin resource list
lacadmin resource --ident 2177 export --file demo/resources.json
#Function
lacadmin function list
lacadmin function export --file demo/function.json

lacadmin logout -a $PROJECT

