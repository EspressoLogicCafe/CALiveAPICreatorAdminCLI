# API 

This suite of commands allows you to manipulate your CA Live API Creator (LAC) APIs. See [Creating APIs](https://docops.ca.com/ca-live-api-creator/4-1/en/creating-apis).
## API
```
$lacadmin api -h

Usage: API [options] <list|create|update|delete|use|import|export|extract>

  Administer APIs. Actions are: list, create, update, delete, use, export

   -h, --help                                                                      output usage information
      --ident [ident]                                                                 The ident of the specific API (see: lacadmin api list).
      --api_name [name]                                                               The name of the API.
      --url_name [name]                                                               The url fragment name of the API.
      --status [status]                                                               optional: create or update the status of the API, can be A (for Active) or I for (Inactive).
      --authprovider [ident]                                                          optional: create or update the ident of the authentication provider for the API.
      --comments [comments]                                                           optional: create or update a description of the API.
      --section [name]                                                                optional: Export Only -The named section of the API you wish to export (e.g. resources, functions, datasources).
      --section_filter [filter]                                                       optional: Export Only -The section filter of the API you wish to export (name=foo&version=v1).
      -d, --directory [directory]                                                     Required for extract, the name of a directory to extract ZIP files.
      -f, --file [file]                                                               optional: for import/export/extract, the name of a file to read from/save to, if unspecified, use stdin/stdout.
      --format [json|zip]                                                             optional: for import/export, this sets the output type of the export default: zip.
      --namecollision [fail|rename_new|replace_existing|disable_and_rename_existing]  optional: for import, determines how to handle existing API projects(default rename_new).
      --errorhandling [standard|fail_on_warning|best_efforts]                         optional: for import, sets the error level response handling (default: standard.
      --passwordstyle [skip|encrypted|plaintext]                                      optional: for export, sets the password style of exported API datasources (default: skip).
      --librarystyle [emit_all|in_use_only]                                           optional: for export, sets the library style  (default: emit_all).
      --apioptionsstyle [emit_all|skip_default]                                       optional: for export, sets the api options (default: emit_all).
      --synchronize [replace|merge]                                                   optional: Export only- Used only by extract to synchronize zip file with directory folder (default: merge) replace will remove root directory contents and replace with zip contents.
      -v, --verbose                                                                   optional: whether to display detailed results, or just a summary.
```
***
## List
The `list`command shows all APIs in the connected server TeamSpace.

```
    $lacadmin api list
```


#### Output
    All APIs
    Ident  Name                  Enabled  URL      Comments
    -----  --------------------- ------  -------  --------
    1000   Logic Demo             true   demo
    1002   Logic Sample           true   sample
    1003   My Project             true   myproj
    1005   My Project2            true   myproj2
    
    # APIs: 4

***
### adding the --verbose flag to project list 
Includes sample scripts which can be used by devops developers.
```
#lacadmin api export --url_name admin  --file API_admin.json --format json
#lacadmin api export --url_name admin  --file API_admin.zip --format zip
#lacadmin api extract --file API_admin.zip --directory /temp/ --synchronize true
#lacadmin api import --file API_admin.json
#lacadmin api import --file API_admin.zip
```
## Create
The create command creates a new API with the given values. Status is active by default, it can be specified
as A(ctive) or I(nactive).  The url_name (aka url fragement) is required.

```
    $lacadmin api create --api_name <name> --url_name <url_name> [--status <A|I>] [--authprovider <ident>]
        [--comments <comments>] [--verbose]
```

If the `--verbose` option is specified, the output will include all created objects instead of a summary.

### Output

	API was created, including:
	I admin:projects/1007 ident:1007 ts:2014-11-26T14:21:... name:My Project3 url_name:myproj3 comments:[null] status:A is_active:true account_ident:1000 authprovider_ident:[null]
	and 20 other objects
	Request took: 470ms - # objects touched: 21
	Current project is now: My Project3 (1007)

Note that creating APIs also creates a number of other default objects.
Once the API is created, it becomes the current API (lacadmin api use --url_name <urlfragname>).

***
## Update
The update command updates one or more attribute of the specified API.
The API can be specified either by its name or by its URL name.


    $lacadmin api update [--api_name <name> | --url_name <url_name>] 
        [--status <A-I>] [--authprovider <ident>] [--comments <comments>]
***
## Delete
The delete command deletes the specified API and everything it contains.
The API can be specified either by its name or by its URL name.

If the `--verbose` option is specified, the output will include all deleted objects instead of a summary.
```
    $lacadmin api delete [--api_name <name> | --url_name <url_name>] [--verbose]

```
## Use
The use command will associate all future calls with the selected API which can be selected by name or url_name.

    $lacadmin api use [--api_name '<name>' | --url_name <url_name>]

The use command makes the specified API the current project.
The API can be specified either by its name or by its URL name.

***

## Export
The export command exports the specified API into a JSON or ZIP file (use format flag).  
The format flag will default to ZIP if not supplied.
If the `filename` parameter is not specified, stdout is used.

The API can be specified either by its name or by its URL name. The JSON output is in an
enhanced format which prefaces files with {f} and directories with {d}.  This new
format and organization is easier to read and manage individual team development components.

If the `--verbose` option is specified, the output will include all created objects instead of a summary.
```

    $lacadmin api export  
         [ --api_name <name> | --url_name <url_name>] 
         [ --file <filename> ]
         [ --format [zip|json] ] default zip
         [ --passwordstytle [skip|encrypted|plaintext] ] default - skip
         [ --librarystyle [emit_all|in_use_only]  ] default - emit_all
         [ --apioptionsstyle [emit_all|skip_default] ] default - emit_all
         [ --verbose] 
 
note: passwordstyle applies only to data sources that have passwords.
```

## Import
Import an existing API to the connected TeamSpace.  The file type may be either a zip or json file.
The import command imports a API from the specified JSON export file.
If the `filename` parameter is not specified, stdin is used. This allows you to pipe in content from another command.

If the `--verbose` option is specified, the output will include all created objects instead of a summary.
Note: The json format can either be the new 4.1 style or the original API export type.
```
    $lacadmin api import --file <filename[.json|.zip]> 
        [ --namecollision [fail|rename_new|replace_existing|disable_and_rename_existing] ] default rename_existing
        [ --errorhandling standard ] 
        [ --verbose]
        
note: namecollision rename_existing is the default and will only rename if the url already exists.
```

## Extract
This will take the content of a downloaded ZIP file and compare it with the selected directory.  
If the directory does not exist, the zip file will be exploded into this directory.  
If the directory exist and the synchronize flag is set to true (default is false) 
the system will remove All files and directories first using the root directory  and replace with the ZIP file contents.

```
    $lacadmin api extract 
        --file <filename.zip> 
        --directory </tmp/path/>  
        --synchronize [true|false] default false

```
## Section 
The export of an api can be reduced to a single section within a section using the section argument.
Note: The output of the file can be either in JSON or ZIP and will use the new enhanced format.  This
means that these values cannot be used with other lacadmin import commands.

NOTE: The formats use the new enhanced team development style and cannot be mixed with other lacadmin commands.
```
EXPORT PROJECT=demo
mkdir temp
$lacadmin api export --section api --file temp/api.json --format json
$lacadmin api export --section api --file temp/API.zip --format zip
$lacadmin api export --section connections --file temp/connections.json
$lacadmin api export --section custom_endpoints --file temp/custom_endpoints.json
$lacadmin api export --section listeners --file temp/listeners.json
$lacadmin api export --section relationships --file temp/relationships.json
$lacadmin api export --section relationships --file temp/relationships.json
$lacadmin api export --section data_sources --file temp/datasources.json
$lacadmin api export --section filters --file temp/filters.json
$lacadmin api export --section functions --file temp/functions.json
$lacadmin api export --section libraries --file temp/libraries.json
$lacadmin api export --section request_events --file temp/request_events.json
$lacadmin api export --section sorts --file temp/sorts.json
$lacadmin api export --section timers --file temp/timers.json
$lacadmin api export --section topics --file temp/topics.json
$lacadmin api export --section security  --file temp/security.json
$lacadmin api export --section security.authtokens  --file temp/authtokens.json
$lacadmin api export --section security.roles --file temp/roles.json
$lacadmin api export --section security.users --file temp/users.json
$lacadmin api export --section resources --file temp/resources.json
$lacadmin api export --section rules --file temp/rules.json
$lacadmin api export --section apioptions --file temp/apioptions.json
```

## Section Filter
You can further refine the section by using a specific section filter. 

NOTE: The formats use the new enhanced team development style and cannot be mixed with other lacadmin commands.
```
EXPORT PROJECT=demo
mkdir temp2
$lacadmin api export --section connections --section_filter "name=MQTTConn" --file temp2/connections.json
$lacadmin api export --section custom_endpoints --section_filter "name=endpoint" --file temp2/custom_endpoints.json
$lacadmin api export --section listeners --section_filter "name=START" --file temp2/listeners.json
$lacadmin api export --section data_sources --section_filter "prefix=demo" --file temp2/datasources.json
$lacadmin api export --section filters --section_filter "name=UserFilter" --file temp2/filters.json
$lacadmin api export --section functions --section_filter "name=testFunction" --file temp2/functions.json
$lacadmin api export --section libraries --section_filter "name=b2bB2B" --file temp2/libraries.json
$lacadmin api export --section request_events --section_filter "name=ResponseEvent"  --file temp2/request_events.json
$lacadmin api export --section sorts --section_filter "name=UserSort" --file temp2/sorts.json
$lacadmin api export --section timers --section_filter "name=New Timer" --file temp2/timers.json
$lacadmin api export --section topics --section_filter "name=Audit Orders"  --file temp2/topics.json
$lacadmin api export --section security.authtokens  --section_filter "name=Admin key" --file temp2/authtokens.json
$lacadmin api export --section security.roles --section_filter "name=Read only" --file temp2/roles.json
$lacadmin api export --section security.users --section_filter "name=guest" --file temp2/users.json
$lacadmin api export --section resources --section_filter "name=AllCustomers&version=v1" --file temp2/resources.json
$lacadmin api export --section rules --section_filter "name=sum_balance&prefix=demo"  --file temp2/rules.json
```
You can combine each section into a single zip file (the only requirement for import 
is that there is an api.json file at the root).