# Project
##DEPRECATED IN 4.1 see Customize your [API](https://docops.ca.com/ca-live-api-creator/5-0/en/creating-apis/customize-your-api)
This suite of commands allows you to manipulate your CA Live API Creator API projects.
## Project Options

```
Usage: project [options] <list|create|update|delete|use|import|export>

  Administer projects. Actions are: list, create, update, delete, use, import, export

  Options:

    -h, --help              output usage information
    --project_name [name]   The name of the project
    --url_name [name]       The name of the project
    --status [status]       Optional: the status of the project, can be A (for Active) or I for (Inactive)
    --authprovider [ident]  Optional: the ident of the authentication provider for the project
    --comments [comments]   Optional: a description of the project
    --file [file]           Optional: for import/export, the name of a file to read from/save to, if unspecified, use stdin/stdout
    --verbose               Optional: whether to display detailed results, or just a summary

```
***
## Project list
    liveapicreatoradmin project list

The `list` command shows all projects in the current server.

#### Output
    All projects
    Ident  Name                   URL      Comments
    -----  ---------------------  -------  --------
    1000   Logic Demo             demo
    1002   Logic Sample           sample
    1003   My Project             myproj
    1005   My Project2            myproj2
    1001   Your Database          data
    
    # projects: 5


***
## Project create

    liveapicreatoradmin project create --project_name <name> --url_name <url_name> [--status <A|I>] [--authprovider <ident>]
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
## Project update

    liveapicreatoradmin project update [--project_name <name> | --url_name <url_name>] 
        [--status <A-I>] [--authprovider <ident>] [--comments <comments>]

The update command updates one or more attribute of the specified project.
The project can be specified either by its name or by its URL name.

***
## Project delete

    liveapicreatoradmin project delete [--project_name <name> | --url_name <url_name>] [--verbose]

The delete command deletes the specified project and everything it contains.
The project can be specified either by its name or by its URL name.

If the `--verbose` option is specified, the output will include all deleted objects instead of a summary.

***
## Project use

    liveapicreatoradmin project use [--project_name <name> | --url_name <url_name>]

The use command makes the specified project the current project.
The project can be specified either by its name or by its URL name.

***
## Project import

    liveapicreatoradmin project import [--project_name <name> | --url_name <url_name>] --file <filename>
         [--verbose]

The import command imports a project from the specified JSON export file.
If the `filename` parameter is not specified, stdin is used. This allows you to pipe in content from another command.

You can optionally give the new project a different name or URL name.

If the `--verbose` option is specified, the output will include all created objects instead of a summary.

***
## Project export

    liveapicreatoradmin project export  [--project_name <name> | --url_name <url_name>] --file <filename>
         [--verbose]
    
The export project exports the specified project into a JSON file.
If the `filename` parameter is not specified, stdout is used.

The project can be specified either by its name or by its URL name.

If the `--verbose` option is specified, the output will include all created objects instead of a summary.
