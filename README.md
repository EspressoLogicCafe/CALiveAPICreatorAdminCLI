

# LiveAPICreatorAdminCLI

## Description

This is a command-line tool to administer CA Live API Creator (LAC) servers. It allows the creation,
modification and removal of many common repository objects, such as apis, database connection,
resources and rules.  

## Installation
```aidl
    git clone https://github.com/EspressoLogicCafe/liveapicreator-devops.git
    cd liveapicreator-devops
    
    Select one of three directories (platform: windows, linux, and macos) and copy the 'lac' and 'lacadmin' to your
    path where you intend to run your scripts.

```

***
## Login

    lacadmin login <url> -u <user-name> -p <password> [-a <alias>]

### Parameters

The URL will normally be the address of the server, such as:

    http://localhost:8080
    http://localhost:8080/APIServer
    http://api.acme.com
    https://196.198.1.1:8137

If you specify an alias (-a), then you will be able to refer to that connection using that alias (lacadmin use <alias>).
This is useful if you plan to work with several Live API Creator (LAC) API servers at the same time.

Regardless, this command sets your *current server* -- see [the use command](/use/) below.

### Example
    $ lacadmin login -u fred -p secret https://api.acme.com -a myAcmeAlias
    Logging in...
    This server licensed to: Acme Inc.
    Login successful, API key will expire on: 2019-11-27T03:36:55.266Z
    $lacadmin use myAcmeAlais
    You are now using server http://api.acme.com/rest/abl/admin/v2 as user fred

***
## Admin Command Line Service
## Help
```
$ lacadmin --help

  Usage: lacadmin [options] [command]
  
  
    Commands:
   
       login [options] [url]                                                                 Login to a CA Live API Creator (LAC) Server (e.g. lacadmin login -u admin -p secret http://localhost:8080 -a demo).
       logout [options] [url]                                                                Logout from the current server, or a specific named alias.
       use <alias>                                                                           Use the specified server alias connection (if available).
       status                                                                                Show the current server(s) connections and any defined server aliases
       license [options] <list|import>                                                       Administer server License for connected API server.
       eula <accepted>                                                                       End user license agreement status (note: must be accepted before any script will run) returns true or false.
       project [options] <list|create|update|delete|use|import|export>                       [Deprecated] Administer 4.0 and earlier project API. Actions are: list, create, update, delete, use, export.
       api [options] <list|create|update|delete|use|import|export|extract>                   Administer an API for the current connection. Actions are: list, create, update, delete, use, import, export, extract.
       libraries [options] <list|create|update|delete|export|import>                         Administer javascript libraries for a specific API.
       authprovider [options] <list|create|linkProject|delete|export|import>                 Administer authentication providers for a TeamSpace.
       datasource [options] <list|create|createDatabase|update|delete|import|reload|export>  Administer data sources within a selected API.
       resource [options] <list|delete|update|export|import>                                 Administer resources within a project.
       rule [options] <list|create|delete|import|export>                                     Administer rules within a project.
       apioptions [options] <list|update|import|export>                                      Administer API  options for a selected API.
       sort [options] <list|create|update|delete|import|export>                              Administer Named Sorts for the active API.
       filter [options] <list|create|delete|update|import|export>                            Administer Named Filters for the active API.
       authtoken [options] <list|import|export>                                              Administer Auth Tokens for current API.
       role [options] <list|delete|import|export>                                            Administer Security Roles for current API.
       user [options] <list|delete|update|import|export>                                     Administer Users for current API. (not available if custom auth provider is used).
       npa [options] <list|delete|export|import>                                             Administer Non Persistent Attributes for the active API.
       topic [options] <list|delete|import|export>                                           Administer Topics for current API (used by Rules).
       request_event [options] <list|delete|export|import>                                   Administer Request, Response, & CORS Option events for current API.
       custom_endpoints [options] <list|delete|export|import>                                Administer Custom Endpoints (aka Handlers) for current API.
       apiversion [options] <list|export|import>                                             Administer API Versions for Resources for current API.
       relationship [options] <list|delete|export|import>                                    Administer Relationships for current API.
       gateway [options] <list|create|delete|import|export|publish>                          Publish Swagger document for selected API to CA Gateway.
       managedserver [options] <list|create|delete|update|import|export>                     Administer a managed data server (used by data_sources).
       schema [options] <create>                                                             Create new database table/columns using @schema format.
       function [options] <list|delete|export|import>                                        Administer Functions for current API.
       virtualkey [options] <list|create|update|delete|import|export>                        Manage a virtualkey to a table or view.
       sequence [options] <list|create|update|delete|import|export>                          Manage a database sequence on a key column for a table or view.
       listener [options] <list|delete|export|import>                                        Administer Listener Events for current API.
       provider [options] <list|delete|export|import>                                        Administer Listener Provider definitions. (requires login as "sa").
       connection [options] <list|delete|export|import|stop|start>                           Administer Connections for current API.
       timer [options] <list|delete|export|import>                                           Administer Timer definitions for current API.
       application [options] <list|delete|import|export>                                     Administer Data Explorer Applications (meta data).
       teamspace [options] <list|exportRepos>                                                List TeamSpace content for current server or exportRepos the entire API contents.
   
  Options:

    -h, --help     output usage information
    -V, --version  output the version number

```

## Login
This will log you in to one or more CA Live API Creator (LAC) API Servers - the alias allows multiple connections to be used at the same time (see use command)

```
    lacadmin login -u admin -p myAdminPassword http://localhost:8080 [-a <alias>]
    Logging in...
    This server licensed to: CA Technologies license_type: TRIAL
    Login successful, API key will expire on: 2017-12-18T14:03:48.464Z

```

***
## Logout
This will log you out of the select LAC API server, unless you specify an alias,
in which case you will be logged out of that server.
```
    lacadmin logout [-a <alias>]
```

***
## Use
The use command will switch between one or more active server connections. The status command will show you all connections.
```
    lacadmin use <alias>
```

This switches the current server to the specified alias.

***
## Status
Prints which server is the current server (if any) and project, and what aliases are defined (if any).

```
    $lacadmin status
    No aliases currently defined
    You are not currently logged in to any admin server
    You cannot run this command because you are not currently logged in.(lacadmin login --help)
    OR
    $lacadmin status
    No aliases currently defined
    You are currently logged in to admin server: http://localhost:8080/rest/abl/admin/v2 as user admin
    There is no current project.

```

### Status Output

    Defined alias:
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
This is a small sampling of the export and list commands.
```
#! /bin/bash
# Export Script for Northwind Jetty

mkdir nw
## Export from local server
lacadmin logout -a local
lacadmin login -u admin -p Password1 http://localhost:8080 -a localnw
lacadmin use localnw

# Projects
lacadmin api list
lacadmin api use --url_name nwind
lacadmin api export --url_name nwind --file nw/project_nwind.json --format json --passwordstyle skip

#API Options
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

## Sample Import Script
```
#! /bin/bash
# import Script for Northwind Jetty

## Logon to local  Jetty server (if local server using a WAR file use http://localhost:8080/APIServer) 
lacadmin logout -a localnw
lacadmin login -u admin -p Password1 http://localhost:8080 -a localnw
lacadmin use localnw


# Projects - this is the default NorthWind JSON project
lacadmin api export --file project_nwind.json --format json --passwordstyle plaintext
#or export file as zip
#lacadmin api export --file project_nwind.zip --format zip --passwordstyle encrypted

lacadmin api import --file project_nwind.json --namecollision replace_existing
#lacadmin api import --file projct_nwind.zip --namecollision rename_new
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

# Select An API using url fragment name
lacadmin api use --url_name demo

lacadmin api list
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
lacadmin sort list
lacadmin filter list
lacadmin apiversion list
lacadmin event list
lacadmin handler list
lacadmin topic list
lacadmin apiversion list
lacadmin managedserer list
lacadmin function list
lacadmin virtualkey list
lacadmin sequence list
lacadmin timer list
lacadmin listener list
lacadmin connection list
lacadmin application list
lacadmin teamspace list --verbose

lacadmin logout -a local
```

## Object-specific commands
Follow the links below for detailed documentation on specific administrator commands.
* [API](docs/api.md)
* [Libraries](docs/libraries.md)
* [Rules](docs/rule.md)
* [Authentication Providers](docs/authprovider.md)
* [Datasources](docs/dbase.md)
* [Resources](docs/resource.md)
* [API Options](docs/apioptions.md)
* [Auth Tokens](docs/token.md)
* [Named Sorts](docs/sort.md)
* [Named Filter](docs/filter.md)
* [Publish to Gateway](docs/gateway.md)
* [License files](docs/license.md)
* [Virtual Primary Keys](docs/virtualkey.md)
* [Managed Server](docs/managedserver.md)
* [Connction](docs/connection.md)
* [Listener](docs/listener.md)
* [Applications](docs/application.md)
* [TeamSpace](docs/teamspace.md)
