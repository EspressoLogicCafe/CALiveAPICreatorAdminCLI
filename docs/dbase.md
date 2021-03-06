# data source
This suite of commands allows you to manipulate the data source connection(s) in your projects. 
Visit the Documentation page on [Database Connectivity](https://docops.ca.com/ca-live-api-creator/5-0/en/creating-apis/database-connectivity)
                                                                                               
```
Usage: datasource [options] <list|create|update|delete|import|export>

  Administer datasources within a project.

  Options:

    -h, --help                                   output usage information
    --db_name [name]                             The name of the data source connection
    --ident [ident]                              For delete or reload, the ident of the data source
    --prefix [prefix]                            The prefix of the data source connection
    --dbasetype [dbasetype]                      The type of the data source connection, can be mysql, oracle, sqlserver, derby, postgresql, db2luw, db2zos, sqlserverazure
    --catalog_name [catalog_name]                The catalog in the data source
    --schema_name [schema_name]                  The schema in the data source
    --user_name [user_name]                      The name of the data source user
    --password [password]                        The password of the data source user
    --schema_editable [boolean]                  Is this data source marked as editable (i.e. managed data source) - default: false
    --url [url]                                  The JDBC URL for the data source
    --active [true|false]                        This marks the data source active or inactive
    --project_ident [ident]                      The ident of a project, (if other than the current project
    --managedserver_ident [managedserver_ident]  The managed server ident used with command createDatabase (creates both database and data source)
    --verbose                                    (optional) display list of datasources in detailed create format
    --file [file]                                optional: for import/export, the name of a file to read from/save to, if unspecified, use stdin/stdout
```
***
## datasource list
    lacadmin datasource list

The `list` command shows all data source connections for the current project.

#### Output
    DataSources
    Name                 Prefix  Type   Active  Catalog       Schema  User          Comments
    -------------------  ------  -----  ------  ------------  ------  ------------  --------
    Demo                 demo    MySQL  true    dblocal_demo  null    dblocal_demo
    
    # datasources: 1

***
## datasource create
    lacadmin datasource create --db_name <name> 
    	--user_name <db-user-name> 
    	--password <db-password>
    	--url <db-url> 
    	--dbasetype <type> can be: mysql, oracle, sqlserver, derby, postgresql, db2luw, db2zos, sqlserverazure
    	--prefix <prefix>
    	[--catalog_name <catalog>] 
    	[--schema_name <schema>] 
    	[--active <true|false>]
    	[--schema_editable <true|false>]
    	[--comments <comments>]

The `create` command creates a new connection to a data source.

The `url` parameter should be a valid JDBC URL, such as:

    MySQL	    jdbc:mysql://<server-name>[:port-number (default 3306)]/[datasource-name]	
    Oracle	    jdbc:oracle:thin:@<host>:<port>:<sid> 
                jdbc:oracle:thin:@//<host>:<port>/<service> 
                jdbc:oracle:thin:@<TNSName> - see Oracle for details
    Microsoft SQL Server	jdbc:sqlserver://<server-name>[instance-name][:port-number]][;property=value[;property=value]]
    Postgres	jdbc:postgresql://<server-name>[:port-number (default 5432)]/<datasource-name>	
    Derby	    jdbc:derby://<server-dirname>[/<datasource-name>;create=true	
    
The server-name is the address of your database server. It can be either an IP address like 12.34.56.78, or (more likely) a name that ends with .com, .net. or something like that. This server must of course be accessible from the Live API Creator server in the cloud. The port-number can typically be left unspecified, unless your data source server uses a non-standard port.


The `type` parameter must have one of the following values:

* `mysql`
* `sqlserver`
* `oracle`
* `sqlserverazure` (for Azure SQL)
* `postgres`
* `derby`
* `teradata`
* `db2luw`
* `db2zos`

If the `prefix` parameter is not specified, it will default to "main".

##Update

```
lacadmin datasource update [--prefix <name> | --db_name <name> ]
		[--user_name <db-user-name>] 
		[--password <db-password>]
    	[--url <db-url>] 
    	[--catalog_name <catalog>] 
    	[--schema_name <schema>] 
    	[--schema_editable <true|false>]
    	[--active <true|false>]
    	[--comments <comments>]
```

***
## Delete
    lacadmin datasource delete [--db_name <name> | --prefix <prefix>]

The `delete` command deletes a data source connection from the current project.
Either the name of the data source connection, or its prefix, must be specified.


## Export
Provide the name or prefix of the data source and (optional) the export file name. If not provided - it will be sent to stdout.
```
lacadmin datasource export  [--prefix <name> | --name <name> ] --file datasource.json
```
The export datasource exports the specified datasource into a JSON file. If the filename parameter is not specified, stdout is used.

## Import
Import a datasource to the current project (or one specified) using the name of the json file for the data source you wish to import.
```
lacadmin datasource import [--project_ident <ident>] --file datasource.json
```
The import datasource imports the specified JSON file. If the filename parameter is not specified, stdin is used. (you can pipe the json file to the import)

