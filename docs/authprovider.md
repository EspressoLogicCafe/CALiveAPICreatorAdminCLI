# Authentication provider
For details on how to [create custom authentication provider](https://docops.ca.com/ca-live-api-creator/4-0/en/creating-apis/security/authentication/authentication-providers/create-custom-authentication-providers-using-javascript) using JavaScript.

```
 Usage: authprovider [options] <list|create|delete|export|import|linkProject>

  Administer authentication providers for an account.

  Options:

    -h, --help                    output usage information
    --ident [ident]               The ident of the auth provider
    --name [name]                 Name of auth provider
    --createFunction [bootstrap]  Name for Create Function
    --paramMap [map]              Map of auth provider settings (comma separated list of required config values)
    --comments [comment]          Comment on auth provider
    --linkProject                 Link this auth provider to the current project or project specified
    --file [fileName]       	  [optional] Name of file to import/export auth provider (stdin/stdout used if not provided)
```


***
## Authentication Provider list
List of commands allows you to list your CA Live API Creator authentication providers. Please see our [Wiki] (https://github.com/EspressoLogicCafe/StormpathAuthProvider/wiki/Installation-of-a-Custom-Authentication-Provider) for details on how to create and install a custom authentication provider (e.g. Active Directory, LDAP, SQL, LDAP, Stormpath, etc.). All communication with the Espresso Logic server is done by API calls using JSON/REST.  The authentication provider is the way to talk to an Espresso Logic server.  User Authentication results in a new API key, which is passed on all subsequent requests, and associates a set of security roles that define what the API key is authorized to do.

```
    $lacadmin authprovider list
```

The `list` command shows all authentication providers for the current account.

#### Output
    All authentication providers
    Ident  Name                     createFunction  ParamMap            Comments
    -----  -----------------------  --------------  ------------------  --------
    1000   Built-in authentication  null            datasource=AdminDB          
    
    # authentication providers: 1

The `list` command is currently the only one available from the command line for
authentication providers. 

##Create
Create needs a name, comment, the create function name and a list of parameters in JSON format 
```
    $lacadmin authprovider create --createFunction myAuthProviderCreate --paramMap foo=1,bar=2 --comments 'some comment' --name <name>
```

##Delete
Simply provide the ident of the auth provider you wish to delete.
```
    $lacadmin authprovider delete --ident <ident>
```

##Export
Provide the ident of the auth provider and the export file name.
```
    $lacadmin authprovider export  [--ident <ident> | --name <name>] --file myauthprovider.json
```
The export auth provider exports the specified provider into a JSON file. If the filename parameter is not specified, stdout is used.

##Import
Provide the name of the json file for the auth provider you wish to import.
```
    $lacadmin authprovider import --file myauthprovider.json
```
The import auth provider imports the specified auth provider JSON file. If the filename parameter is not specified, stdin is used. (you can pipe the json file to the import)

##linkProject
Provide the name or auth provider ident and this will set the authprovider in API Project/Settings for the active project. (or project ident)
```
    $lacadmin authprovider linkProject [--name <name> | --ident <ident>]  [--project_ident <ident>] 
```

