# Libraries

```
 Usage: libraries [options] <list|create|delete|export|import>

  Administer java and javascript libraries for an account.

  Options:

    -h, --help                    output usage information
    --ident [ident]          The ident of the library
    --project_ident [ident]  The project ident of the library that will be marked as used in the project.
    --name [name]            Name of library
    --libtype [type]         Type of Library [javascript | java]
    --ver [version]          Version of Library JS or Java
    --short_name [shortname] Short Name
    --docUrl [docurl]        Documentation URL
    --refUrl [refurl]        Reference URL
    --comments [comment]     Comment on Library
    --linkProject            Mark this library as used in the current project (or --project_ident selected)
    --file [fileName]        Name of file to library JAR or JS (if not provided stdin/stdout used for export)
```


***
## Libraries list
List of commands allows you to list your CA Live API Creator libraries. 

```
    liveapicreatoradmin libraries list
```

The `list` command shows all libraries for the current account.

#### Output
```
All Libraries                                                                                                                                          
Ident  Name                        Version   Short Name                  Type        Comments                                          
-----  --------------------------  --------  --------------------------  ----------  --------------------------------------------------
3      Apache Commons Codec        1.10      commons-codec               java        Apache Commons Codec                              
5      Apache Commons Math         3.5       commons-math                java        The Apache Commons Mathematics Library            
6      Joda-Time                   2.9       joda-time                   java        Joda-Time provides a quality replacement for th...
500    Moment.js (with Locales)    2.10.6    moment                      javascript  A JavaScript date library for parsing, validati...
508    MongoUtility.js             0.9.0     MongoUtility.js             javascript  A JavaScript utility for using MongoDB within C...
507    Numeral.js                  1.5.3     Numeral.js                  javascript  A JavaScript library for formatting and manipul...
503    ParsedURL - URL parser      1.0       ParsedURL                   javascript  A simple JavaScript class/library for parsing/m...
506    Stormpath-CALiveAPICreator  0.2.1     Stormpath-CALiveAPICreator  javascript  Stormpath-CALiveAPICreator contains stormpathAu...
504    Underscore.js Library       1.8.3     underscore                  javascript  Underscore is a JavaScript library that provide...
502    jkl XML parser              0.22      jkl                         javascript  A pure-JS XML parser.                             
501    json2                       20150503  json2                       javascript  A pure-JS implementation of the JSON interchang...

# libraries: 11                                                                                                                           
```

The `list` command is currently the only one available from the command line for
libraries. For details on how to create a [custom authentication provider](http://ca-doc.espressologic.com/docs/logic-designer/security/authentication/custom-authentication-provider).

## Library Create
Create needs a name, comment, the create function name and a list of parameters in JSON format 
```
liveapicreatoradmin libraries create --name customJSLib [--project_ident 1005] --comments my js lib --short_name mylib --libtype [javascript | java]  --ver 2.1 --file mycustomjslib.js
```

## libraries delete
Simply provide the ident of the library you wish to delete.
```
liveapicreatoradmin libraries delete --ident 2007
```

## Library export
Provide the ident of the library and (optional) the export file name. If not provided - it will be sent to stdout.
```
liveapicreatoradmin libraries export  [--ident <ident> | --short_name <name> | --name <name>] --file mylibrary.json
```
The export libraries exports the specified library into a JSON file. If the filename parameter is not specified, stdout is used.

## Library import
Provide the name of the json file for the library you wish to import.
```
liveapicreatoradmin libraries import [--project_ident 1005 | --short_name <name>] --link_project true --file mylibrary.json
```
The import library imports the specified JSON file. If the filename parameter is not specified, stdin is used. (you can pipe the json file to the import)



