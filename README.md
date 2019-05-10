

# LiveAPICreatorAdminCLI

## Description

This is a command-line tool to administer Layer7 Live API Creator (LAC) servers. It allows the creation,
modification and removal of many common repository objects, such as apis, database connection,
resources, rules, etc. As of release 5.0, all repository objects are written to the file system (LAC_REPOSITORY_ROOT).
The command line will export/import using the internal database format and is not compatible with the file system style.

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
   
      login [options] [url]                                                                            Login to a CA Live API Creator Server [login -u admin -p pw http://localhost:8080
      logout [options] [url]                                                                           Logout from the current server, or a named server alias [$lacadmin logout -a demo]
      use <alias>                                                                                      Use the specified server alias connection (if available)
      status                                                                                           Show the current server(s) connections and any defined server aliases
      license [options] <list|import>                                                                  Administer server License for connected API server.
      eula <accepted>                                                                                  End user license agreement status accepted (returns true or false)
      api [options] <list|create|update|delete|use|import|export|extract>                              Administer an API for the current connection.
      apioptions [options] <list|update|import|export>                                                 Administer API  options for a selected API.
      apiversion [options] <list|export|import>                                                        Administer API Versions for Resources for current API.
      application [options] <list|delete|import|export>                                                Administer Data Explorer Applications (meta data).
      authtoken [options] <list|import|export>                                                         Administer Auth Tokens for current API.
      authprovider [options] <list|create|linkProject|insertJSCode|delete|export|import>               Administer authentication providers for a TeamSpace.
      connection [options] <list|delete|export|import|stop|start>                                      Administer Connections for current API.
      custom_endpoints [options] <list|delete|export|import>                                           Administer Custom Endpoints (aka Handlers) for current API.
      dataprovider [options] <list|delete|export|import>                                               Administer Data Source Provider Framework definitions. (requires login as "sa")
      datasource [options] <list|create|createDatabase|update|delete|import|reload|export>             Administer data sources within a selected API.
      filter [options] <list|create|delete|update|import|export>                                       Administer Named Filters for the active API.
      function [options] <list|delete|export|import>                                                   Administer Functions for current API.
      gateway [options] <list|create|delete|import|export|publish>                                     Publish Swagger document for selected API to CA Gateway.
      libraries [options] <list|create|update|delete|export|import|exportJavascript|importJavascript>  Administer javascript libraries for a specific API.
      listener [options] <list|delete|export|import>                                                   Administer Listener Events for current API.
      managedserver [options] <list|create|delete|update|import|export>                                Administer a managed data server (used to create SQL data_sources).
      migrate [options] <list|plan|script|exportRepos>                                                 Migrate a or export all API content for a TeamSpace to a named file
      npa [options] <list|delete|export|import>                                                        Administer Non Persistent Attributes for the active API.
      project [options] <list|create|update|delete|use|import|export>                                  [Deprecated in 4.1 - replaced by lacadmin api] Administer 4.0 and earlier.
      provider [options] <list|delete|export|import>                                                   Administer Listener Provider Framework definitions. (requires login as "sa")
      relationship [options] <list|delete|export|import>                                               Administer Relationships for current API.
      request_event [options] <list|delete|export|import>                                              Administer Request, Response, & CORS Option events for current API.
      resource [options] <list|delete|update|export|import>                                            Administer resources within a project.
      role [options] <list|delete|import|export>                                                       Administer Security Roles for current API.
      rule [options] <list|create|delete|import|export>                                                Administer rules within a project.
      schema [options] <create>                                                                        Create new database table/columns using @schema format.
      sequence [options] <list|create|update|delete|import|export>                                     Manage a database sequence on a key column for a table or view.
      sort [options] <list|create|update|delete|import|export>                                         Administer Named Sorts for the active API.
      teamspace [options] <list|exportRepos>                                                           List TeamSpace content for current server or exportRepos the entire API contents.
      teamspace_user [options] <list|delete|export|import>                                             Administer TeamSpace Users definitions.
      telemetry [options] <list|update>                                                                Administer Telemetry PLA information (requires sa logon).
      timer [options] <list|delete|export|import>                                                      Administer Timer definitions for current API.
      topic [options] <list|delete|import|export>                                                      Administer Topics for current API (used by Rules).
      user [options] <list|delete|update|import|export>                                                Administer Users for current API. (not available if custom auth provider is used)
      virtualkey [options] <list|create|update|delete|import|export>                                   Manage a virtualkey to a table or view.

   
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
This is a small sampling of the export and list commands.  The command specific export will be in a format that is not compatible 
with the file system repository.  These formats may be used by devops automation tools.
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
## Section API Export
The api section and section_filter can be used to export portions of your api in the new 5.x style.  The export can be formatted as 
either json or zip.  The api section can be easily merged and compared with the file system repository.

```
$lacadmin api use --url_name demo
$mkdir temp
$lacadmin api export --section api --file temp/api.json --format json
$lacadmin api export --section api --file temp/API.zip --format zip
$lacadmin api export --section connections --file temp/connections.json
$lacadmin api export --section custom_endpoints --file temp/custom_endpoints.json
$lacadmin api export --section listeners --file temp/listeners.json
$lacadmin api export --section relationships --file temp/relationships.json
$lacadmin api export --section data_sources --file temp/datasources.json
$lacadmin api export --section filters --file temp/filters.json
$lacadmin api export --section functions --file temp/functions.json
$lacadmin api export --section libraries --file temp/libraries.json
$lacadmin api export --section request_events --file temp/request_events.json
$lacadmin api export --section sorts --file temp/sorts.json
$lacadmin api export --section timers --file temp/timers.json
$lacadmin api export --section topics --file temp/topics.json
$lacadmin api export --section security  --file temp/security.json
$lacadmin api export --section security.authtokens  --file temp/authtokens.json
$lacadmin api export --section security.roles --file temp/roles.json
$lacadmin api export --section security.users --file temp/users.json
$lacadmin api export --section resources --file temp/resources.json
$lacadmin api export --section rules --file temp/rules.json
$lacadmin api export --section apioptions --file temp/apioptions.json
```
## Section API Export with filter
You can further refine the section by using a specific section filter. 

```
mkdir temp2
$lacadmin api export --section connections --section_filter "name=MQTTConn" --file temp2/connections.json --format json
$lacadmin api export --section connections --section_filter "name=MQTTConn" --file temp2/connections.zip --format zip
$lacadmin api export --section custom_endpoints --section_filter "name=myendpoint" --file temp2/custom_endpoints.json
$lacadmin api export --section listeners --section_filter "name=START" --file temp2/listeners.json
$lacadmin api export --section data_sources --section_filter "prefix=demo" --file temp2/datasources.json
$lacadmin api export --section filters --section_filter "name=UserFilter" --file temp2/filters.json
$lacadmin api export --section functions --section_filter "name=testFunction" --file temp2/functions.json
$lacadmin api export --section libraries --section_filter "name=b2bB2B" --file temp2/libraries.json
$lacadmin api export --section request_events --section_filter "name=ResponseEvent"  --file temp2/request_events.json
$lacadmin api export --section sorts --section_filter "name=UserSort" --file temp2/sorts.json
$lacadmin api export --section timers --section_filter "name=New Timer" --file temp2/timers.json
$lacadmin api export --section topics --section_filter "name=Audit Orders"  --file temp2/topics.json
$lacadmin api export --section security.authtokens  --section_filter "name=Admin key" --file temp2/authtokens.json
$lacadmin api export --section security.roles --section_filter "name=Read only" --file temp2/roles.json
$lacadmin api export --section security.users --section_filter "name=guest" --file temp2/users.json
$lacadmin api export --section resources --section_filter "name=AllCustomers&version=v1" --file temp2/resources.json
$lacadmin api export --section rules --section_filter "name=sum_balance&prefix=demo"  --file temp2/rules.json


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

lacadmin api list --verbose
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
* [API Options](docs/apioptions.md)
* [Authentication Providers](docs/authprovider.md)
* [Applications](docs/application.md)
* [Auth Tokens](docs/token.md)
* [Connction](docs/connection.md)
* [Datasources](docs/dbase.md)
* [Libraries](docs/libraries.md)
* [License files](docs/license.md)
* [Listener](docs/listener.md)
* [Managed Server](docs/managedserver.md)
* [Named Filter](docs/filter.md)
* [Named Sorts](docs/sort.md)
* [Publish to Gateway](docs/gateway.md)
* [Resources](docs/resource.md)
* [Rules](docs/rule.md)
* [TeamSpace](docs/teamspace.md)
* [Telemetry (PLA Usage Data)](docs/telemetry.md)
* [Virtual Primary Keys](docs/virtualkey.md)
