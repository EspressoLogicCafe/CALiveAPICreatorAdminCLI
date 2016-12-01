#! /bin/bash

## Import Script
SERVER=http://localhost:8080/APIServer
#SERVER=http://localhost:8080

#Connect target server
lacadmin logout -a target
lacadmin login -u admin -p Password1 $SERVER -a target
lacadmin use target

#Import Libraries and link 
lacadmin libraries import --file demo/libraries.json

#Import Project
lacadmin project import --file demo/demo_mysql.json
lacadmin project list
## should automatically use imported project use --url_name demo_mysql-20160114-173500.832p0000
#
#Import Libraries and link to current project - should automatically mark as used
lacadmin libraries list

#Fixup Datasources Passwords - can update any of the parameters
lacadmin datasource list
lacadmin datasource update --prefix demo --password password!
lacadmin datasource update --prefix finance --password password!

#Update Settings
lacadmin apioptions list
lacadmin apioptions import --file demo/apioptions.json
#lacadmin apioptions update --ident <ident> --option_value <true|false>

#Import Authprovider into current project
lacadmin authprovider import --file demo/authprovider.js

#Functions
lacadmin functions import --file demo/functions.js

##RULES

lacadmin rule create --ruletype parentcopy --entity_name demo:LineItem --rule_name null --attribute_name product_price --role_name product --parent_attribute price --active A --comments 'Parent copy means order unaffected by product price changes'
lacadmin rule create --ruletype sum --entity_name demo:PurchaseOrder --attribute_name amount_total --rule_name null --role_name LineItemList --child_attribute amount --expression null --active A --comments 'sum of line item amounts'
lacadmin rule list



#Wrapup and close connections
lacadmin logout -a target