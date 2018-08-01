# Logic Libraries
Support for JavaScript libraries. See Doc page: [Logic Libraries](https://docops.ca.com/ca-live-api-creator/5-0/en/creating-apis/logic/logic-libraries)


```
 Usage: libraries [options] <list|create|delete|export|import|exportJavascript> javascript libraries for an active project. 
 
  Options:
  Administer 

    -h, --help               output usage information
    --ident [ident]          The ident of the library
    --project_ident [ident]  The project ident of the library that will be marked as used in the project.
    --library_name [name]    Name of library
    --libtype [type]         Type of Library [javascript | java]
    --ver [version]          Version of Library JS or Java
    --short_name [shortname] Short Name
    --docUrl [docurl]        Documentation URL
    --refUrl [refurl]        Reference URL
    --verbose 		         Display more detailed output
    --comments [comment]     Comment on Library
    --linkProject            Mark this library as used in the current project (or --project_ident selected)
    --file [fileName]        Name of file to library JAR or JS (if not provided stdin/stdout used for export)
```


***
## list
List of commands allows you to list your CA Live API Creator libraries. 

```
    $lacadmin libraries list
```

The `list` command shows all libraries for the current TeamSpace.

#### Output
```
All Libraries                                                                                                                                                 
Ident  Name                      Version   Short Name       Type        Comments                                          
-----  ------------------------  --------  ---------------  ----------  --------------------------------------------------
511    Moment-Timezone.js        0.5.3     moment-timezone  javascript  Parse and display dates in any timezone.          
500    Moment.js (with Locales)  2.12.0    moment           javascript  A JavaScript date library for parsing, validati...
507    Numeral.js                1.5.3     Numeral.js       javascript  A JavaScript library for formatting and manipul...
503    ParsedURL - URL parser    1.0       ParsedURL        javascript  A simple JavaScript class/library for parsing/m...
504    Underscore.js Library     1.8.3     underscore       javascript  Underscore is a JavaScript library that provide...
502    jkl XML parser            0.22      jkl              javascript  A pure-JS XML parser.                             
501    json2                     20150503  json2            javascript  A pure-JS implementation of the JSON interchang...

# libraries: 7                                                                                                                           
```

The `list` command is currently the only one available from the command line for
libraries. For details on how to create a [custom authentication provider](https://docops.ca.com/ca-live-api-creator/5-0/en/creating-apis/security/authentication/authentication-providers/create-custom-authentication-providers-using-javascript).

## Create
Create needs a name, comment, the create function name and a list of parameters in JSON format.  This requires that the file is in plain ASCII text format
```
    $lacadmin libraries create --name customJSLib [--project_ident 1005] --linkProject --comments 'my js lib' --short_name mylib --ver 2.1 --file mycustomjslib.js
```

## Delete
Simply provide the ident of the library you wish to delete.
```
    $lacadmin libraries delete --ident 2007
```

## Export
Provide the ident of the library and (optional) the export file name. If not provided - it will be sent to stdout.  The exported code will be in hex or base64 format.
Note: If you select a single library and use stdout (no --file) the library will be written to file as readable text
```
    $lacadmin libraries export  [--ident <ident> | --short_name <name> | --library_name <name>] [--file mylibrary.json]
```
The export libraries exports the specified library into a JSON file. If the filename parameter is not specified, stdout is used.


## ExportJavaScript
Provide the ident of the library and this will only export the Javascript code.
```
    $lacadmin libraries exportJavascript  --ident <ident>  [--file mylibrary.js]
```
The export libraries exports the specified library JavaScript code. If the filename parameter is not specified, stdout is used.


## Import
Provide the name of the json file for the library you wish to import.  This will only allow import of files that have been exported using lacadmin (the code is in hex or base64 format)
The project_ident is only required if you intend to link the library to a specific (or active) project.
```
    $lacadmin libraries import [--project_ident 1005] --linkProject  --file mylibrary.json
```
The import library imports the specified JSON file. If the filename parameter is not specified, stdin is used. (you can pipe the json file to the import)



