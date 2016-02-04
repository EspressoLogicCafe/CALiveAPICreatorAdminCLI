# Authentication Token

```
  Usage: token [options] <list| delete|export|import>

  Administer Named Sorts for the active API Project.

  Options:

    -h, --help                       output usage information
    --ident [ident]                  The ident of the specific authentication token object
    --project_ident [project_ident]  [Optional] The project ident defaults to the active project
    --file [fileName]                [Optional] Name of file for import/export (if not provided stdin/stdout used for export)
    --verbose                        [Optional] whether to display list of named sorts in detailed format
```


***
## Token List
List of commands allows you to list your CA Live API Creator authentication tokens. 

```
    liveapicreatoradmin token list
```

The `list` command shows all named sorts for the current account.

#### Output
```
t                                                                                                                                     
Ident  Name         Resource       Sort Text  Comments                  
-----  -----------  -------------  ---------  --------------------------
2000   myNamedSort  demo:customer  paid desc  this is a pre-defined sort

# named sorts: 1                                                                                                                                                
```

The `list` command is available from the command line for named sorts. For details on how to create a [Structured Sorts](http://ca-doc.espressologic.com/docs/logic-designer/create/structured-sorts).


##Token Delete
Simply provide the ident of the named sort you wish to delete.
```
liveapicreatoradmin token delete --ident <ident>
```

## Token Export
Provide the ident of the named sort and (optional) the export file name. If [--file] is not provided output will be sent to stdout.
```
liveapicreatoradmin token export  [--ident <ident>  --name <name>] [--file  | > ] namedSort.json
```
The export token exports the specified named sort into a JSON file. If the filename parameter is not specified, stdout is used.

## Token Import
Provide the name of the json file for the named sort(s) you wish to import. If a project_ident is not provided - the current project is used.
```
liveapicreatoradmin token import [--project_ident <ident> ] [--file | < ] namedSort.json
```
The import library imports the specified JSON file. If the filename parameter is not specified, stdin is used. (you can pipe the json file to the import)



