#!/usr/bin/env node

/**
 * A command-line interface for CA Live API Creator administration
 */

var program = require('commander');
var path = require('path');
var pkg = require('./package.json');
var login = require('./objects/login.js');
var project = require('./objects/project.js'); //deprecated in 4.1 -replaced with API
var dbase = require('./objects/dbase.js');
var resource = require('./objects/resource.js');
var rule = require('./objects/rule.js');
var authprovider = require('./objects/authprovider.js');
var library = require('./objects/library.js');
var apioptions = require('./objects/apioptions.js');
var dotfile = require('./util/dotfile.js');
// new feature since 2.0.65
var sorts = require('./objects/sorts.js');
var filters = require('./objects/filters.js');
var token = require('./objects/token.js');
var role = require('./objects/role.js');
var user = require('./objects/user.js');
var topic = require('./objects/topic.js');
var event = require('./objects/event.js');
var reln = require('./objects/reln.js');
var handler = require('./objects/handler.js');
var apiversion = require('./objects/version.js');
// 2.1 features
var npa = require('./objects/npattrs.js');
var gateway = require('./objects/gateway.js');
//3.0 features
var managedserver = require('./objects/managedserver.js');
var migrate = require('./objects/migrate.js');
var eula = require('./objects/eula.js');
//3.1 features
var schema = require('./objects/schema.js');
var fnction = require('./objects/function.js');
var license = require('./objects/license.js');
//3.2 features
var vkey = require('./objects/virtualkey.js');
var seq = require('./objects/sequence.js');
//4.0 features
var listener = require('./objects/listener.js');
var connection = require('./objects/connection.js');
var timer = require('./objects/timer.js');
var provider = require('./objects/provider.js');
var application = require('./objects/application.js');
//4.1 features - changes to project import/export as zip
var teampspace = require('./objects/teamspace.js');
var api = require('./objects/api.js');
//5.0 features
var teampspace_user = require('./objects/teamspace_user.js');
var dataprovider = require('./objects/dataprovider.js');
//5.2
var telemetry = require('.//objects/telemetry.js');

program
	.version(pkg.version);

program
	.command('login [url]')
	.description('Login to a CA Live API Creator Server (e.g. lacadmin login -u admin -p secret http://localhost:8080 -a demo)')
	.option('-u, --username <username>', 'API Server admin user name')
	.option('-p, --password <password>', 'API Server admin password')
	.option('-a, --serverAlias <serverAlias>', 'optional: Alias for a named connection')
	.action(login.commandLogin);

program
	.command('logout [url]')
	.description('Logout from the current server, or a named server alias [$lacadmin logout -a demo]')
	.option('-a, --serverAlias <serverAlias>', 'optional: named alias connection to logout')
	.action(login.commandLogout);

program
	.command('use <alias> (lacadmin use demo)')
	.description('Use the specified server alias connection (if available)')
	.action(login.commandUseAlias);

program
	.command('status')
	.description('Show the current server(s) connections and any defined server aliases')
	.action(login.commandStatus);

program
	.command('license <list|import>')
	.description('Administer server License for connected API server.')
	.option('-f, --file [fileName]', 'Name of the license file to import (if not provided stdin used for import)')
	.action(license.doLicense);

program
	.command('eula <accepted>')
	.description('End user license agreement status (note: must be accepted before any script will run) returns true or false')
	.action(eula.doStatus);

program
	.command('project <list|create|update|delete|use|import|export>')
	.description('[Deprecated in 4.1 - replaced by api] Administer 4.0 and earlier project API. Actions are: list, create, update, delete, use, export')
	.option('--ident [ident]', 'The ident of the specific project (see project list)')
	.option('--project_name [name]', 'The name of the project')
	.option('--url_name [name]', 'The name of the project')
	.option('--status [status]', 'optional: the status of the project, can be A (for Active) or I for (Inactive)')
	.option('--authprovider [ident]', 'optional: the ident of the authentication provider for the project')
	.option('--comments [comments]', 'optional: a description of the project')
	.option('--file [file]', 'optional: for import/export, the name of a file to read from/save to, if unspecified, use stdin/stdout')
	.option('--verbose', 'optional: whether to display detailed results, or just a summary')
	.action(project.doProject);

program
	.command('api <list|create|update|delete|use|import|export|extract>')
	.description('Administer an API for the current connection. Actions are: list, create, update, delete, use, import, export, extract')
	.option('--ident [ident]', 'The ident of the specific API (use $lacadmin api list)')
	.option('--api_name [name]', 'The name of the API')
	.option('--url_name [name]', 'The url fragment name of the API')
	.option('--status [status]', 'optional: create or update the status of the API, can be A (for Active) or I for (Inactive)')
	.option('--authprovider [ident]', 'optional: create or update the ident of the authentication provider for the API')
	.option('--comments [comments]', 'optional: create or update a description of the API')
	.option('-d, --directory [directory]', 'Required for extract, the name of a directory to extract ZIP files')
	.option('-f, --file [file]', 'optional: for import/export, the name of a file to read from/save to, if unspecified, use stdin/stdout')
	.option('--format [json|zip]', 'optional: for import/export, this sets the output type of the export default: json')
	.option('--section [name]', '(optional) Export Only - The named section of the API you wish to export (e.g. resources, functions, data sources)')
	.option('--section_filter [filter]', '(optional) Export Only - The section filter of the API you wish to export in quotes ("name=resourcename")')
	.option('--namecollision [fail|rename_new|replace_existing|disable_and_rename_existing]', 'optional: Import, determines how to handle existing API (default: rename_new)')
	.option('--errorhandling [standard|fail_on_warning|best_efforts]', 'optional: Import, sets the error level response handling (default: standard')
	.option('--passwordstyle [skip|encrypted|plaintext]', 'optional: Export only- controls the password style of exported API data sources (default: skip)')
	.option('--librarystyle [emit_all|in_use_only]', 'optional: Export only- controls the library content for export  (default: emit_all)')
	.option('--apioptionsstyle [emit_all|skip_default]', 'optional: Export only- controls the api options for export (default: emit_all)')
	.option('--synchronize [merge|replace]', 'optional: Export only- Used only by extract to synchronize zip file with directory folder (default: merge) replace will remove root directory contents and replace with zip contents')
	.option('-v, --verbose', 'optional: whether to display detailed results, or just a summary')
	.action(api.doAPI);

program
	.command('libraries <list|create|update|delete|export|import|exportJavascript|importJavascript>')
	.description('Administer javascript libraries for a specific API.')
	.option('--ident [ident]','The ident of the library - used by update, delete, export, or exportJavascript')
	.option('--project_ident [project_ident]','The project ident that this library will be marked as used (lacadmin api list)' )
	.option('--library_name [name]', 'Name of library used by update, delete, export')
	.option('--libtype [type]', 'optional: Type of Library javascript (as of 3.0.x)')
	.option('--ver [version]', 'optional: Version # of Library')
	.option('--short_name [shortname]', 'Short Name')
	.option('--docUrl [docurl]', 'optional: Documentation URL')
	.option('--refUrl [refurl]', 'optional: Reference URL')
	.option('--linkProject','optional: mark the imported library as used by the current API')
	.option('--comments [comment]', 'optional: Comment on Library')
	.option('-f, --file [fileName]', 'optional: Name of {JS} file to import/export (if not provided stdout used for export)')
	.option('-v, --verbose', 'optional: display import/export during library list')
	.action(library.doLibrary);

program
	.command('authprovider <list|create|linkProject|insertJSCode|delete|export|import>')
	.description('Administer authentication providers for a TeamSpace.')
	.option('--ident [ident]','The ident of the auth provider')
	.option('--project_ident [ident]','The project ident used to link this auth provider')
	.option('--auth_name [name]', 'Name of auth provider')
	.option('--createFunction [bootstrap]', 'Name for Create Function')
	.option('--paramMap [map]', 'Map of auth provider settings')
	.option('--comments [comment]', 'Comment on auth provider')
	.option('-v, --verbose', 'optional: Display authprovider with create statements')
	.option('-f, --file [fileName]', 'optional: Name of file to Import/Export auth provider (if not provided stdout used for export)')
	.action(authprovider.doAuthProvider);

program
	.command('datasource <list|create|createDatabase|update|delete|import|reload|export>')
	.description('Administer data sources within a selected API.')
	.option('--db_name [name]', 'The name of the data source connection')
	.option('--ident [ident]', 'For delete or reload, the ident of the data source')
	.option('--prefix [prefix]', 'The prefix of the data source connection')
	.option('--jndi_name [jndiname]', 'The JNDI name of the data source connection')
	.option('--dbasetype [dbasetype]', 'The type of the data source: mysql, oracle, sqlserver, derby, postgresql, db2luw, db2zos, csv, hbase, sap, salesforce, sqlserverazure, teradata, informix, db2ios')
	.option('--catalog_name [catalog_name]', 'The catalog name of the data source')
	.option('--schema_name [schema_name]', 'The schema name of the data source')
	.option('--user_name [user_name]', 'The user name of the data source')
	.option('--password [password]', 'The password of the data source')
	.option('--salt [salt]', 'The password salt of the data source')
	.option('--schema_editable [boolean]', 'Is this data source marked as editable (i.e. managed data source) - default: false')
	.option('--url [url]', 'The JDBC URL for the data source')
	.option('--active [true|false]', 'This marks the data source active or inactive')
	.option('--project_ident [ident]', 'The ident of a project, (if other than the current project')
	.option('--managedserver_ident [managedserver_ident]', 'The managed server ident used with command createDatabase (creates both database and data source)')
	.option('--comments [comment]', 'Comment on data source')
	.option('-v, --verbose', 'optional: display list of data sources in detailed create format')
	.option('-f, --file [file]', 'optional: for import/export, the name of a file to read from/save to, if unspecified, use stdin/stdout')
	.action(dbase.doDbase);

program
	.command('resource <list|delete|update|export|import>')
	.description('Administer resources within a project.')
	.option('--ident [ident]', 'For update, the ident of the resource (use resource list)')
	.option('--prop1 [value]', 'For update, the server name of the mongo resource')
	.option('--prop2 [value]', 'For update, the database name of the mongo resource')
	.option('--prop3 [value]', 'For update, the user name of the mongo resource')
	.option('--prop4 [value]', 'For update, the password name of the mongo resource')
	.option('--table_name [tablename]', 'For update, the table name of the normal or mongo resource')
	.option('--resource_name [resourcename]', 'The name of the resource')
	.option('--type [type]', 'The type of the resource: normal, sql, javascript, storedproc, mongo')
	.option('--prefix [prefix]', 'The prefix of the table')
	.option('--apiversion [apiversion]', 'The name of an API version, if there is more than one - default v1')
	.option('--project_ident [ident]', 'The ident of a project, (if other than the current project')
	.option('-v, --verbose', 'Include export/import script for resource list')
	.option('-f, --file [file]', 'optional: for import/export, the name of a file to read from/save to, if unspecified, use stdin/stdout')
	.action(resource.doResource);

program
	.command('rule <list|create|delete|import|export>')
	.description('Administer rules within a project.')
	.option('--ruletype [type]', 'The type of the rule, can be: sum,formula,validation,parentcopy')
	.option('--rule_name [name]', 'The name of the rule used for export,create, or delete')
	.option('--entity_name [prefix:table]', 'The table, qualified with a prefix, for the rule')
	.option('--attribute_name [name]', 'The name of the attribute whose value is computed by the rule. Required for sum, count, formula, minimum, maximum.')
	.option('--role_name [name]', 'The role name - required for sum, count, minimum, maximum')
	.option('--clause [clause]', 'The clause - required for sum, count, minimum, maximum')
	.option('--child_attribute [name]', 'The name of the child attribute - required for sum, minimum, maximum')
	.option('--parent_attribute [name]', 'The name of the parent attribute - required for parent copy')
	.option('--expression [code]', 'The code for the rule - required for formula, events and validations')
	.option('--error_message [message]', 'The error mesaage for the rule - required for validations')
	.option('--rule_name [name]', 'optional: a name for the rule. If not specified, a name will be generated.')
	.option('--comments [comments]', 'optional: a comment for the rule')
	.option('--active [true|false]', 'optional: whether the rule should be active, true by default')
	.option('--project_ident [ident]', 'The ident of a project, if other than the current project')
	.option('--ident [ident]', 'For delete, the ident of the rule to delete')
	.option('--jit [true|false]', 'Just in time flag (default false)')
	.option('--sqlable [true|false]', 'Sqlable flag (default false) - optimize using SQL instead of JavaScript (default false)')
	.option('-f, --file [file]', 'optional: for import/export, the name of a file to read from/save to, if unspecified, use stdin/stdout')
	.option('-v, --verbose', 'optional: whether to display list of rules in detailed format that can be used to recreate using command line')
	.action(rule.doRule);

program
	.command('apioptions <list|update|import|export>')
	.description('Administer API  options for a selected API.')
	.option('--ident [ident]','The ident of the specific project settings object')
	.option('--option_value [value]','This is the value for the specific setting for the ident')
	.option('--project_ident [project_ident]','The project ident that will be marked as used' )
	.option('-f, --file [fileName]', 'optional: Name of file to settings for import/export (if not provided stdout used for export)')
	.action(apioptions.doSettings);


program
	.command('sort <list|create|update|delete|import|export>')
	.description('Administer Named Sorts for the active API.')
	.option('--ident [ident]', 'The ident of the specific named sort object')
	.option('--sort_name [name]', 'The Name of named sort')
	.option('--sort_text [sorttext]', 'Sort Text to define named sort')
	.option('--resource_names [name]', 'optional: Comma seperated list of Resource Names in quotes')
	.option('--comments [comment]', 'optional: Comment on named sort')
	.option('--project_ident [project_ident]', 'optional: The project ident if not the active project')
	.option('-f, --file [fileName]', 'optional: Name of file for import/export (if not provided stdout used for export)')
	.option('-v, --verbose', '{optional)  whether to display list of named sorts in detailed format')
	.action(sorts.doSort);

program
	.command('filter <list|create|delete|update|import|export>')
	.description('Administer Named Filters for the active API.')
	.option('--ident [ident]', 'The ident of the specific named filter object')
	.option('--filter_name [name]', 'The Name of named filter')
	.option('--filter_text [text]', 'Text to define named filter')
	.option('--resource_names [name]', 'optional: Comma seperated list of Resource Names in quotes')
	.option('--comments [comment]', 'optional: omment on named filter')
	.option('--project_ident [project_ident]', 'optional: The project ident if not the active project')
	.option('-f, --file [fileName]', 'optional: Name of file for import/export (if not provided stdin/stdout used for export)')
	.option('-v, --verbose', 'optional: whether to display list of named filter in detailed format')
	.action(filters.doFilter);

program
	.command('authtoken <list|import|export>')
	.description('Administer Auth Tokens for current API.')
	.option('--token_name [name]','The name of the auth token')
	.option('--project_ident [project_ident]','The project ident that will be marked as used' )
	.option('--file [fileName]', 'optional: Name of file to import/export (if not provided stdin/stdout used for export)')
	.action(token.doToken);

program
	.command('role <list|delete|import|export>')
	.description('Administer Security Roles for current API.')
	.option('--ident [ident]', 'The ident of the specific role to delete')
	.option('--role_name [name]', 'The name of the specific role to delete')
	.option('--project_ident [project_ident]','The project ident that will be marked as used' )
	.option('-v, --verbose', 'optional: Display list of roles in detailed export/import format')
	.option('--file [fileName]', 'optional: Name of file to import/export (if not provided stdin/stdout used for export)')
	.action(role.doRole);

program
	.command('user <list|delete|update|import|export>')
	.description('Administer Users for current API. (not available if custom auth provider is used)')
	.option('--project_ident [project_ident]','The project ident that will be marked as used' )
	.option('--ident [ident]', 'The ident of the specific user')
	.option('--user_name [name]', 'The name of the specific user')
	.option('-f, --file [fileName]', 'optional: Name of file to import/export (if not provided stdin/stdout used for export)')
	.option('--password [password]','The password for this user' )
	.option('--fullname [fullname]','User fullname' )
	.option('--user_name [name]','User name (only if using default auth provider)' )
	.option('--status [status]','Status active A or inactive I' )
	.option('--roles [roles]','Comma separated list of role names' )
	.option('--comments [comments]','User comments' )
	.action(user.doUser);


program
	.command('npa <list|delete|export|import>')
	.description('Administer Non Persistent Attributes for the active API.')
	.option('--ident [ident]', 'The ident of the specific named npa object')
    .option('--npa_name [name]', 'The name of the specific named npa object')
	.option('--dbschema_ident [ident]', 'optional: The dbschema ident of the projects data source')
	.option('-f, --file [fileName]', 'optional: Name of file for import/export (if not provided stdin/stdout used for export)')
	.option('-v, --verbose', 'optional: Display non persistent attribute in import/export format')
	.action(npa.doNPAttr);

program
	.command('topic <list|delete|import|export>')
	.description('Administer Topics for current API (used by Rules).')
	.option('--project_ident [project_ident]','The project ident that will be marked as used' )
	.option('--topic_name [name]', 'Name of the topic')
	.option('--ident [ident]', 'The ident of the specific topic to delete')
	.option('-v, --verbose', 'optional: Display list of topics in an import/export format')
	.option('-f, --file [fileName]', 'optional: Name of file to import/export (if not provided stdin/stdout used for export)')
	.action(topic.doTopic);

program
	.command('request_event <list|delete|export|import>')
	.description('Administer Request, Response, & CORS Option events for current API.')
	.option('--event_name [name]', 'The request or response Name')
	.option('--ident [ident]', 'The ident of the specific event')
	.option('--project_ident [project_ident]','The project ident that will be used' )
	.option('-v, --verbose', 'optional: Display list of events in detailed export/import format')
	.option('-f, --file [fileName]', 'optional: Name of file to import/export (if not provided stdin/stdout used for export)')
	.action(event.doListener);

program
	.command('custom_endpoints <list|delete|export|import>')
	.description('Administer Custom Endpoints (aka Handlers) for current API.')
	.option('--project_ident [project_ident]','The project ident that will be used' )
	.option('--ident [ident]', 'The ident of the specific handler')
	.option('--handler_name [name]', 'The name of the Custom Endpoint')
	.option('-v, --verbose', 'optional: Display Custom Endpoints with import/export statements')
	.option('--file [fileName]', 'optional: Name of file to import/export (if not provided stdin/stdout used for export)')
	.action(handler.doHandler);

program
	.command('apiversion <list|export|import>')
	.description('Administer API Versions for Resources for current API.')
	.option('--version_name [name]', 'The API version name')
	.option('--project_ident [project_ident]','The project ident that will be used' )
	.option('-f, --file [fileName]', 'optional: Name of file to import/export (if not provided stdin/stdout used for export)')
	.action(apiversion.doVersion);

program
	.command('relationship <list|delete|export|import>')
	.description('Administer Relationships for current API.')
	.option('--ident [ident]', 'This is the ident of the relationship')
	.option('--relationship_name [name]', 'This is the name (hash) of the relationship')
	.option('--project_ident [project_ident]','The project ident that will be used' )
	.option('-v, --verbose', 'optional: Display list of relationships in import/export format')
	.option('-f, --file [fileName]', 'optional: Name of file to import/export (if not provided stdin/stdout used for export)')
	.action(reln.doReln);

program
	.command('gateway <list|create|delete|import|export|publish>')
	.description('Publish Swagger document for selected API to CA Gateway.')
	.option('--ident [ident]', 'The ident for the saved gateway definition')
	.option('--gateway_name [name]', 'The name for the gateway definition')
	.option('--username [name]', 'The username for the gateway')
	.option('--password [password]','The gateway password.')
	.option('--hostname [server]','The gateway server hostname https://myserver:8443/lacman/1.0/publish' )
	.option('--apiversion [version]','The API version of the swagger document' )
	.option('--url_name [name]','The API url fragment name (use $lacadmin api list)' )
	.option('-v, --verbose', 'optional: display list of data sources in detailed create format')
	.option('--comments [comments]','The gateway definition comments' )
	.option('--file [fileName]', 'optional: Name of file to import/export (if not provided stdin/stdout used)')
	.action(gateway.doGateway);

program
	.command('managedserver <list|create|delete|update|import|export>')
	.description('Administer a managed data server (used by data_sources).')
	.option('--server_name [name]', 'The name of the data source connection')
	.option('--ident [ident]', 'For delete or reload, the ident of the managed data server')
	.option('--dbasetype [dbasetype]', 'The type of the managed data server connection, can be mysql, derby, postgres, sqlserver, oracle')
	.option('--catalog_name [catalog_name]', 'The catalog in the managed data server')
	.option('--user_name [user_name]', 'The name of the managed data server user')
	.option('--password [password]', 'The password of the managed data server user')
	.option('--url [url]', 'The JDBC URL for the managed data server')
	.option('--comments [comment]', 'This is the comment for this managed data server')
	.option('--active [true|false]', 'This marks the managed data server active or inactive')
	.option('--comments [comment]', 'Comment on data source')
	.option('-v, --verbose', 'optional: Display list of data sources in detailed create format')
	.option('-f, --file [file]', 'optional:: for import/export, the name of a file to read from/save to, if unspecified, use stdin/stdout')
	.action(managedserver.doDbase);

program
	.command('migrate <list|plan|script|exportRepos>')
	.description('Migrate a or export all API content for a TeamSpace to a named file')
	.option('-d, --directory [directory]', 'Required for export, the name of a directory to save all exported files')
	.option('-f, --file [file]', 'optional:: for source extract, the name of a file to read from/save to, if unspecified, use stdin/stdout')
	.option('--from [version]', 'required: for script, version number 3.1, 3.2, 4.0, 4.1')
	.option('--to [to]', 'required: for script, version number 3.2, 4.0, 4.1, 5.0')
	.option('--format [json|zip]', 'optional: for import/export  4.1 or 5.0, this sets the output type of the export default: zip')
	.option('--passwordstyle [skip|encrypted|plaintext]', 'optional: for export 4.1 or 5.0, sets the password style of exported API data sources (default: skip)')
	.option('--librarystyle [emit_all|in_use_only]', 'optional: for export  4.1 or 5.0, sets the library style  (default: emit_all)')
	.option('--apioptionsstyle [emit_all|skip_default]', 'optional: for export  4.1 or 5.0, sets the api options (default: emit_all)')
	.action(migrate.doMigrate);

program
	.command('schema <create>')
	.description('Create new database table/columns using @schema format.')
	.option('--project_ident [project_ident]','The project ident that will be marked as used' )
	.option('--prefix [prefix]','The data source prefix used for export. Note for import, the prefix must be marked as schema isEditable' )
	.option('--ignoredbcolumntype [true|false]','optional: The ignoredbcolumntype setting is used when moving between database vendors' )
	.option('--ignoreprimarykeyname [true|false]','optional: The ignoreprimarykeyname setting is used when moving between database vendors' )
	.option('--ignoreconstraintname [true|false]','optional: The ignoreconstraintname setting is used when moving between database vendors' )
	.option('--skiprelationships [true|false]','optional: If true, relationships will not be created - default: false')
	.option('--skiptablecreation [true|false]','optional: If true, tables will not be created - default: false')
	.option('--file [fileName]', 'optional: Name of file to import/export (if not provided stdin/stdout used)')
	.action(schema.doSchema);

program
	.command('function <list|delete|export|import>')
	.description('Administer Functions for current API.')
	.option('--ident [ident]', 'This is the ident of the function')
	.option('--function_name [name]', 'Name of the function')
	.option('--project_ident [project_ident]','optional: The project ident that will be used' )
	.option('-v, --verbose', 'optional: display list of functions in detailed create format')
	.option('--file [fileName]', 'optional: Name of file to import/export (if not provided stdin/stdout used for export)')
	.action(fnction.doFunction);

program
	.command('virtualkey <list|create|update|delete|import|export>')
	.description('Manage a virtualkey to a table or view.')
	.option('--table_ident [ident]', 'For delete or update, the ident of the listed table')
	.option('--view_ident [ident]', 'For delete or update, the ident of the listed view')
	.option('--project_ident [project_ident]','The project ident that will be used to list all data sources' )
	.option('--prefix [prefix]','The data source prefix for this table or view virtual primary key' )
	.option('--table_name [name]','The name of the table to attach a virtual primary key' )
	.option('--view_name [name]','The name of the view to attach a virtual primary key' )
	.option('--keyname [colnamelist]','The comma separated list of column names' )
	.option('--is_autonum [true|false]','If the keyname of a view column that is an autonum - default false' )
	.option('-v, --verbose', 'optional: display list of virtual keys in detailed create format')
	.option('--file [fileName]', 'optional: Name of file to import/export (if not provided stdin/stdout used for export)')
	.action(vkey.doVirtualKey);

program
	.command('sequence <list|create|update|delete|import|export>')
	.description('Manage a database sequence on a key column for a table or view.')
	.option('--table_ident [ident]', 'For delete or update, the ident of the listed table')
	.option('--view_ident [ident]', 'For delete or update, the ident of the listed view')
	.option('--project_ident [project_ident]','The project ident that will be used to list all data sources' )
	.option('--prefix [prefix]','The data source prefix for this table or view virtual primary key' )
	.option('--table_name [name]','The name of the table to attach a virtual primary key' )
	.option('--view_name [name]','The name of the view to attach a virtual primary key' )
	.option('--keyname [colnamelist]','The comma separated list of column names' )
	.option('--sequence [colnamelist]','The comma separated list of column names' )
	.option('--file [fileName]', 'optional: Name of file to import/export (if not provided stdin/stdout used for export)')
	.action(seq.doSequence);

program
	.command('listener <list|delete|export|import>')
	.description('Administer Listener Events for current API.')
	.option('--listener_name [name]', 'The Listener Name')
	.option('--ident [ident]', 'The ident of the specific listener')
	.option('--project_ident [project_ident]','The project ident that will be used' )
	.option('-v, --verbose', 'optional: Display list of listeners in detailed export/import format')
	.option('--file [fileName]', 'optional: Name of file to import/export (if not provided stdin/stdout used for export)')
	.action(listener.doListener);

program
	.command('provider <list|delete|export|import>')
	.description('Administer Listener Provider definitions. (requires login as "sa")')
	.option('--provider_name [name]', 'The Provider Name')
	.option('--ident [ident]', 'The ident of the specific provider')
	.option('-v, --verbose', 'optional: Display list of providers in detailed export/import format')
	.option('--file [fileName]', 'optional: Name of file to import/export (if not provided stdin/stdout used for export)')
	.action(provider.doProvider);

program
	.command('dataprovider <list|delete|export|import>')
	.description('Administer Datasource Provider definitions.')
	.option('--provider_name [name]', 'The Datasource Provider Name')
	.option('--ident [ident]', 'The ident of the specific provider')
	.option('-v, --verbose', 'optional: Display list of providers in detailed export/import format')
	.option('--file [fileName]', 'optional: Name of file to import/export (if not provided stdin/stdout used for export)')
	.action(dataprovider.doProvider);

program
	.command('connection <list|delete|export|import|stop|start>')
	.description('Administer Connections for current API.')
	.option('--connection_name [name]', 'The connection name')
	.option('--ident [ident]', 'The ident of the specific connection')
	.option('--project_ident [project_ident]','The project ident that will be used' )
	.option('-v, --verbose', 'optional: Display list of connection in detailed export/import format')
	.option('--file [fileName]', 'optional: Name of file to import/export (if not provided stdin/stdout used for export)')
	.action(connection.doConnection);

program
	.command('timer <list|delete|export|import>')
	.description('Administer Timer definitions for current API.')
	.option('--timer_name [name]', 'The Timer Name')
	.option('--ident [ident]', 'The ident of the specific timer')
	.option('-v, --verbose', 'optional: Display list of timer in detailed export/import format')
	.option('--file [fileName]', 'optional: Name of file to import/export (if not provided stdin/stdout used for export)')
	.action(timer.doTimer);

program
	.command('application <list|delete|import|export>')
	.description('Administer Data Explorer Applications (meta data).')
	.option('--ident [ident]', 'The ident of the specific project (use $lacadmin api list)')
	.option('--project_name [name]', 'The name of the project')
	.option('--url_name [name]', 'The name of the project')
	.option('--application_name [name]', 'The name of the application')
	.option('--file [file]', 'optional: for import/export, the name of a file to read from/save to, if unspecified, use stdin/stdout')
	.action(application.doApplication);

program
	.command('teamspace <list|exportRepos>')
	.description('List TeamSpace content for current server or exportRepos the entire API contents.')
	.option('-f, --file [file]', 'optional:: for source extract, the name of a file to read from/save to, if unspecified, use stdin/stdout')
	.option('--format [json|zip]', 'optional: for import/export, this sets the output type of the export default: zip')
	.option('--passwordstyle [skip|encrypted|plaintext]', 'optional: for export, sets the password style of exported API data sources (default: skip)')
	.option('--librarystyle [emit_all|in_use_only]', 'optional: for export, sets the library style  (default: emit_all)')
	.option('--apioptionsstyle [emit_all|skip_default]', 'optional: for export, sets the api options (default: emit_all)')
	.option('-v, --verbose', 'optional: used by list to display each API in detailed export/import format')
	.action(teampspace.doTeamSpace);

program
	.command('teamspace_user <list|delete|export|import>')
	.description('Administer TeamSpace Users definitions.')
	.option('--teampspace_username [name]', 'The TeamSpace User Name')
	.option('--ident [ident]', 'The ident of the specific TeamSpace user')
	.option('--account_ident [account_ident]', 'The ident of the specific TeamSpace user')
	.option('-v, --verbose', 'optional: Display list of timer in detailed export/import format')
	.option('--file [fileName]', 'optional: Name of file to import/export (if not provided stdin/stdout used for export)')
	.action(teampspace_user.doTeamSpace);

program
	.command('telemetry <list|update>')
	.description('Administer Telemetry PLA information (requires sa logon).')
	.option('--chargebackID [value]','Chargeback ID')
	.option('--domainName [value]','Domain Name')
	.option('--plaEnabled [true|false]','Enable PLA.')
	.option('--sendEnabled [true|false]','Enable sending telemetry data.')
	.option('--siteID [value]','Site ID.')
	.option('--proxyURL [value]','Proxy URL.')
	.option('--proxyPort [value]','Proxy Port.')
	.option('--proxyUsername [value]','Proxy UserName.')
	.option('--proxyPassword [value]','Proxy Plaintext Password.')
	.option('-v, --verbose', 'optional: used by list to display all telemetry options.')	.action(telemetry.doTelemetry);

program.parse(process.argv);

if (process.argv.length < 3) {
	console.log('You must specify a command'.red);
	program.help();
}
