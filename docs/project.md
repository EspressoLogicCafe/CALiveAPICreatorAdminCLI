# Project

This suite of commands allows you to manipulate your CA Live API Creator API projects.
## Project Options
```
Usage: project [options] <list|create|update|delete|use|import|export|extract>

  Administer projects. Actions are: list, create, update, delete, use, export

  Options:

    -h, --help                   output usage information
    --ident [ident]              The ident of the specific project (see project list)
    --project_name [name]        The name of the project
    --url_name [name]            The name of the project
    --status [status]            optional: the status of the project, can be A (for Active) or I for (Inactive)
    --authprovider [ident]       optional: the ident of the authentication provider for the project
    --comments [comments]        optional: a description of the project
    -d, --directory [directory]  Required for extract, the name of a directory to extract ZIP files
    -f, --file [file]            optional: for import/export, the name of a file to read from/save to, if unspecified, use stdin/stdout
    --format [json|zip]          optional: for import/export, this sets the output type of the export default: zip
    --synchronize [true|false]   optional: Used by extract & synchronize zip file with directory folder (default: false)
    --verbose                    optional: whether to display detailed results, or just a summary
```
***
## list
    $lacadmin project list

The `list` command shows all projects in the current server.

#### Output
    All projects
    Ident  Name                  Enabled  URL      Comments
    -----  --------------------- ------  -------  --------
    1000   Logic Demo             true   demo
    1002   Logic Sample           true   sample
    1003   My Project             true   myproj
    1005   My Project2            true   myproj2
    
    # projects: 4

***
###adding the --verbose flag to project list 
Includes sample scripts which can be used by devops developers.
```
#lacadmin project export --url_name admin  --file PROJECT_admin.json --format json
#lacadmin project export --url_name admin  --file PROJECT_admin.zip --format zip
#lacadmin project extract --file PROJECT_admin.zip --directory /temp/ --synchronize true
#lacadmin project import --file PROJECT_admin.json
#lacadmin project import --file PROJECT_admin.zip
```
## Create

    $lacadmin project create --project_name <name> --url_name <url_name> [--status <A|I>] [--authprovider <ident>]
        [--comments <comments>] [--verbose]

The create command creates a new project with the given values. Status is active by default, it can be specified
as A(ctive) or I(nactive).

If the `--verbose` option is specified, the output will include all created objects instead of a summary.

### Output

	Project was created, including:
	I admin:projects/1007 ident:1007 ts:2014-11-26T14:21:... name:My Project3 url_name:myproj3 comments:[null] status:A is_active:true account_ident:1000 authprovider_ident:[null]
	and 20 other objects
	Request took: 470ms - # objects touched: 21
	Current project is now: My Project3 (1007)

Note that creating a project also creates a number of other default objects.
Once the project is created, it becomes the current project.

***
##Update
The update command updates one or more attribute of the specified project.
The project can be specified either by its name or by its URL name.


    $lacadmin project update [--project_name <name> | --url_name <url_name>] 
        [--status <A-I>] [--authprovider <ident>] [--comments <comments>]
***
##Delete
The delete command deletes the specified project and everything it contains.
The project can be specified either by its name or by its URL name.

If the `--verbose` option is specified, the output will include all deleted objects instead of a summary.
```
    $lacadmin project delete [--project_name <name> | --url_name <url_name>] [--verbose]

```
## Use

    $lacadmin project use [--project_name <name> | --url_name <url_name>]

The use command makes the specified project the current project.
The project can be specified either by its name or by its URL name.

***
## Import
Import an existing API project to LAC server.  File type may be either a zip or json file. 
The import command imports a project from the specified JSON export file.
If the `filename` parameter is not specified, stdin is used. This allows you to pipe in content from another command.

You can optionally give the new project a different name or URL name.

If the `--verbose` option is specified, the output will include all created objects instead of a summary.


    $lacadmin project import --file <filename> [--verbose]
     
***
## Export
The export project exports the specified project into a JSON ir ZIP file.  The format flag will default to ZIP if not supplied.
If the `filename` parameter is not specified, stdout is used.

The project can be specified either by its name or by its URL name.

If the `--verbose` option is specified, the output will include all created objects instead of a summary.
```

    $lacadmin project export  [--project_name <name> | --url_name <url_name>] --file <filename>
         [--format [zip|json] [--verbose]
 
```

##Extract
This will take the content of a downloaded ZIP fil and compare it with the selected directory.  If the directory does not exist, the zip file will be exploded into this directory.  If the directory exist and the synchronize flag is set to true (default is false) the system will remove any files found in the directory that are not in the ZIP file.

```
    $lacadmin project extract --file <filename.zip> --directory </tmp/path/>  --synchronize [true|false]

```