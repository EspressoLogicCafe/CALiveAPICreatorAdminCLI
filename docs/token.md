# Authentication Token
For details see [Auth Tokens](https://docops.ca.com/ca-live-api-creator/4-0/en/managing-apis/programmatic-api-creation/api-creation-endpoints/auth-tokens)

```
  Usage: token [options] <list|export|import>

  Administer Authentication Tokens for the active API Project.

  Options:

    -h, --help                       output usage information
    --ident [ident]                  The ident of the specific authentication token object
    --project_ident [project_ident]  [Optional] The project ident defaults to the active project
    --file [fileName]                [Optional] Name of file for import/export (if not provided stdin/stdout used for export)
    --verbose                        [Optional] whether to display list of named sorts in detailed format
```


***
## List
List of commands allows you to list your CA Live API Creator authentication tokens. 

```
    $lacadmin token list
```

The `list` command shows all auth token for the current TeamSpace. Use 'lacadmin roles list' to see a detailed list of roles.

#### Output
```
Auth Tokens                                                                                                                                     
Ident  Name         Resource       Sort Text  Comments                  
-----  -----------  -------------  ---------  --------------------------
2000   myNamedSort  demo:customer  paid desc  this is a pre-defined sort

# auth token(s): 1                                                                                                                                                
```

The `list` command is available from the command line for auth tokens. 
## Export
Provide the ident of the auth tokens and (optional) the export file name. If [--file] is not provided output will be sent to stdout.
```
$lacadmin token export  [--ident <ident>  --name <name>] [--file  | > ] namedSort.json
```
The export token exports the specified auth tokens into a JSON file. If the filename parameter is not specified, stdout is used.

## Import
Provide the name of the json file for the auth tokens you wish to import. If a project_ident is not provided - the current project is used.
```
$lacadmin token import [--project_ident <ident> ] [--file | < ] namedSort.json
```
The import library imports the specified JSON file. If the filename parameter is not specified, stdin is used. (you can pipe the json file to the import)



