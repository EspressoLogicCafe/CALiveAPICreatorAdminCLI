#! /bin/bash

## Import Script

#Connect target server
liveapicreatoradmin logout -a target
liveapicreatoradmin login -u admin -p Password1 http://localhost:8080/APIServer -a target
liveapicreatoradmin use target

#Import Libraries and link 
liveapicreatoradmin libraries import --file demo/demo_libraries.json

#Import Project
liveapicreatoradmin project import --file demo/demo_mysql.json
liveapicreatoradmin project list
## should automatically use imported project use --url_name demo_mysql-20160114-173500.832p0000
#
#Import Libraries and link to current project - should automatically mark as used
liveapicreatoradmin libraries list

#Fixup Datasources Passwords - can update any of the parameters
liveapicreatoradmin datasource list
liveapicreatoradmin datasource update --url_name demo --password passw!
liveapicreatoradmin datasource update --url_name finance --password passw!

#Update Settings
liveapicreatoradmin settings list
liveapicreatoradmin settings import --file demo/demo_settings.json
#liveapicreatoradmin settings update ??

#Import Authprovider into current project
liveapicreatoradmin authprovider import --file demo/demo_authprovider.js


##RULES

liveapicreatoradmin rule create --ruletype parentcopy --entity_name demo:LineItem --rule_name null --attribute_name product_price --role_name product --parent_attribute price --active A --comments 'Parent copy means order unaffected by product price changes'
liveapicreatoradmin rule create --ruletype sum --entity_name demo:PurchaseOrder --attribute_name amount_total --rule_name null --role_name LineItemList --child_attribute amount --expression null --active A --comments 'sum of line item amounts'
liveapicreatoradmin rule list



#Wrapup and close connections
liveapicreatoradmin logout -a target