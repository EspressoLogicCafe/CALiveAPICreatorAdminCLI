# Application

This suite of commands allows you to manipulate your CA Live API Creator API projects. Login to the LAC server, select a project to use (by url_name) and list, export, delete, or import JSON definitions setup in Data Explorer.

## Application Options
```$xslt
$ lacadmin application --help

  Usage: application [options] <list|delete|import|export>

  Administer Data Explorer Applications. 

  Options:

    --ident [ident]            The ident of the specific project (see project list)
    --project_name [name]      The name of the project
    --url_name [name]          The name of the project
    --application_name [name]  The name of the application
    --file [file]              optional: for import/export, the name of a file to read from/save to, if unspecified, use stdin/stdout
    -h, --help                 output usage information


    $lacadmin login -u admin -p MYPASSWORD http://localhost:8080
    $lacadmin project use --url_name demo
```

## List
```$xslt
    $lacadmin application list
```
## Export
````$xslt
    $lacadmin application export --file APPLICATION.json

````
##  Import
```$xslt
    $lacadmin application import --file APPLICATION.json

```
##  Delete
```$xslt

    $lacadmin application delete --ident 1000
```