# datasource

This suite of commands allows you to manipulate the datasource connection(s) in your projects.

***
## datasource list
    liveapicreatoradmin datasource list

The `list` command shows all datasource connections for the current project.

#### Output
    DataSources
    Name                 Prefix  Type   Active  Catalog       Schema  User          Comments
    -------------------  ------  -----  ------  ------------  ------  ------------  --------
    Demo                 demo    MySQL  true    dblocal_demo  null    dblocal_demo
    
    # datasources: 1

***
## datasource create
    liveapicreatoradmin datasource create --name <name> --user_name <db-user-name> --password <db-password>
    	--url <db-url> --dbasetype <type>
    	[--prefix <prefix>] [--catalog_name <catalog>] [--schema_name <schema>] [--port_num <port>]
    	[--comments <comments>]

The `create` command creates a new connection to a datasource.

The `url` parameter should be a valid JDBC URL, such as:

    MySQL	    jdbc:mysql://<server-name>[:port-number (default 3306)]/[datasource-name]	
    Oracle	    jdbc:oracle:thin:@<host>:<port>:<sid> 
                jdbc:oracle:thin:@//<host>:<port>/<service> 
                jdbc:oracle:thin:@<TNSName> - see Oracle for details
    Microsoft SQL Server	jdbc:sqlserver://<server-name>[instance-name][:port-number]][;property=value[;property=value]]
    Postgres	jdbc:postgresql://<server-name>[:port-number (default 5432)]/<datasource-name>	
    Derby	    jdbc:derby://<server-dirname>[/<datasource-name>;create=true	
    
The server-name is the address of your database server. It can be either an IP address like 12.34.56.78, or (more likely) a name that ends with .com, .net. or something like that. This server must of course be accessible from the Live API Creator server in the cloud. The port-number can typically be left unspecified, unless your datasource server uses a non-standard port.


The `type` parameter must have one of the following values:

* `mysql`
* `sqlserver`
* `oracle`
* `sqlserverazure` (for Azure SQL)
* `nuodb`
* `postgres`
* `derby`

If the `prefix` parameter is not specified, it will default to "main".

***
## datasource delete
    liveapicreatoradmin datasource delete [--db_name <name> | --prefix <prefix>]

The `delete` command deletes a datasource connection from the current project.
Either the name of the datasource connection, or its prefix, must be specified.

Visit the Documentation page on [datasources](http://ca-doc.espressologic.com/docs/logic-designer/datasource)
