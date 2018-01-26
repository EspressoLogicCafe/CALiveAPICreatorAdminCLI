# Virtual Primary Key
This suite of commands allows you to manage virtual primary keys on tables or view within an API project.
Visit the Documentation page on [Manage Virtual Primary Keys in Tables or Views](https://docops.ca.com/ca-live-api-creator/4-0/en/creating-apis/database-creation/manage-existing-schemas#ManageExistingSchemas-ManageVirtualPrimaryKeysinTables)
```
$lacadmin virtualkey --help

  Usage: virtualkey [options] <list|create|update|delete|import|export>

  Manage a virtualkey to a table or view.

  Options:

    -h, --help                       output usage information
    --table_ident [ident]            For delete or update, the ident of the listed table
    --view_ident [ident]             For delete or update, the ident of the listed view
    --project_ident [project_ident]  The project ident that will be used to list all datasources
    --prefix [prefix]                The data source prefix for this table or view virtual primary key
    --table_name [name]              The name of the table to attach a virtual primary key
    --view_name [name]               The name of the view to attach a virtual primary key
    --keyname [colnamelist]          The comma separated list of column names
    --is_autonum [true|false]        If the keyname of a view column that is an autonum - default false
    --file [fileName]                [Optional] Name of file to import/export (if not provided stdin/stdout used for export)
```
***
## list
    $lacadmin virtualkey list

The `list` command shows all virtual keys for both tables and views.

#### Output
```
Virtual Primary Key                                                                                                                                          
prefix   Active  view_ident  view_name              key name       autonums  table_ident  table_name           
-------  ------  ----------  ---------------------  -------------  --------  -----------  ---------------------
demo     true    2009        customers_owing        "name"                                                     
                 2010        employee_with_picture  "employee_id"                                              
                 2011        LineItemJoinProduct    "LineItemId"                                               
                 2014        v_LineItem             "LineItemId"                                               
                 2016        v_LineItem2            foo2                                                       
                                                                                                               
demo     true                                       "login"                  2014         employee             
                                                    "id"                     2015         STRESS_NO_PRIMARY_KEY
finance  true                                                                                                  
```
***
## Create (view)
The `create` command creates a new virtual primary key. Note - only views need to indicate if the column is defined as an autonum (boolean).
```
    $lacadmin virtualkey create --view_name v_LineItem --keyname LineItemId  --prefix demo --is_autonum true
```
## Create (table)
```
    $lacadmin virtualkey create --table_name v_LineItem --keyname LineItemId --prefix demo  
```

## Uupdate (view)

```
    $lacadmin virtualkey update --view_ident 2016 --view_name v_LineItem--keyname <name>  --is_autonum false 

```
## Update (table)

```
    $lacadmin virtualkey update --table_ident 2015 --table_name STRESS_NO_PRIMARY_KEY --keyname <name>  

```
***
## Delete
```
    $lacadmin virtualkey delete [--view_ident <ident> | --table_ident <ident>]
```
The `delete` command deletes a specific virtual primary key for a view or table using the ident (use lacadmin virtualkey list)


## Export
Provide the optional prefix of the AllEntitiesInfo and (optional) the export file name. If not provided - it will be sent to stdout.
```
    $lacadmin virtualkey export  [--prefix <name> ] --file datasource.json
```
The export virtual primary key exports the specified definitions into a JSON file. If the filename parameter is not specified, stdout is used.

## Import
Import a virtual key definition to the current project (or one specified) using the name of the json file.
```
    $lacadmin virtuakey import [--project_ident <ident>] --file datasource.json
```
The import command will import virtual primary key from the specified JSON file. If the filename parameter is not specified, stdin is used. (you can pipe the json file to the import)

