# Listener
Listener to message service providers like MQTT and Kafak.
See [Create Listeners](https://docops.ca.com/ca-live-api-creator/4-0/en/creating-listeners)
```
 $lacadmin listener --help
 Usage: listener [options] <list|delete|export|import>

  Administer Listener Events for current project.

  Options:

    -h, --help                       output usage information
    --listener_name [name]           The Listener Name
    --ident [ident]                  The ident of the specific listener
    --project_ident [project_ident]  The project ident that will be used
    --verbose                        optional: Display list of listeners in detailed export/import format
    --file [fileName]                optional: Name of file to import/export (if not provided stdin/stdout used for export)

```


***
## settings list
List of commands allows you to list your CA Live API Creator project specific listeners. 

```
    $lacadmin listener list
```

The `list` command shows all defined listeners for the current account.

#### Output
```
Listeners                                                                                                                                                                              
Ident  Name       Type  Logging Level  Active  Code                                                Description
-----  ---------  ----  -------------  ------  --------------------------------------------------  -----------
2000   MyListner  MQTT  2              false   // Listener code goes here or check out example...             

# listeners: 1                      
                                                                               
```

The `list` command is currently the only one available from the command line for
settings. 

## Export
Provide the ident of the conneciton and (optional) the export file name. If not provided - it will be sent to stdout.
```
    $lacadmin listener export  [--project_ident <ident>] [--ident <ident> --listener_name <name>] [--file MQTTListener.json ]
    [
      {
        "name": "MyListner",
        "description": null,
        "is_active": false,
        "code": "// Listener code goes here or check out examples ( see top right dropdown menu ) \n",
        "logging_level": 2,
        "provider_ident": 3,
        "connection": null,
        "ListenerParameters": [
          {
            "value": "test",
            "type_ident": 1,
            "description": null
          }
        ],
        "@metadata": {
          "action": "MERGE_INSERT",
          "key": [
            "project_ident",
            "name"
          ]
        }
      }
    ]

```
The export listener exports the specified conneciton optins into a JSON file. If the filename parameter is not specified, stdout is used.

## Import
Provide the name of the json file for the connection(s) you wish to import. 
Note - listeners will be restarted when the connection (if applicable) is restarted.
```
    $lacadmin listener import [--project_ident <ident>] --file MQTTListener.json
```
The import connection using the specified JSON file. If the filename parameter is not specified, stdin is used. (you can pipe the json file to the import)

