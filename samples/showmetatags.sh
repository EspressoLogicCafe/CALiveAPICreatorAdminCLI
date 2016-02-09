la#! /bin/bash

# Uses NodeJS and Live API Creator command line interface
# npm install liveapicreator-cli -g
# Live API Creator meta @ rest endpoints

SERVER=http://localhost:8080/APIServer/rest/default/nwindb2b/v1
#echo 1
# Note that the URL contains the entire path to the project 
lac login -u demo -p Password1 $SERVER -a localnw
lac use localnw

#Show the current license info (add --format json) for full EULA
lac get @license

#returns OK if server is up
lac get @heartbeat

# Show All Tables and columns for selected table
lac get @tables
lac get @tables/nw:Customers

# Show All views and columns for selected view
lac get @views
lac get @views/nw:Current%20Product%20List

# Show All Resoures and attribute for selected resources (using ident)
lac get @resources
lac get @resources/2961

# Show All Store Proc and attribute for sele


cted proc (using ident)
lac get @procedures
#lac get @procedures/somename

#Show the performance metrics for sql, rules, and admin SQL (add --format json) for detailed view
lac get @perf --format json
lac get @perf/sql?projectId=2047
lac get @perf/rules?projectId=2047  
lac get @perf/adminSql?projectId=2047 

#List of Rules
lac get @rules

#API Project settings
lac get @apioptions

#Information on the default auth provider
lac get @auth_provider_info/1000

# Swagger 2.0 doc format
lac get @docs


#Information from the Auth Provider
lac get @login_info