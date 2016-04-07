

# LiveAPICreatorAdminCLI

## Description

This is a command-line tool to administer API Creator servers. It allows the creation,
modification and deletion of many common objects, such as projects, database connection,
resources and rules.

## Installation

    npm install liveapicreator-admin-cli -g
    
    note: MAC users may need to use $sudo npm install ...

Please note that, on Windows (and sometimes Mac), `npm install` will create an executable 
called `liveapicreatoradmin` (or `lacadmin` as a shortcut) in your
{userhome}/`<node_modules>/.bin` directory. If this directory is not in your `PATH`, you will probably
want to fix that, otherwise you'll have to specify the full path to the executable.  You can also try 
npm install liveapicreator-admin-cli -g

***
## Login

    liveapicreatoradmin login <url> -u <user-name> -p <password> [-a <alias>]

### Parameters

The URL will normally be the address of the server, such as:

    http://localhost:8080
    http://localhost:8080/APIServer
    http://api.acme.com

If you specify an alias, then you will be able to refer to that connection using that alias.
This is useful if you plan to work with several servers at the same time.

Regardless, this command sets your *current server* -- see [the use command](/use/) below.

### Example
    $ liveapicreatoradmin login https://api.acme.com -u fred -p secret
    Logging in...
    This server licensed to: Acme Inc.
    Login successful, API key will expire on: 2014-11-27T03:36:55.266Z

***
## Command Line Service
```sh
$ liveapicreatoradmin --help

  Usage: liveapicreatoradmin [options] [command]

  Commands:

    login [options] <url>                                                  Login to an API server
    logout [options] [url]                                                 Logout from the current server, or a specific server
    use <alias>                                                            Use the specified server by default
    status                                                                 Show the current server, and any defined server aliases
    project [options] <list|create|update|delete|use|import|export>        Administer projects. Actions are: list, create, update, delete, use, export
    datasource [options] <list|create|update|delete|import|export>         Administer datasources within a project.
    resource [options] <list|create|delete|import|export>                  Administer resources within a project.
    rule [options] <list|create|delete|export>                             Administer rules within a project.
    authprovider [options] <list|create|linkProject|delete|export|import>  Administer authentication providers for an account.
    libraries [options] <list|create|update|delete|export|import>          Administer java and javascript libraries for an account.
    apioptions [options] <list|update|import|export>                       Administer API project options for an account.
    namedsort [options] <list|create|update|delete|import|export>          Administer Named Sorts for the active API Project.
    namedfilter [options] <list|create|delete|update|import|export>        Administer Named filter for the active API Project.
    token [options] <list|export|import>                                   Administer Auth Tokens for current project.
    role [options] <list|export|import>                                    Administer Roles for current project.
    user [options] <list|export|import>                                    Administer Users for current project.
    topic [options] <list|export|import>                                   Administer Topics for current project.
    event [options] <list|export|import>                                   Administer Request & Response Events for current project.
    handler [options] <list|export|import>                                 Administer Custom Endpoints (Handlers) for current project.
    apiversion [options] <list|export|import>                              Administer API Versions for Resources for current project.
    relationship [options] <list|export|import>                            Administer Relationships (Virtual Keys) for current project.
    snapshot [options] <list|start>                                        List or start a project snapshot (backup) for current project.
 	gateway <list|create|import|export|publish>         				   Publish Swagger 2.0 document for current project to CA Gateway.    
    
  Options:

    -h, --help     output usage information
    -V, --version  output the version number

```

## login

    lacadmin login -u admin -p myAdminPassword http://localhost:8080 [-a <alias>]

This will log you in to one of the current servers - the alias allows multiple connections to be used at the same time (see use command)

***
## Logout

    lacadmin logout [-a <alias>]

This will log you out of the current server, unless you specify an alias,
in which case you will be logged out of that server.

***
## Use
The use command will switch between one or more active server connections 

    lacadmin use <alias>

This switches the current server to the specified alias.

***
## Status

    lacadmin status
    
Prints which server is the current server (if any) and project, and what aliases are defined (if any).

### Output

    Defined aliases:
    ┌───────┬───────────────────────────────────────────────────────┬───────┐
    │ Alias │ Server                                                │ User  │
    ├───────┼───────────────────────────────────────────────────────┼───────┤
    │ api   │ http://api.acme.com/rest/abl/admin/v2                 │ admin │
    └───────┴───────────────────────────────────────────────────────┴───────┘
    You are currently logged in to admin server: http://acme.my.server.com/rest/abl/admin/v2 as user acme
    Current project is: Acme Sales [1234] - url_name: sales

***


### Sample Export Script
You can combine each command to export parts of your system into components that can later be used in source control and then promoted to different servers.
```
#! /bin/bash
# Export Script for Northwind Jetty

mkdir nw
## Export from local server
liveapicreatoradmin logout -a local
liveapicreatoradmin login -u admin -p Password1 http://localhost:8080 -a local
liveapicreatoradmin use local

# Projects
liveapicreatoradmin project list
liveapicreatoradmin project use --url_name nwind
liveapicreatoradmin project export --url_name nwind --file nw/nwind.json

#API Optins
liveapicreatoradmin apioptions list
liveapicreatoradmin apioptions export --file nw/apioptions.json

# Data Sources
liveapicreatoradmin datasource list
liveapicreatoradmin datasource export --prefix nw --file nw/derby_ds.json

#Libraries
liveapicreatoradmin libraries list
liveapicreatoradmin libraries export --ident 2100 --file nw/auth_libraries.json

#Auth Providers
liveapicreatoradmin authprovider list
liveapicreatoradmin authprovider export --ident 2100 --file nw/nw_authprovider.json

#Rules
liveapicreatoradmin rule list --verbose
liveapicreatoradmin rule export --file nw/rules.json

#Resources
liveapicreatoradmin resource list
liveapicreatoradmin resource export --file nw/resources.json

#liveapicreatoradmin logout -a local

```

##Import
```
#! /bin/bash
# import Script for Northwind Jetty

## Logon to local  Jetty server (if WAR file use http://localhost:8080/APIServer) 
liveapicreatoradmin logout -a local
liveapicreatoradmin login -u admin -p Password1 http://localhost:8080 -a local
liveapicreatoradmin use local

#Libraries - need to import these before import of JSON project
#We can create the Library and use an existing JS library.  To update / delete and recreate.
#liveapicreatoradmin libraries create --name RestAuthProviderJS  --comments RESTAuthProvider js Demo --shortName restauth --libtype javascript --ver 1.0 --file nw/RESTAuthSecurityProvider.js
liveapicreatoradmin libraries import --file nw/auth_libraries.json
liveapicreatoradmin libraries list

# Projects - this is the default NorthWind JSON project
liveapicreatoradmin project import --file nw/nwind.json
liveapicreatoradmin project list

#API API Options [Optional]
liveapicreatoradmin apioptions list
liveapicreatoradmin apioptions import --file nw/apioptions.json

# Data Sources [optional] for other databases - set the password
liveapicreatoradmin datasource list
#liveapicreatoradmin datasource update --prefix nw --password password1 -- Jetty does not use pw

#Auth Providers - lets create a new one and link it to the current project
liveapicreatoradmin authprovider list
liveapicreatoradmin authprovider create --name RESTAuthSecurityProviderCreate --createFunction LDAPAuthProviderCreate --paramMap logonApiKey=Lvnq9CYXN5oYoiToWGkN,loginBaseURL=http://localhost:8080/rest/default/nwind/v1/nw%3AEmployees,loginGroupURL=http://localhost:8080/rest/default/nwind/v1/nw%3ARegion --comments Uses NW Employees for REST Validation
liveapicreatoradmin authprovider linkProject --name RESTAuthSecurityProviderCreateJS

#Rules [optional] - this will export each rule in a single JSON file, but the --verbose will output each rule for create
liveapicreatoradmin rule list --verbose
#liveapicreatoradmin rule import --file nw/rules.json

#Resources [optional]
liveapicreatoradmin resource list
#liveapicreatoradmin resource import --file nw/resources.json

#close connections
liveapicreatoradmin logout -a local

```

#Sample Repository Report Script
```
liveapicreatoradmin logout -a local
liveapicreatoradmin login -u admin -p Password1 http://localhost:8080/APIServer -a local
liveapicreatoradmin use local
liveapicreatoradmin status

# Select A Project
liveapicreatoradmin project use --url_name demo
liveapicreatoradmin project list
liveapicreatoradmin apioptions list
liveapicreatoradmin datasource list
liveapicreatoradmin libraries list
liveapicreatoradmin authprovider list
liveapicreatoradmin rule list --verbose
liveapicreatoradmin resource list
liveapicreatoradmin relationship list
liveapicreatoradmin token list
liveapicreatoradmin role list
liveapicreatoradmin user list
liveapicreatoradmin namedsort list
liveapicreatoradmin namedfilter list
liveapicreatoradmin apiversion list
liveapicreatoradmin event list
liveapicreatoradmin handler list
liveapicreatoradmin topic list
liveapicreatoradmin apiversion list
liveapicreatoradmin logout -a local
```

## Object-specific commands
Follow the links below for detailed documentation on specific administrator commands.
* [Projects](docs/project.md)
* [Authentication Providers](docs/authprovider.md)
* [Datasources](docs/dbase.md)
* [Resources](docs/resource.md)
* [Rules](docs/rule.md)
* [Libraries](docs/libraries.md)
* [API Options](docs/apioptions.md)
* [Auth Tokens](docs/token.md)
* [Named Sorts](docs/sort.md)
* [Named Filter](docs/filter.md)
* [Publish to Gateway](docs/gateway.md)

