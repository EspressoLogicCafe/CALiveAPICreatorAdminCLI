

# LiveAPICreatorAdminCLI

## Description

This is a command-line tool to administer API Creator servers. It allows the creation,
modification and deletion of many common objects, such as projects, database connection,
resources and rules.

## Installation

    npm install liveapicreator-admin-cli

Please note that, on Windows (and sometimes Mac), `npm install` will create an executable 
called `liveapicreatoradmin` in your
`<node_modules>/.bin` directory. If this directory is not in your `PATH`, you will probably
want to fix that, otherwise you'll have to specify the full path to the executable.  You can also try 
npm install -g liveapicreator-admin-cli

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

    login [options] <url>                                            Login to an API Creator server
    logout [options] [url]                                           Logout from the current server, or a specific server
    use <alias>                                                      Use the specified server by default
    status                                                           Show the current server, and any defined server aliases
    project [options] <list|create|update|delete|use|import|export>  Administer projects. Actions are: list, create, update, delete, use, export
    datasources [options] <list|create|update|delete>                Administer datasources within a project.
    resource [options] <list>                                        Administer resources within a project.
    rule [options] <list|create|delete>                              Administer rules within a project.
    authprovider [options] <list|create|delete|export|import>        Administer authentication providers for an account.
    libraries [options] <list|create|update|delete|export>           Administer user libraries for an account.

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
## Object-specific commands
Follow the links below for detailed documentation on specific administrator commands.
* [Projects](docs/project.md)
* [Authentication providers](docs/authprovider.md)
* [Datasources](docs/dbase.md)
* [Resources](docs/resource.md)
* [Rules](docs/rule.md)
* [Libraries](docs/libraries.md)

