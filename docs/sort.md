# Structured Sorts
This feature is for user defined sort definition. For details see [Structured Sorts](https://docops.ca.com/ca-live-api-creator/5-0/en/invoking-apis/get/structured-sorts).

```
  Usage: namedsort [options] <list|create|update|delete|export|import>

  Administer Named Sorts for the active API Project.

  Options:

    -h, --help                       output usage information
    --ident [ident]                  The ident of the specific named sort object
    --sort_name [name]               Name of named sort
    --sort_text [sorttext]           Sort Text to define named sort
    --resource_names [name]          [Optional] Comma seperated list of Resource Names in quotes
    --comments [comment]             [Optional] Comment on named sort
    --project_ident [project_ident]  [Optional] The project ident defaults to the active project
    --file [fileName]                [Optional] Name of file for import/export (if not provided stdin/stdout used for export)
    --verbose                        [Optional] whether to display list of named sorts in detailed format
```


***
## Named sort list
List of commands allows you to list your CA Live API Creator named sorts. 

```
    $lacadmin namedsort list
```

The `list` command shows all named sorts for the current TeamSpace.

#### Output
```
ANamed Sort                                                                                                                                     
Ident  Name         Resource       Sort Text  Comments                  
-----  -----------  -------------  ---------  --------------------------
2000   myNamedSort  demo:customer  paid desc  this is a pre-defined sort

# named sorts: 1                                                                                                                                                
```

The `list` command is available from the command line for named sorts. 
## Create
Create needs a name, comment, the create function name and a list of parameters in JSON format 
```
    $lacadmin namedsort create --sort_name myNamedSort [--project_ident <ident>] --comments 'my named sort' --resource_names <resourceNames> --sort_text <sort_text>
```
## Update
Create needs a name, comment, the create function name and a list of parameters in JSON format 
```
    $lacadmin namedsort update --sort_name myNamedSort [--project_ident <ident>] --comments 'my named sort' --resource_names <resourceNames> --sort_text <sort_text>
```
## Delete
Simply provide the ident of the named sort you wish to delete.
```
    $lacadmin namedsort delete [--ident 2007 | --sort_name <sortname>]
```

## Export
Provide the ident of the named sort and (optional) the export file name. If [--file] is not provided output will be sent to stdout.
```
    $lacadmin namedsort export  [--ident <ident> | --sort_name <name>] [--file | > ]u namedSort.json
```
The export namedsort exports the specified named sort into a JSON file. If the filename parameter is not specified, stdout is used.

## Named Sort import
Provide the name of the json file for the named sort(s) you wish to import. If a project_ident is not provided - the current project is used.
```
    $lacadmin namedsort import [--project_ident <ident> ] [--file | < ] namedSort.json
```
The import library imports the specified JSON file. If the filename parameter is not specified, stdin is used. (you can pipe the json file to the import)



