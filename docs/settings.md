# Settings

```
 Usage: settings [options] <list|create|delete|export|import>

  Administer project settings for an account.

  Options:

    -h, --help                       output usage information
   --ident [ident]                   The ident of the specific project settings object
    --option_value [value]           This is the value for the specific setting for the ident
    --project_ident [project_ident]  The project ident that will be marked as used
    --file [fileName]                Name of file to settings for import/export (if not provided stdin/stdout used for export)
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
settings. For details on how to create a [API Project Settings](http://ca-doc.espressologic.com/docs/logic-designer/create/api-properties).

## Settings update
Create needs a name, comment, the create function name and a list of parameters in JSON format 
```
liveapicreatoradmin settings update --ident 2001 --projet_ident 2000 --option_value http://liveapicreator.ca.com
```

## Library export
Provide the ident of the settings and (optional) the export file name. If not provided - it will be sent to stdout.
```
liveapicreatoradmin settings export  --project_ident 2000 --file settings.json
```
The export project settings exports the specified project settings optins into a JSON file. If the filename parameter is not specified, stdout is used.

## Library import
Provide the name of the json file for the settings you wish to import.
```
liveapicreatoradmin settings import --project_ident 2000 --file settings.json
```
The import settings imports the specified JSON file. If the filename parameter is not specified, stdin is used. (you can pipe the json file to the import)



