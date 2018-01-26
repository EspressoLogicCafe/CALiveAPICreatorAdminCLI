# Structured Filter
For details on named filters see [Structured Filters](https://docops.ca.com/ca-live-api-creator/4-0/en/invoking-apis/get/structured-filters)

```
  Usage: namedfilter [options] <list|create|delete|update|import|export>

  Administer Named filter for the active API Project.

  Options:

    -h, --help                       output usage information
    --ident [ident]                  The ident of the specific named filter object
    --filter_name [name]                    Name of named filter
    --filter_text [text]             Text to define named filter
    --resource_names [name]          [Optional] Comma seperated list of Resource Names in quotes
    --comments [comment]             [Optional] omment on named filter
    --project_ident [project_ident]  [Optional] The project ident if not the active project
    --file [fileName]                [Optional] Name of file for import/export (if not provided stdin/stdout used for export)
    --verbose                        [Optional] whether to display list of named filter in detailed format
```


***
## List
List of commands allows you to list your CA Live API Creator named filters. 

```
    $lacadmin namedfilter list
```

The `list` command shows all named filters for the current TeamSpace.

#### Output
```
Named Filter                                                                                                                                   
Ident  Name           Resource       Filter Text          Comments          
-----  -------------  -------------  -------------------  ------------------
2000   MyNamedFilter  demo:customer  balance < {balance}  Filter Description

# named filter(s): 1                                                                                                                                                  
```

The `list` command is available from the command line for named filters. For details on how to create a [Structured Sorts](http://ca-doc.espressologic.com/docs/logic-designer/create/structured-filters).

## Create
Create needs a name, comment, the create function name and a list of parameters in JSON format 
```
   $lacadmin namedfilter create --filter_name myNamedFilter[--project_ident <ident>] --comments 'my named filter' --resource_names <resourceNames> --filter_text <filter_text>
```
## Update
Create needs a name, comment, the create function name and a list of parameters in JSON format 
```
   $lacadmin namedfilter update --filter_name myNamedFilter [--project_ident <ident>] --comments 'my named filter' --resource_names <resourceNames> --filter_text <filter_text>
```
##Delete
Simply provide the ident of the named filter you wish to delete.
```
   $lacadmin namedfilter delete [--ident 2007  --filter_name MyFilterName]
```

## Export
Provide the ident of the named filter and (optional) the export file name. If [--file] is not provided output will be sent to stdout.
```
   $lacadmin namedfilter export  [--ident <ident>  --filter_name <name>] --file namedSort.json
```
The export namedfilter exports the specified named filter into a JSON file. If the filename parameter is not specified, stdout is used.

## Import
Provide the name of the json file for the named filter(s) you wish to import. If a project_ident is not provided - the current project is used.
```
   $lacadmin namedfilter import [--project_ident <ident> ] --link_project true --file namedSort.json
```
The import library imports the specified JSON file. If the filename parameter is not specified, stdin is used. (you can pipe the json file to the import)



