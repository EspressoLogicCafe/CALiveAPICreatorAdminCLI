# Managed Data Server
This suite of commands allows you to manipulate the managed_data_servers .
```
Usage: managedserver [options] <list|create|update|delete|import|export>

  Administer managed data server(s) within an account (must have role 'Data admin').

  Options:

    -h, --help                     output usage information
    --server_name [name]           The name of the managed data server 
    --dbasetype [dbasetype]        The type of the managed data server, can be mysql, derby, postgres
    --catalog_name [catalog_name]  The catalog in the managed data server
    --user_name [user_name]        The name of the managed data server user
    --password [password]          The password of the managed data server user
    --url [url]                    The JDBC URL for the managed data server url
    --comments [comment]           The comment used for this managed data server
    --file [file]                  Optional: for import/export, the name of a file to read from/save to, if unspecified, use stdin/stdout
```
***
## managedserver list
    lcadmin managedserver list

The `list` command shows all Managed Data Servers for the current account.

#### Output
    Managed Data Server(s)
    Ident  Name   Type   Active  Catalog  User   URL                         Comments
	-----  ----   -----  ------  -------  -----  --------------------------  --------
	2000   test           MySQL           user1  jdbc:derby:foo;create=true    

***
## managedserver create
    liveapicreatoradmin managedserver create --name <name> 
    	--user_name <db-user-name> 
    	--password <db-password>
    	[--url <db-url> ]
    	--dbasetype <type>
    	[--prefix <prefix>] 
    	[--catalog_name <catalog>] 
    	[--schema_name <schema>] 
    	[--port_num <port>]
    	[--comments <comments>]

The `create` command creates a new managed data server.

The `url` parameter should be a valid JDBC URL, such as:

    MySQL	    jdbc:mysql://<server-name>[:port-number (default 3306)]	
    Postgres	    jdbc:postgresql://<server-name>[:port-number (default 5432)]	
    Derby	    jdbc:derby://<server-dirname>[/<datasource-name>;create=true	
    

The `dbasetype` parameter must have one of the following values:

* `mysql`
* `postgres`
* `derby`

## managedserver update

```
lacadmin managedserver update 
		[ --server_name <name> ]
		[--user_name <db-user-name>] 
		[--password <db-password>]
    	[--url <db-url>] 
    	[--catalog_name <catalog>] 
    	[--active <true|false>]
    	[--comments <comments>]
```

***
## managedserver delete
    lacadmin managedserver delete [--server_name <name> | --ident <ident>]

The `delete` command deletes a managed data server from the current account.
Either the name of the or ident, must be specified (use list to get ident).

## managedserver export
Provide the ident of the managed data server and (optional) the export file name. If not provided - it will be sent to stdout.
```
lacadmin managedserver export  [--ident <ident> | --server_name <name> ] --file managedserver.json
```
This exports the specified managed data server(s) into a JSON file. If the filename parameter is not specified, stdout is used.

## managedserver import
Import a managed data server to the current account server (or one specified) using the name of the json file for the managedserver you wish to import.
```
lacadmin managedserver import --file managedserver.json
```
This imports the specified JSON file. If the filename parameter is not specified, stdin is used. (you can pipe the json file to the import)

