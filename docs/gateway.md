# Publish to CA Gateway
This suite of commands allows you to manage and publish project API Swagger documentation to the CA Gateway.
```
 Usage: gateway [options] <list|create|import|export|publish>

  Publish Swagger document for current project to Gateway. New in version 2.1.x - publish requires existing swagger file

  Options:

    -h, --help             output usage information
    --ident [ident]        The ident for the saved gateway definition
    --name [name]          The name for the gateway definition
    --username [name]      The username for the gateway
    --password [password]  The gateway password.
    --hostname [server]    The gateway server hostname or IP
    --urlname [urlname]    The name of the url fragment (see project list)
    --apiersion [version]  The api version (e.g v1)
    --file [filename]      [Optional] The name of the file for import/export
    --comments [comments]  The gateway definition comments

```
***
## List
    $lacadmin gateway list

The `list` command shows all gateway connection definitions.

#### Output
```
All Gateway Definitions                                                                                                                                                                     
Ident  Name          Username  URL                                             Active  Comments      
-----  ------------  --------  ----------------------------------------------  ------  --------------
1      Gateway Dev   pmadmin   https://myserver.ca.com:8443/lacman/1.0/publish  true    Dev Server          
3      Gateway Test  pmadmin   https://myserver.ca.com:8443/lacman/1.0/publish  true    Test Server

# gateway: 2         
```
***
## Create
```
    $lacadmin gateway create 
    --name [name]          The name for the gateway definition
    --username [name]      The username for the gateway login
    --hostname [server]    The gateway server full hostname (https://server/lacman/1.0/publish)
    --comments [comments]  The gateway definition comments
```

The `create` command creates a new gateway connection definition. See documentation for /@gateway_publish 


## Export
Provide the ident or the gateway definition name and (optional) the export file name. If not provided - it will be sent to stdout.
```
    $lacadmin gateway export  [--ident <name> | --name <name> ] [--file gateway.json]
```
The export datasource exports the specified datasource into a JSON file. If the filename parameter is not specified, stdout is used.

## Import
Import a gateway definition - if the name already exists -it will do a merge_insert.
```
    $lacadmin gateway import --file gateway.json
```
The import gateway imports the specified JSON file. If the filename parameter is not specified, stdin is used. (you can pipe the json file to the import)

## Publish
This command will publish to the gateway and use the file parameter to read the swagger file from disk.
```
    $lacadmin gateway publish --username <username> --password <password> --hostname <somesgatewayerver> --url_name <urlfragment> --apiversion <apiversion> 

```