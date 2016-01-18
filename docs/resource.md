# Resource

This suite of commands allows you to manipulate the resources (custom endpoints) in your project. For more details visit the [documentation page](http://ca-doc.espressologic.com/docs/logic-designer/rest-resources).

## Usage
```sh
  Usage: resource [options] <list>

  Options:

    -h, --help                    output usage information
    --resource_name [name]        The name of the resource
    --type [type]                 The type of the resource: normal, sql, javascript, storedproc, mongo
    --prefix [prefix]             The prefix of the table
    --table_name [name]           The name of the table
    --description [description]   A Comment for the resource
    --is_collection [true|false]  Whether the resource is for a single value or more than one [true|false]
    --join_condition [join]       How to join this resource to its parent resource
    --container_ident [ident]     The ident of the parent resource, if any
    --attributes [attributes]     The columns to add to the resource, in the form {colname: alias, colname:alias}, all if not specified
    --apiversion [apiversion]     The name of an API version, if there is more than one
    --project_ident [ident]       The ident of a resource, (if other than the current project)
    --file [file]                 Optional: for import/export, the name of a file to read from/save to, if unspecified, use stdin/stdout

```

***
## Resource list
    liveapicreatoradmin resource list

The `list` command shows all resources for the current project.

#### Output
	Top-level resources
	Name                             Prefix  Table          Type        Comments
	-------------------------------  ------  -------------  ----------  --------------------------------------------------
	AllCustomers                     demo    customer       normal      Query for all customers
	CustomerBusinessObject           demo    customer       normal      all customer attributes and related child data
	Customers                        demo    customer       normal      API example - illustrates attribute aliasing / ...
	Products                         demo    product        normal      Query for all products
	PurchaseOrders                   demo    PurchaseOrder  normal      Query for all orders with line items
	
	# resources: 5

***
## Resource create
    liveapicreatoradmin resource create --resource_name <name> --table_name <table-name>
    	[--prefix <table-prefix>] 
    	[--type <type>] 
    	[--is_collection <true|false>]
    	[--description <text>] 
    	[--container_ident <ident>] 
    	[--apiversion <apiversion>]

The `create` command creates a new resource in the current project.

The `prefix` parameter is optional if you only have one database in your current project.

The `type` parameter is `normal` if unspecified, otherwise it must be one of:

* `normal`
* `sql`
* `javascript`
* `storedproc`
* `mongo`

Your server has many kinds of resources (also called "End Points"):
Base Table Resources - these are automatically created for each Base Table for the active Database

	Custom Resources - created in the Live API Creator to provide  include related data (joined tables), project / alias attributes, define filters etc.

	View Resources - automatically created for each View Table

	Stored Procedure Resources - automatically created for each Stored Procedure

	Logic Administration Resources - automatically created meta data services to obtain the list of tables and resources, their attributes, etc.

If creating a subresource, the `container_ident` parameter must be the `ident` of another resource.

If there is more than one API version in the current project, you must specify one with the `apiversion`
parameter.

***
## Resource delete
    liveapicreatoradmin resource delete --resource_name <name>

The `delete` command deletes the specified resource.

## Resource export
Provide the ident of the resource and the export file name. If the project_ident is not provided it will use the current one.
```
liveapicreatoradmin resource export  [--project_ident <ident>] [--ident <ident>] --file resources.json
```
The export resource exports to the specified JSON file. If the filename parameter is not specified, stdout is used.


## Resource import
Provide the file name of the json file for the resource you wish to import.
```
liveapicreatoradmin resource import --file resources.json
```
The import resource imports the specified JSON file. If the filename parameter is not specified, stdin is used. (you can pipe the json file to the import)

