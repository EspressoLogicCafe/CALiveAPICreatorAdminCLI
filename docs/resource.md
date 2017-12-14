# Resource

This suite of commands allows you to manipulate the resources (user defined endpoints) in your project. 
For more details visit the [Customize your API](https://docops.ca.com/ca-live-api-creator/4-0/en/creating-apis/customize-your-api) page.

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
## List
    $lacadmin resource list

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
## Delete
    $lacadmin resource delete --resource_name <name>

The `delete` command deletes the specified resource.

## Export
Provide the ident of the resource and the export file name. If the project_ident is not provided it will use the current one.
```
    $lacadmin resource export  [--project_ident <ident>] [--ident <ident>] [--resource_name <name>] --file resources.json
```
The export resource exports to the specified JSON file. If the filename parameter is not specified, stdout is used.


## Import
Provide the file name of the json file for the resource you wish to import.
```
    $lacadmin resource import  [--project_ident <ident>] --file resources.json

The import functions imports the specified JSON resource file. If the filename (--file) parameter is not specified, stdin is used. (you can pipe the json file to the import)

