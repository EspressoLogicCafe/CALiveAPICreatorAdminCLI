# TeamSpace
This feature is for TeamSpace management. For details see [Manage TeamSpace](https://docops.ca.com/ca-live-api-creator/4-1/en/configuring/manage-teamspaces).

```
   Usage: teamspace [options] <list|exportRepos>
  
    List TeamSpace content for current server or exportRepos the entire API contents.
  
  
    Options:
  
      -f, --file [file]                           optional:: for source extract, the name of a file to read from/save to, if unspecified, use stdin/stdout
      --format [json|zip]                         optional: for import/export, this sets the output type of the export default: zip
      --passwordstyle [skip|encrypted|plaintext]  optional: for export, sets the password style of exported API data sources (default: skip)
      --librarystyle [emit_all|in_use_only]       optional: for export, sets the library style  (default: emit_all)
      --apioptionsstyle [emit_all|skip_default]   optional: for export, sets the api options (default: emit_all)
      -v, --verbose                               optional: used by list to display each API in detailed export/import format
      -h, --help                                  output usage information

```


***
## teamspace list
List of commands allows you to list your CA Live API Creator defined TeamSpaces. 

```
    $lacadmin teamspace list [--verbose]
```

The `list` command shows all the current TeamSpaces.

#### Output
```
TeamSpace(s)                                                                                                                                  
Ident  Name               Comments                                          
-----  -----------------  --------------------------------------------------
1000   default TeamSpace  This is the default TeamSpace. You can create a...

# teamspace(s): 1                                                                                                                                             
```


## ExportRepos
This will export all of the APIs (lacadmin api list) found in the connected TeamSpace.  This can be useful
if you need to move the current TeamSpace to another TeamSpace (lacadmin api import --file [filename]) or move
from development to test or production.  You must be logged in as a TeamSpace user (not sa) to be able to export 
the entire repository content.
If [--file] is not provided output will be sent to ALL_REPOS.zip file in the current directory.
```
    $lacadmin teampspace exportRepos --file ALL_REPOS.zip --format zip --passwordstyle encrypted
    http://localhost:8080/rest/abl/admin/v2/@export?urlfragment=csv&urlfragment=demo&urlfragment=sample&urlfragment=hbase&urlfragment=cassandra&urlfragment=sap&responseformat=zip&passwordstyle=skip&authtokenstyle=skip_auto&apioptionsstyle=emit_all&librarystyle=emit_all
    API has been exported to file: ALL_REPOS.zip using format zip
    
```


