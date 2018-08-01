# Managed Server
This suite of commands allows you to manipulate the managed database servers prototype connections.
See [Managed Data Server Administration](https://docops.ca.com/ca-live-api-creator/5-0/en/creating-apis/database-creation/managed-data-server-administration)
```
Usage: managedserver [options] <list|create|update|delete|import|export>

  Administer managed database server within a project.

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
## List
    lacadmin managedserver list

The `list` command shows all data source connections for the current project.

#### Output
    Managed Data Server(s)
    Ident  Name   Type   Active  Catalog  User   URL                         Comments
	-----  ----   -----  ------  -------  -----  --------------------------  --------
	2000   test           MySQL           user1  jdbc:derby:foo;create=true    

***
## Create
    $lacadmin datasource create --name <name> 
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

    MySQL	    jdbc:mysql://<server-name>[:port-number (default 3306)]/[datasource-name]	
    Postgres	jdbc:postgresql://<server-name>[:port-number (default 5432)]/<datasource-name>	
    Derby	    jdbc:derby://<server-dirname>[/<datasource-name>;create=true	
    SQLServer   jdbc:sqlserver://<server-name>[instance-name][:port-number]][;property=value[;property=value]]
    Oracle      jdbc:oracle:thin:@<server-name>:<port-number>:<sid> 
    

The `dbasetype` parameter must have one of the following values:

* `mysql`
* `postgres`
* `derby`
* `sqlserver`
* `oracle`

## Update

```
    $lacadmin managedserver update 
		[ --server_name <name> ]
		[--user_name <db-user-name>] 
		[--password <db-password>]
    	[--url <db-url>] 
    	[--catalog_name <catalog>] 
    	[--active <true|false>]
    	[--comments <comments>]
```

***
## Delete
    $lacadmin datasource delete [--server_name <name> | --ident <ident>]

The `delete` command deletes a managed data server from the current TeamSpace.
Either the name of the or ident, must be specified (use list to get ident).

## Export
Provide the ident of the managed data server and (optional) the export file name. If not provided - it will be sent to stdout.
```
    $lacadmin managedserver export  [--ident <ident> | --server_name <name> ] --file managedserver.json
```
This exports the specified managed data server(s) into a JSON file. If the filename parameter is not specified, stdout is used.

## Import
Import a managed data server to the current TeamSpace server (or one specified) using the name of the json file for the data source you wish to import.
```
    $lacadmin managedserver import --file managedserver.json
```
This imports the specified JSON file. If the filename parameter is not specified, stdin is used. (you can pipe the json file to the import)

