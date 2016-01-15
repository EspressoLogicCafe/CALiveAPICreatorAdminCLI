# Authentication provider

```
 Usage: authprovider [options] <list|create|delete|export|import>

  Administer authentication providers for an account.

  Options:

    -h, --help                    output usage information
    --ident [ident]               The ident of the auth provider
    --name [name]                 Name of auth provider
    --createFunction [bootstrap]  Name for Create Function
    --paramMap [map]              Map of auth provider settings
    --comments [comment]          Comment on auth provider
    --file [fileName]       	  [optional] Name of file to import/export auth provider (stdin/stdout used if not provided)
```


***
## Authentication Provider list
List of commands allows you to list your CA Live API Creator authentication providers. Please see our [Wiki] (https://github.com/EspressoLogicCafe/StormpathAuthProvider/wiki/Installation-of-a-Custom-Authentication-Provider) for details on how to create and install a custom authentication provider (e.g. Active Directory, LDAP, SQL, LDAP, Stormpath, etc.). All communication with the Espresso Logic server is done by API calls using JSON/REST.  The authentication provider is the way to talk to an Espresso Logic server.  User Authentication results in a new API key, which is passed on all subsequent requests, and associates a set of security roles that define what the API key is authorized to do.

```
    liveapicreatoradmin authprovider list
```

The `list` command shows all authentication providers for the current account.

#### Output
    All authentication providers
    Ident  Name                     createFunction  ParamMap            Comments
    -----  -----------------------  --------------  ------------------  --------
    1000   Built-in authentication  null            datasource=AdminDB          
    
    # authentication providers: 1

The `list` command is currently the only one available from the command line for
authentication providers. For details on how to create a [custom authentication provider](http://ca-doc.espressologic.com/docs/logic-designer/security/authentication/custom-authentication-provider).

## Authentication Provider Create
Create needs a name, comment, the create function name and a list of parameters in JSON format 
```
liveapicreatoradmin authprovider create --createFunction myAuthProviderCreate --paramMap {} --comments none --name customAuth
```

## Authentication Provider delete
Simply provide the ident of the auth provider you wish to delete.
```
liveapicreatoradmin authprovider delete --ident <ident>
```

## Authentication Provider export
Provide the ident of the auth provider and the export file name.
```
liveapicreatoradmin authprovider export  [--ident <ident> | --name <name>] --file myauthprovider.json
```
The export auth provider exports the specified provider into a JSON file. If the filename parameter is not specified, stdout is used.

## Authentication Provider import
Provide the name of the json file for the auth provider you wish to import.
```
liveapicreatoradmin authprovider import --file myauthprovider.json
```
The import auth provider imports the specified auth provider JSON file. If the filename parameter is not specified, stdin is used. (you can pipe the json file to the import)



