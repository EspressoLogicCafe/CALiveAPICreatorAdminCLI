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
    --exportFile [fileName]       Name of file to Export auth provider
    --importFile [fileName]       Name of file to Import auth provider
```

List of commands allows you to list your CA Live API Creator authentication providers. Please see our [Wiki] (https://github.com/EspressoLogicCafe/StormpathAuthProvider/wiki/Installation-of-a-Custom-Authentication-Provider) for details on how to create and install a custom authentication provider (e.g. Active Directory, LDAP, SQL, LDAP, Stormpath, etc.). All communication with the Espresso Logic server is done by API calls using JSON/REST.  The authentication provider is the way to talk to an Espresso Logic server.  User Authentication results in a new API key, which is passed on all subsequent requests, and associates a set of security roles that define what the API key is authorized to do.

***
## Authentication Provider list
    liveapicreatoradmin authprovider list

The `list` command shows all authentication providers for the current account.

#### Output
    All authentication providers
    Ident  Name                                                       Comments
    -----  ---------------------------------------------------------  --------
    1000   Built-in authentication (dblocal_admin - dblocal_usrtbls)
    
    # authentication providers: 1

The `list` command is currently the only one available from the command line for
authentication providers. For details on how to create a [custom authentication provider](http://ca-doc.espressologic.com/docs/logic-designer/security/authentication/custom-authentication-provider).
