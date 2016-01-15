

# LiveAPICreatorAdminCLI

## Description

This is a command-line tool to administer API Creator servers. It allows the creation,
modification and deletion of many common objects, such as projects, database connection,
resources and rules.

## Installation

    npm install liveapicreator-admin-cli -g
    
    note: MAC users may need to use $sudo npm install ...

Please note that, on Windows (and sometimes Mac), `npm install` will create an executable 
called `liveapicreatoradmin` in your
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

    login [options] <url>  -alias [name]                             Login to an API Creator server using an alias name (multiple connections can be active)
    logout [options] [url] -alias [name]                             Logout from the current server, or an alias specific server 
    use <alias>                                                      Use the specified login aliasserver by default
    status                                                           Show the current server, and any defined server aliases
    project [options] <list|create|update|delete|use|import|export>  Administer projects. Actions are: list, create, update, delete, use, export
    datasources [options] <list|create|update|delete>                Administer datasources within a project.
    resource [options] <list>                                        Administer resources within a project.
    rule [options] <list|create|delete>                              Administer rules within a project.
    authprovider [options] <list|create|delete|export|import>        Administer authentication providers for an account.
    libraries [options] <list|create|update|delete|export>           Administer user libraries for an account.
    settings [options] <list|update|import|export>                   Administer project settings for an account.

  Options:

    -h, --help     output usage information
    -V, --version  output the version number

```
## Logout

    liveapicreatoradmin logout [-a <alias>]

This will log you out of the current server, unless you specify an alias,
in which case you will be logged out of that server.

***
## Use

    liveapicreatoradmin use <alias>

This switches the current server to the specified alias.

***
## Status

    liveapicreatoradmin status
    
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

## Export from local server
liveapicreatoradmin logout -a local
liveapicreatoradmin login -u admin -p Password1 http://localhost:8080 -a local
liveapicreatoradmin use local

# Projects
liveapicreatoradmin project list
liveapicreatoradmin project use --url_name nwind
liveapicreatoradmin project export --url_name nwind --file nw/nwind.json

#API Settings
liveapicreatoradmin settings list
liveapicreatoradmin settings export --file nw/nw_settings.json

# Data Sources
liveapicreatoradmin datasource list
liveapicreatoradmin datasource export --prefix nw --file nw/derby_ds.json

#Libraries
liveapicreatoradmin libraries list
liveapicreatoradmin libraries export --ident 2000 --file nw/auth_libraries.json

#Auth Providers
liveapicreatoradmin authprovider list
liveapicreatoradmin authprovider export --ident 2000 --file nw/nw_authprovider.json

#Rules
liveapicreatoradmin rule list --verbose
liveapicreatoradmin rule export --file nw/rules.json

#Resources
liveapicreatoradmin resource list
liveapicreatoradmin resource export --file nw/resources.json

liveapicreatoradmin logout -a local
```
## Object-specific commands
Follow the links below for detailed documentation on specific administrator commands.
* [Projects](docs/project.md)
* [Authentication providers](docs/authprovider.md)
* [Datasources](docs/dbase.md)
* [Resources](docs/resource.md)
* [Rules](docs/rule.md)
* [Libraries](docs/libraries.md)
* [Settings](docs/settings.md)

