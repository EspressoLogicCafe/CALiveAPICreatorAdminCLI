# Settings

```
 Usage: settings [options] <list|create|delete|export|import>

  Administer project settings for an account.

  Options:

    -h, --help                    output usage information
    --ident [ident]          The ident of the library
    --project_ident [ident]  The project ident of the library that will be marked as used in the project.
    --name [name]            Name of settings
    --file [fileName]        [optiona] Name of file to import/export settings (if not provided stdin/stdout used for export)
```


***
## settings list
List of commands allows you to list your CA Live API Creator project specific settings. 

```
    liveapicreatoradmin libraries list
```

The `list` command shows all libraries for the current account.

#### Output
```
                                                                                                                     
```

The `list` command is currently the only one available from the command line for
settings. For details on how to create a [custom authentication provider](http://ca-doc.espressologic.com/docs/logic-designer/security/authentication/custom-authentication-provider).

## Settings update
Create needs a name, comment, the create function name and a list of parameters in JSON format 
```
liveapicreatoradmin settings update
```

## Library export
Provide the ident of the settings and (optional) the export file name. If not provided - it will be sent to stdout.
```
liveapicreatoradmin settings export  --ident 2008 --file mylibrary.json
```
The export libraries exports the specified library into a JSON file. If the filename parameter is not specified, stdout is used.

## Library import
Provide the name of the json file for the settings you wish to import.
```
liveapicreatoradmin settings import [--project_ident 1005] --file mylibrary.json
```
The import library imports the specified JSON file. If the filename parameter is not specified, stdin is used. (you can pipe the json file to the import)



