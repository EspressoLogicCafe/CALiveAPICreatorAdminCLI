# Resource

This suite of commands allows you to manipulate the resources (custom endpoints) in your project. For more details visit the [documentation page](http://ca-doc.espressologic.com/docs/logic-designer/rest-resources).

## Usage
```sh
  Usage: resource [options] <list|delete|import|export>

  Options:

    -h, --help                    output usage information
    --resource_name [name]     The name of the resource
    --type [type]              The type of the resource: normal, sql, javascript, storedproc, mongo
    --prefix [prefix]          The prefix of the table
    --apiversion [apiversion]  The name of an API version, if there is more than one - default v1
    --project_ident [ident]    The ident of a project, (if other than the current project
    --file [file]              Optional: for import/export, the name of a file to read from/save to, if unspecified, use stdin/stdout

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
## Resource delete
    liveapicreatoradmin resource delete --resource_name <name>

The `delete` command deletes the specified resource.

## Resource export
Provide the ident of the resource and the export file name. If the project_ident is not provided it will use the current one.
```
liveapicreatoradmin resource export  [--project_ident <ident>] [--ident <ident>] [--resource_name <name>] --file resources.json
```
The export resource exports to the specified JSON file. If the filename parameter is not specified, stdout is used.


## Resource import
Provide the file name of the json file for the resource you wish to import.
```
use live API Creator admin GUI for resource import or lacadmin project import/export
```
The import resource imports the specified JSON file. If the filename parameter is not specified, stdin is used. (you can pipe the json file to the import)

