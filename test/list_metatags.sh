#! /bin/bash

# Uses NodeJS and Live API Creator command line interface
# npm install liveapicreator-cli -g
# Live API Creator @meta REST endpoints
## add  --format json for a full JSON response


SERVER=http://localhost:8080/rest/default/demo/v1
#echo 1
# Note that the URL contains the entire path to the project 
lac login -u demo -p Password1 $SERVER -a demo
lac use demo

lac get -h

#Show the current license info (add --format json) for full EULA
lac get @license

#returns OK if server is up
lac get @heartbeat

# Show All Tables and columns for selected table
lac get @tables --format json
lac get @tables/*

# Show All views and columns for selected view
lac get @views --format json
lac get @views/*

# Show All Resoures and attribute for selected resources (using ident)
lac get @resources --format json
lac get @resources/*

# Show All Store Proc and attribute for sele


#show stored procs (using ident)
lac get @procedures --format json
lac get @procedures/*
#lac get @procedures/somename


#List of Rules
lac get @rules

#API Project settings
lac get @apioptions

#Information on the default auth provider
lac get @auth_provider_info/2002


#Information from the Auth Provider
lac get @login_info

# Swagger 2.0 doc format
#lac get @docs
