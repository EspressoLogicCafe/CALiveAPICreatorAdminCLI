

# LiveAPICreatorAdminCLI

## Description

This is a command-line tool to administer API Creator servers. It allows the creation,
modification and deletion of many common objects, such as projects, database connection,
resources and rules.

## Installation

    npm install liveapicreator-admin-cli -g
    
    note: MAC users may need to use $sudo npm install liveapicreator-admin-cli -g.

Please note that, on Windows (and sometimes Mac), `npm install` will create an executable 
called `lacadmin` (or `liveapicreatoradmin`) in your
{userhome}/`<node_modules>/.bin` directory. If this directory is not in your `PATH`, you will probably
want to fix that, otherwise you'll have to specify the full path to the executable.  You can also try 
npm install liveapicreator-admin-cli -g

***
## Login

    lacadmin login <url> -u <user-name> -p <password> [-a <alias>]

### Parameters

The URL will normally be the address of the server, such as:

    http://localhost:8080
    http://localhost:8080/APIServer
    http://api.acme.com

If you specify an alias, then you will be able to refer to that connection using that alias.
This is useful if you plan to work with several LAC API servers at the same time.

Regardless, this command sets your *current server* -- see [the use command](/use/) below.

### Example
    $ lacadmin login -u fred -p secret https://api.acme.com -a myAcmeAlias
    Logging in...
    This server licensed to: Acme Inc.
    Login successful, API key will expire on: 2019-11-27T03:36:55.266Z
    $lacadmin use myAcmeAlais
    You are now using server http://api.acme.com/rest/abl/admin/v2 as user fred

***
## Command Line Service
```sh
$ lacadmin --help

  Usage: lacadmin [options] [command]

  Commands:

    login [options] [url]                                                                 Login to an LAC API server
    logout [options] [url]                                                                Logout from the current server, or a specific server
    use <alias>                                                                           Use the specified server by default
    status                                                                                Show the current server, and any defined server aliases
    project [options] <list|create|update|delete|use|import|export>                       Administer API projects.
    datasource [options] <list|create|createDatabase|update|delete|import|reload|export>  Administer datasources within a project.
    resource [options] <list|delete|update|export>                                        Administer resources (user defined endpoints) within a project.
    rule [options] <list|create|delete|import|export>                                     Administer rules within a project.
    authprovider [options] <list|create|linkProject|delete|export|import>                 Administer authentication providers for an account.
    libraries [options] <list|create|update|delete|export|import>                         Administer JavaScript libraries for an account.
    apioptions [options] <list|update|import|export>                                      Administer API project options for an account.
    namedsort [options] <list|create|update|delete|import|export>                         Administer Named Sorts for the active API Project.
    namedfilter [options] <list|create|delete|update|import|export>                       Administer Named filter for the active API Project.
    token [options] <list|export|import>                                                  Administer Auth Tokens for current project.
    role [options] <list|export|import>                                                   Administer Roles for current project.
    user [options] <list|update|export|import>                                            Administer Users for current project.
    npa [options] <list|create|export>                                                    Administer Non Persistent Attributes for the active API Project.
    topic [options] <list|export|import>                                                  Administer Topics for current project.
    event [options] <list|export|import>                                                  Administer Request & Response Events for current project.
    handler [options] <list|export|import>                                                Administer Custom Endpoints (Handlers) for current project.
    apiversion [options] <list|export|import>                                             Administer API Versions for Resources for current project.
    relationship [options] <list|export|import>                                           Administer Relationships (aka Virtual Keys) for current project.
    snapshot [options] <list|start|restore>                                               List or start a project snapshot (backup) for current project.
    gateway [options] <list|create|import|export|publish>                                 Publish Swagger document for current project to Gateway.
    managedserver [options] <list|create|update|delete|import|export>                     Administer a managed data server (used by @databases to create datasources, tables, columns, and relatioships).
    migrate [options] <exportRepos>                                                       Migrate will create export files, user libraries, auth providers, gateways, and projects in the connection and export to a named directory
    schema [options] <create>                                                             Administer Schema exports and creation for current project.
    function [options] <list|export|import>                                               Administer Functions (user defined JavaScript endpoints) for a current project.
    eula <accepted>                                                                       Returns true or false - end user license agreement must be accepted before any script will run
    
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
lacadmin logout -a local
lacadmin login -u admin -p Password1 http://localhost:8080 -a localnw
lacadmin use localnw

# Projects
lacadmin project list
lacadmin project use --url_name nwind
lacadmin project export --url_name nwind --file nw/project_nwind.json

#API Optins
lacadmin apioptions list
lacadmin apioptions export --file nw/apioptions.json

# Data Sources
lacadmin datasource list
lacadmin datasource export --prefix nw --file nw/ds_derby.json

#Libraries
lacadmin libraries list
lacadmin libraries export --ident 2100 --file nw/auth_libraries.json

#Auth Providers
lacadmin authprovider list
lacadmin authprovider export --ident 2100 --file nw/nw_authprovider.json

#Rules
lacadmin rule list --verbose
lacadmin rule export --file nw/rules.json

#Resources
lacadmin resource list
lacadmin resource export --file nw/resources.json

#lacadmin logout -a localnw

```

##Import
```
#! /bin/bash
# import Script for Northwind Jetty

## Logon to local  Jetty server (if local server using a WAR file use http://localhost:8080/APIServer) 
lacadmin logout -a localnw
lacadmin login -u admin -p Password1 http://localhost:8080 -a localnw
lacadmin use localnw

#Libraries - need to import these before import of JSON project
#We can create the Library and use an existing JS library.  To update / delete and recreate.
#lacadmin libraries create --name RestAuthProviderJS  --comments RESTAuthProvider js Demo --shortName restauth --libtype javascript --ver 1.0 --file nw/RESTAuthSecurityProvider.js
lacadmin libraries import --file nw/auth_libraries.json
lacadmin libraries list

# Projects - this is the default NorthWind JSON project
lacadmin project import --file nw/project_nwind.json
lacadmin project list

#API API Options [Optional]
lacadmin apioptions list
lacadmin apioptions import --file nw/apioptions.json

# Data Sources [optional] for other databases - set the password
lacadmin datasource list
#lacadmin datasource update --prefix nw --password password1 -- Jetty does not use pw

#Auth Providers - lets create a new one and link it to the current project
lacadmin authprovider list
lacadmin authprovider create --name RESTAuthSecurityProviderCreate --createFunction LDAPAuthProviderCreate --paramMap logonApiKey=Lvnq9CYXN5oYoiToWGkN,loginBaseURL=http://localhost:8080/rest/default/nwind/v1/nw%3AEmployees,loginGroupURL=http://localhost:8080/rest/default/nwind/v1/nw%3ARegion --comments Uses NW Employees for REST Validation
lacadmin authprovider linkProject --name RESTAuthSecurityProviderCreateJS

#Rules [optional] - this will export each rule in a single JSON file, but the --verbose will output each rule for create
lacadmin rule list --verbose
#lacadmin rule import --file nw/rules.json

#Resources [optional]
lacadmin resource list
#lacadmin resource import --file nw/resources.json

#close connections
lacadmin logout -a localnw

```

#Sample Repository Report Script
```
lacadmin logout -a local
lacadmin login -u admin -p Password1 http://localhost:8080 -a local
lacadmin use local
lacadmin status

# Select A Project
lacadmin project use --url_name demo
lacadmin project list
lacadmin apioptions list
lacadmin datasource list
lacadmin libraries list
lacadmin authprovider list
lacadmin rule list --verbose
lacadmin resource list
lacadmin relationship list
lacadmin token list
lacadmin role list
lacadmin user list
lacadmin namedsort list
lacadmin namedfilter list
lacadmin apiversion list
lacadmin event list
lacadmin handler list
lacadmin topic list
lacadmin apiversion list
lacadmin managedserer list
lacadmin function list
lacadmin logout -a local
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
* [License files](docs/license.md)

