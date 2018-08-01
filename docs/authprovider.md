# Authentication provider
For details on how to [Define a Custom Hello World Authentication Provider](https://docops.ca.com/ca-live-api-creator/5-0/en/securing-apis/configure-authentication/define-a-custom-hello-world-authentication-provider-using-javascript) using JavaScript.

```
 Usage: authprovider [options] <list|create|delete|export|import|linkProjec|insertJSCode>

  Administer authentication providers for a TeamSpace.

  Options:

    -h, --help                    output usage information
    --ident [ident]               The ident of the auth provider
    --auth_name [name]            Name of auth provider
    --createFunction [bootstrap]  Name for Create Function
    --paramMap [map]              Map of auth provider settings (comma separated list of required config values)
    --comments [comment]          Comment on auth provider
    --linkProject                 Link this auth provider to the current project or project specified
    --file [fileName]       	  [optional] Name of file to import/export auth provider (stdin/stdout used if not provided)
```


***
## Authentication Provider list
List of commands allows you to list your CA Live API Creator authentication providers. 
Please see our [docs] (https://docops.ca.com/ca-live-api-creator/5-0/en/securing-apis/configure-authentication/authenticate-api-users-using-a-javascript-authentication-provider) for details on how to create and install a custom authentication provider (e.g. Active Directory, LDAP, SQL, LDAP, AD, etc.). 
All communication with the Espresso Logic server is done by API calls using JSON/REST.  
The authentication provider is the way to talk to an Espresso Logic server.  
User Authentication results in a new API key, which is passed on all subsequent requests, and associates a set of security roles that define what the API key is authorized to do.

```
    $lacadmin authprovider list
```

The `list` command shows all authentication providers for the current TeamSpace.

#### Output
    All authentication providers
    Ident  Name                     createFunction  ParamMap            Comments
    -----  -----------------------  --------------  ------------------  --------
    1000   Built-in authentication  null            datasource=AdminDB          
    
    # authentication providers: 1

The `list` command is currently the only one available from the command line for
authentication providers. 
### adding the --verbose flag  
Includes sample scripts which can be used by devops developers.
```
lacadmin authprovider export --auth_name 'AuthProviderFromDB' --file AUHTPROVIDER_AuthProviderFromDB.json --comments 'Uses Get Employees for REST Validation '
lacadmin authprovider export --auth_name 'JSAUth' --file AUHTPROVIDER_JSAUth.json --comments 'test'
lacadmin authprovider export --auth_name 'SimpleLDAP' --file AUHTPROVIDER_SimpleLDAP.json
```
##Create
Create needs a name, comment, the create function name and a list of parameters in JSON format 
```
    $lacadmin authprovider create --createFunction myAuthProviderCreate --paramMap 'foo=1,bar=2' --comments 'some comment' --auth_name <name>
```

##insertJSCode
Once you have created a JavaScript auth provider (create) - use this to import the JavaScript code
```
    $lacadmin authprovider insertJSCode --file myAUthProviderCdoe.js [--auth_name <name>  | --ident <ident>]  [--project_ident <ident>] 
```

##Delete
Simply provide the ident of the auth provider you wish to delete.
```
    $lacadmin authprovider delete --ident <ident>
```

##Export
Provide the ident or name of the auth provider and the export file name.
```
    $lacadmin authprovider export  [--ident <ident> | --auht_name <name>] --file myauthprovider.json
```
The export auth provider exports the specified provider into a JSON file. If the filename parameter is not specified, stdout is used.

##Import
Provide the name of the json file for the auth provider you wish to import.  This is the entire JSON definition.
```
    $lacadmin authprovider import --file myauthprovider.json
```
The import auth provider imports the specified auth provider JSON file. If the filename parameter is not specified, stdin is used. (you can pipe the json file to the import)

##linkProject
Provide the name or auth provider ident and this will set the authprovider in API Project/Settings for the active project. (or project ident)
```
    $lacadmin authprovider linkProject [--auth_name <name> | --ident <ident>]  [--project_ident <ident>] 
```
