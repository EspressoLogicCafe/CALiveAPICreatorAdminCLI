# Publish to CA Gateway
This suite of commands allows you to manage and publish project API Swagger documentation to the CA Gateway.
```
 Usage: gateway [options] <list|create|import|export|publish|publishReadSwagger>

  Publish Swagger document for current project to Gateway. New in version 2.1.x - publish requires existing swagger file

  Options:

    -h, --help             output usage information
    --ident [ident]        The ident for the saved gateway definition
    --name [name]          The name for the gateway definition
    --username [name]      The username for the gateway
    --password [password]  The gateway password.
    --hostname [server]    The gateway server hostname or IP
    --port [port]          [Optional] The port number - default 8443
    --version [version]    [Optional] The version - default 1.0
    --useAuthToken         [Optional] API Properties - set swagger to use non auth has not been set
    --file [fileName]      [Optional] Name of file to settings for Swagger doc export
    --comments [comments]  The gateway definition comments

```
***
## gateway list
    liveapicreatoradmin gateway list

The `list` command shows all gateway connection definitions.

#### Output
All Gateway Definitions                                                                                                                                                                     
Ident  Name          Username  URL                                             Active  Comments      
-----  ------------  --------  ----------------------------------------------  ------  --------------
1      Gateway ssg3  pmadmin   https://lacssg3.ca.com:8443/lacman/1.0/publish  true    test          
3      SSG4          pmadmin   https://lacssg3.ca.com:8443/lacman/1.0/publish  true    This is a test

# gateway: 2         

***
## gateway create
    liveapicreatoradmin gateway create --name <name> 
    --name [name]          The name for the gateway definition
    --username [name]      The username for the gateway login
    --hostname [server]    The gateway server full hostname (https://server/lacman/1.0/publish
    --comments [comments]  The gateway definition comments


The `create` command creates a new gateway connection definition.


## gateway export
Provide the ident or the gateway definition name and (optional) the export file name. If not provided - it will be sent to stdout.
```
liveapicreatoradmin gateway export  [--ident <name> | --name <name> ] [--file gateway.json]
```
The export datasource exports the specified datasource into a JSON file. If the filename parameter is not specified, stdout is used.

## gateway import
Import a gateway definition - if the name already exists -it will do a merge_insert.
```
liveapicreatoradmin gateway import --file gateway.json
```
The import gateway imports the specified JSON file. If the filename parameter is not specified, stdin is used. (you can pipe the json file to the import)

## gateway publishReadSwagger
This command will use the current selected project and read the swagger and publish to the gateway - if the file parameter is used - the swagger file is saved to disk.
```
lliveapicreatoradmin gateway publishReadSwagger --username <username> --password <password> --hostname lacssg3.ca.com --file samples/banking.json 

```

## gateway publish
This command will publish to the gateway and use the file parameter to read the swagger file from disk.
```
lliveapicreatoradmin gateway publish --username <username> --password <password> --hostname lacssg3.ca.com --file samples/banking.json 

```