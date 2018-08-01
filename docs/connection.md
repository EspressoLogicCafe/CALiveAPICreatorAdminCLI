# Connection
Connections to message service providers like MQTT and Kafak.
See [Create Connections](https://docops.ca.com/ca-live-api-creator/5-0/en/creating-listeners/create-connections)
```
 $lacadmin connection --help
 Usage: connection [options] <list|delete|export|import|stop|start>
 
   Administer Connections for current project.
 
   Options:
 
     -h, --help                       output usage information
     --connection_name [name]         The connection name
     --ident [ident]                  The ident of the specific connection
     --project_ident [project_ident]  The project ident that will be used
     --verbose                        optional: Display list of connection in detailed export/import format
     --file [fileName]                optional: Name of file to import/export (if not provided stdin/stdout used for export)
```


***
## settings list
List of commands allows you to list your CA Live API Creator project specific connections. 

```
    $lacadmin connection list
```

The `list` command shows all defined connections for the current TeamSpace.

#### Output
```
Connections                                                                                                                                                                            
Ident  Name            Type  Active  Connect Code  Disconnect Code
-----  --------------  ----  ------  ------------  ---------------
2000   MQTTConnection  MQTT  false                                

# connection: 1     
                                                                               
```
### Provider List
```$xslt
$lacadmin provider list

Providers                                                                                                                                                                              
Ident  Name           Requires Connection  Active  Comments                                          
-----  -------------  -------------------  ------  --------------------------------------------------
4      KafkaConsumer  true                 true    Kafka Consumer listener                           
5      KafkaProducer  true                 true    Kafka Producer listener                           
3      MQTT           true                 true    MQTT listener                                     
2      Shutdown       false                true    Listener provider for server shutdown - each li...
1      Startup        false                true    Listener provider for server startup - each lis...

# listener_providers: 5                                                                
```

The `list` command is currently the only one available from the command line for
settings. 

## Export
Provide the ident of the conneciton and (optional) the export file name. If not provided - it will be sent to stdout.
```
    $lacadmin connection export  [--project_ident <ident>] [--ident <ident> --connection_name <name>] [--file MQTTConnections.json ]
    [
      {
        "name": "MQTTConnection",
        "description": null,
        "is_active": false,
        "connect_code": null,
        "disconnect_code": null,
        "provider_ident": 3,
        "ConnectionParameters": [
          {
            "value": "tcp://localhost:1883",
            "type_ident": 1,
            "description": null
          },
          {
            "value": "RANDOM",
            "type_ident": 3,
            "description": null
          },
          {
            "value": "true",
            "type_ident": 10,
            "description": null
          },
          {
            "value": "0",
            "type_ident": 13,
            "description": null
          }
        ]
      }
    ]

```
The export connection exports the specified conneciton optins into a JSON file. If the filename parameter is not specified, stdout is used.

## Import
Provide the name of the json file for the connection(s) you wish to import. Note - all connections will be imported in a stopped or inactive state.  Use start to re-activate.
```
    $lacadmin connection import [--project_ident <ident>] --file MQTTConnection.json
```
The import connection using the specified JSON file. If the filename parameter is not specified, stdin is used. (you can pipe the json file to the import)

## Stop
Stop and existing connection by setting the state flag to inactive.
```$xslt
    $lacadmin connectin stop [--ident <ident> | --connection_name <name>]

```
## Start
Start or restart a connection
```$xslt
    $lacadmin connectin start [--ident <ident> | --connection_name <name>]
```
