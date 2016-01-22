# Settings

```
 Usage: apioptions [options] <list|update|delete|export|import>

  Administer API project options for an account.

  Options:

    -h, --help                       output usage information
    --ident [ident]                  The ident of the specific project option object
    --option_value [value]           This is the value for the specific option for the ident
    --project_ident [project_ident]  The project ident that will be marked as used
    --file [fileName]                Name of file to api options for import/export (if not provided stdin/stdout used for export)
```


***
## settings list
List of commands allows you to list your CA Live API Creator project specific settings. 

```
    liveapicreatoradmin apioptions list
```

The `list` command shows all api options for the current account.

#### Output
```
API Option Settings                                                                                                                                
Ident  Project  Name                                            Value                                                            
-----  -------  ----------------------------------------------  -----------------------------------------------------------------
2000   2000     Aggregate Default Override                      false                                                            
2015   2000     Allow Swagger without authentication            false                                                            
2018   2000     Audit User Transactions                         false                                                            
2004   2000     Checksum Size Limit                             2002                                                             
2008   2000     Chunk Size Default                              20                                                               
2014   2000     Default response format                         json                                                             
2016   2000     Disallow free-form filters and sorts            false                                                            
2002   2000     HTTPS only                                      false                                                            
2005   2000     Inline Limit Default                            6001                                                             
2007   2000     Maximum Page Size                               5000                                                             
2017   2000     Maximum size of connection pool (per database)  20                                                               
2003   2000     Metadata name                                   @metadata                                                        
2006   2000     Page Size Default                               20                                                               
2011   2000     Permit Authorization parameter in URL           true                                                             
2010   2000     Stored Procedure Inline Limit                   2000                                                             
2009   2000     Stored Procedure Row Limit                      100                                                              
2012   2000     Tech docs URL                                   http://ca-doc.espressologic.com/docs/tutorial/business-logic-demo
2001   2000     Type base URI                                   urn:caliveapicreator:demo:                                       
2013   2000     User docs URL                                   null                                                             

# settings: 19                                                                                                                           
```

The `list` command is currently the only one available from the command line for
settings. For details on how to create a [API Project Settings](http://ca-doc.espressologic.com/docs/logic-designer/create/api-properties).

## Settings update
Create needs a name, comment, the create function name and a list of parameters in JSON format 
```
liveapicreatoradmin apioptions update --ident <ident> [--project_ident <ident>] --option_value <somevalue>
```

## Library export
Provide the ident of the apioptions and (optional) the export file name. If not provided - it will be sent to stdout.
```
liveapicreatoradmin apioptions export  [--project_ident <ident>] [--ident <ident>] --file apioptions.json
```
The export project apioptions exports the specified project settings optins into a JSON file. If the filename parameter is not specified, stdout is used.

## Library import
Provide the name of the json file for the api options you wish to import.
```
liveapicreatoradmin apioptions import [--project_ident <ident>] --file apioptions.json
```
The import apioptions imports the specified JSON file. If the filename parameter is not specified, stdin is used. (you can pipe the json file to the import)



