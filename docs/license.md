#License
Logon as 'sa' to list or import your license file from each server instance.
```
lacadmin login -u sa -p somepassword http://localhost:8080 -a admin
lacadmin use admin
lacadmin status
you are currently logged in to admin server: http://localhost:8080/APIServer/rest/abl/admin/v2 as user sa
```
##Help
```
$lacadmin license --help

  Usage: license [options] <list|import>

  Administer server License for connected server.

  Options:

    -h, --help         output usage information
    --file [fileName]   Name of file to import (if not provided stdin used for import)
```
##List
List contents of existing CA Live API Creator server License
```
$lacadmin license list
License                                                                                                           
Company          Organization     location  license_type  Expiration              
---------------  ---------------  --------  ------------  ------------------------
CA Technologies  Evaluation only  Anywhere  TRIAL         2017-02-18T15:59:59.000Z

```
##Import
Copy your license JSON file to your local file system and use the import feature.
```
$lacadmin license import --file DefaultLicense.json 
admin:server_licenses/2003 ident:2003 ts:2017-01-27T22:53:... license_text:{  "licenseInfo":...
and 0 other objects
Request took: 103ms - # objects touched: 1  
```
