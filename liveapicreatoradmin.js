#!/usr/bin/env node

/**
 * A command-line interface for CA Live API Creator administration
 */

var program = require('commander');
var path = require('path');
var pkg = require( path.join(__dirname, 'package.json') );

var login = require('./objects/login.js');
var project = require('./objects/project.js');
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
var snapshot = require('./objects/snapshot.js');//list | start  | restore --name
var npa = require('./objects/npattrs.js');// list | create | delete | update | import |export
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


program
	.version(pkg.version);

program
	.command('login [url]')
	.description('Login to an API server')
	.option('-u, --username <username>', 'API Server admin user name')
	.option('-p, --password <password>', 'API Server admin password')
	.option('-a, --serverAlias <serverAlias>', 'Alias for this connection')
	.action(login.commandLogin);

program
	.command('logout [url]')
	.description('Logout from the current server, or a specific server')
	.option('-a, --serverAlias <serverAlias>', 'Alias from which to logout')
	.action(login.commandLogout);

program
	.command('use <alias>')
	.description('Use the specified server by default')
	.action(login.commandUseAlias);

program
	.command('status')
	.description('Show the current server, and any defined server aliases')
	.action(login.commandStatus);

program
	.command('license <list|import>')
	.description('Administer server License for connected server.')
	.option('--file [fileName]', ' Name of file to import (if not provided stdin used for import)')
	.action(license.doLicense);

program
	.command('eula <accepted>')
	.description('Returns true or false - end user license agreement must be accepted before any script will run')
	.action(eula.doStatus);

program
	.command('project <list|create|update|delete|use|import|export|extract>')
	.description('Administer projects. Actions are: list, create, update, delete, use, export')
	.option('--ident [ident]', 'The ident of the specific project (see project list)')
	.option('--project_name [name]', 'The name of the project')
	.option('--url_name [name]', 'The name of the project')
	.option('--status [status]', 'optional: the status of the project, can be A (for Active) or I for (Inactive)')
	.option('--authprovider [ident]', 'optional: the ident of the authentication provider for the project')
	.option('--comments [comments]', 'optional: a description of the project')
	.option('-d, --directory [directory]', 'Required for extract, the name of a directory to extract ZIP files')
	.option('-f, --file [file]', 'optional: for import/export, the name of a file to read from/save to, if unspecified, use stdin/stdout')
	.option('--format [json|zip]', 'optional: for import/export, this sets the output type of the export default: zip')
    .option('--synchronize [true|false]', 'optional: Used by extract to synchronize zip file with directory folder (default: false)')
	.option('--verbose', 'optional: whether to display detailed results, or just a summary')
	.action(project.doProject);

program
	.command('libraries <list|create|update|delete|export|import>')
	.description('Administer javascript libraries for an account.')
	.option('--ident [ident]','The ident of the library - used by update, delete, export')
	.option('--project_ident [projectId]','The project ident that this library will be marked as used' )
	.option('--name [name]', 'Name of library')
	.option('--libtype [type]', 'optional: Type of Library javascript (as of 3.0.x)')
	.option('--ver [version]', 'optional: Version # of Library')
	.option('--short_name [shortname]', 'Short Name')
	.option('--docUrl [docurl]', 'optional: Documentation URL')
	.option('--refUrl [refurl]', 'optional: Reference URL')
	.option('--verbose', 'optional: display import/export during library list')
	.option('--linkProject','optional: Link the imported library to the current project')
	.option('--comments [comment]', 'optional: Comment on Library')
	.option('--file [fileName]', 'optional: Name of {JS} file to import/export (if not provided stdout used for export)')
	.action(library.doLibrary);

program
	.command('authprovider <list|create|linkProject|delete|export|import>')
	.description('Administer authentication providers for an account.')
	.option('--ident [ident]','The ident of the auth provider')
	.option('--project_ident [ident]','The project ident used to link this auth provider')
	.option('--name [name]', 'Name of auth provider')
	.option('--createFunction [bootstrap]', 'Name for Create Function')
	.option('--paramMap [map]', 'Map of auth provider settings')
	.option('--comments [comment]', 'Comment on auth provider')
	.option('--verbose', 'optional: Display authprovider with create statements')
	.option('--file [fileName]', 'optional: Name of file to Import/Export auth provider (if not provided stdout used for export)')
	.action(authprovider.doAuthProvider);

program
	.command('datasource <list|create|createDatabase|update|delete|import|reload|export>')
	.description('Administer datasources within a project.')
	.option('--db_name [name]', 'The name of the datasource connection')
	.option('--ident [ident]', 'For delete or reload, the ident of the datasource')
	.option('--prefix [prefix]', 'The prefix of the datasource connection')
	.option('--jndi_name [jndiname]', 'The JNDI name of the datasource connection')
	.option('--dbasetype [dbasetype]', 'The type of the datasource: mysql, oracle, sqlserver, derby, postgresql, db2luw, db2zos, csv, hbase, sap, salesforce, sqlserverazure, teradata')
	.option('--catalog_name [catalog_name]', 'The catalog in the datasource')
	.option('--schema_name [schema_name]', 'The schema in the datasource')
	.option('--user_name [user_name]', 'The name of the datasource user')
	.option('--password [password]', 'The password of the datasource user')
	.option('--schema_editable [boolean]', 'Is this datasource marked as editable (i.e. managed datasource) - default: false')
	.option('--url [url]', 'The JDBC URL for the datasource')
	.option('--active [true|false]', 'This marks the datasource active or inactive')
	.option('--project_ident [ident]', 'The ident of a project, (if other than the current project')
	.option('--managedserver_ident [managedserver_ident]', 'The managed server ident used with command createDatabase (creates both database and datasource)')
	.option('--comments [comment]', 'Comment on datasource')
	.option('--verbose', 'optional: display list of datasources in detailed create format')
	.option('--file [file]', 'optional: for import/export, the name of a file to read from/save to, if unspecified, use stdin/stdout')
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
	.option('--verbose', 'Include export/import script for resource list')
	.option('--file [file]', 'optional: for import/export, the name of a file to read from/save to, if unspecified, use stdin/stdout')
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
	.option('--file [file]', 'optional: for import/export, the name of a file to read from/save to, if unspecified, use stdin/stdout')
	.option('--verbose', 'optional: whether to display list of rules in detailed format that can be used to recreate using command line')
	.action(rule.doRule);


program
	.command('apioptions <list|update|import|export>')
	.description('Administer API project options for an account.')
	.option('--ident [ident]','The ident of the specific project settings object')
	.option('--option_value [value]','This is the value for the specific setting for the ident')
	.option('--project_ident [project_ident]','The project ident that will be marked as used' )
	.option('--file [fileName]', 'optional: Name of file to settings for import/export (if not provided stdout used for export)')
	.action(apioptions.doSettings);


program
	.command('namedsort <list|create|update|delete|import|export>')
	.description('Administer Named Sorts for the active API Project.')
	.option('--ident [ident]', 'The ident of the specific named sort object')
	.option('--sortname [name]', 'The Name of named sort')
	.option('--sort_text [sorttext]', 'Sort Text to define named sort')
	.option('--resource_names [name]', 'optional: Comma seperated list of Resource Names in quotes')
	.option('--comments [comment]', 'optional: Comment on named sort')
	.option('--project_ident [project_ident]', 'optional: The project ident if not the active project')
	.option('--file [fileName]', 'optional: Name of file for import/export (if not provided stdout used for export)')
	.option('--verbose', '{optional)  whether to display list of named sorts in detailed format')
	.action(sorts.doSort);

program
	.command('namedfilter <list|create|delete|update|import|export>')
	.description('Administer Named Filter for the active API Project.')
	.option('--ident [ident]', 'The ident of the specific named filter object')
	.option('--filtername [name]', 'The Name of named filter')
	.option('--filter_text [text]', 'Text to define named filter')
	.option('--resource_names [name]', 'optional: Comma seperated list of Resource Names in quotes')
	.option('--comments [comment]', 'optional: omment on named filter')
	.option('--project_ident [project_ident]', 'optional: The project ident if not the active project')
	.option('--file [fileName]', 'optional: Name of file for import/export (if not provided stdin/stdout used for export)')
	.option('--verbose', 'optional: whether to display list of named filter in detailed format')
	.action(filters.doFilter);

program
	.command('token <list|import|export>')
	.description('Administer Auth Tokens for current project.')
	.option('--project_ident [project_ident]','The project ident that will be marked as used' )
	.option('--file [fileName]', 'optional: Name of file to import/export (if not provided stdin/stdout used for export)')
	.action(token.doToken);

program
	.command('role <list|delete|import|export>')
	.description('Administer Roles for current project.')
	.option('--ident [ident]', 'The ident of the specific role to delete')
	.option('--rolename [name]', 'The nam of the specific role to delete')
	.option('--project_ident [project_ident]','The project ident that will be marked as used' )
	.option('--verbose', 'optional: Display list of roles in detailed export/import format')
	.option('--file [fileName]', 'optional: Name of file to import/export (if not provided stdin/stdout used for export)')
	.action(role.doRole);

program
	.command('user <list|delete|update|import|export>')
	.description('Administer Users for current project.')
	.option('--project_ident [project_ident]','The project ident that will be marked as used' )
	.option('--ident [ident]', 'The ident of the specific user')
	.option('--username [name]', 'The name of the specific user')
	.option('--file [fileName]', 'optional: Name of file to import/export (if not provided stdin/stdout used for export)')
	.option('--password [password]','The password for this user' )
	.option('--fullname [fullname]','User fullname' )
	.option('--name [name]','User name' )
	.option('--status [status]','Status active A or inactive I' )
	.option('--roles [roles]','Comma separated list of role names' )
	.option('--comments [comments]','User comments' )
	.action(user.doUser);


program
	.command('npa <list|delete|export|import>')
	.description('Administer Non Persistent Attributes for the active API Project.')
	.option('--ident [ident]', 'The ident of the specific named sort object')
	.option('--dbschema_ident [ident]', 'optional: The dbschema ident if not the active project')
	.option('--file [fileName]', 'optional: Name of file for import/export (if not provided stdin/stdout used for export)')
	.option('--verbose', 'optional: Display non persistent attribute in import/export format')
	.action(npa.doNPAttr);

program
	.command('topic <list|delete|import|export>')
	.description('Administer Topics for current project.')
	.option('--project_ident [project_ident]','The project ident that will be marked as used' )
	.option('--name [name]', 'Name of the topic')
	.option('--ident [ident]', 'The ident of the specific topic to delete')
	.option('--verbose', 'optional: Display list of topics in an import/export format')
	.option('--file [fileName]', 'optional: Name of file to import/export (if not provided stdin/stdout used for export)')
	.action(topic.doTopic);

program
	.command('event <list|delete|export|import>')
	.description('Administer Request & Response Events for current project.')
	.option('--eventname [name]', 'The request or response Name')
	.option('--ident [ident]', 'The ident of the specific event')
	.option('--project_ident [project_ident]','The project ident that will be used' )
	.option('--verbose', 'optional: Display list of events in detailed export/import format')
	.option('--file [fileName]', 'optional: Name of file to import/export (if not provided stdin/stdout used for export)')
	.action(event.doListener);

program
	.command('handler <list|delete|export|import>')
	.description('Administer Custom Endpoints (Handlers) for current project.')
	.option('--project_ident [project_ident]','The project ident that will be used' )
	.option('--ident [ident]', 'The ident of the specific handler')
	.option('--name [name]', 'The name of the Custom Endpoint')
	.option('--verbose', 'optional: Display Custom Endpoints with import/export statements')
	.option('--file [fileName]', 'optional: Name of file to import/export (if not provided stdin/stdout used for export)')
	.action(handler.doHandler);

program
	.command('apiversion <list|export|import>')
	.description('Administer API Versions for Resources for current project.')
	.option('--project_ident [project_ident]','The project ident that will be used' )
	.option('--file [fileName]', 'optional: Name of file to import/export (if not provided stdin/stdout used for export)')
	.action(apiversion.doVersion);

program
	.command('relationship <list|delete|export|import>')
	.description('Administer Relationships for current project.')
	.option('--ident [ident]', 'This is the ident of the relationship')
	.option('--project_ident [project_ident]','The project ident that will be used' )
	.option('--verbose', 'optional: Display list of relationships in import/export format')
	.option('--file [fileName]', 'optional: Name of file to import/export (if not provided stdin/stdout used for export)')
	.action(reln.doReln);

program
	.command('snapshot <list|start|restore>')
	.description('List or start a project snapshot (backup) for current project.')
	.option('--name [name]', 'The snapshot Name used by both start and restore')
	.option('--project_ident [project_ident]','optional: The project ident that will be used instead of current selected' )
	.action(snapshot.doSnapshot);

program
	.command('gateway <list|create|delete|import|export|publish>')
	.description('Publish Swagger document for current project to CA Gateway.')
	.option('--ident [ident]', 'The ident for the saved gateway definition')
	.option('--name [name]', 'The name for the gateway definition')
	.option('--username [name]', 'The username for the gateway')
	.option('--password [password]','The gateway password.')
	.option('--hostname [server]','The gateway server hostname https://myserver:8443/lacman/1.0/publish' )
	.option('--apiversion [version]','The API version of the swagger document' )
	.option('--url_name [name]','The API url fragment name (use project list)' )
	.option('--verbose', 'optional: display list of datasources in detailed create format')
	.option('--comments [comments]','The gateway definition comments' )
	.option('--file [fileName]', 'optional: Name of file to import/export (if not provided stdin/stdout used)')
	.action(gateway.doGateway);

program
	.command('managedserver <list|create|delete|update|import|export>')
	.description('Administer a managed data server (used by @databases to create datasources).')
	.option('--server_name [name]', 'The name of the datasource connection')
	.option('--ident [ident]', 'For delete or reload, the ident of the managed data server')
	.option('--dbasetype [dbasetype]', 'The type of the managed data server connection, can be mysql, derby, postgres')
	.option('--catalog_name [catalog_name]', 'The catalog in the managed data server')
	.option('--user_name [user_name]', 'The name of the managed data server user')
	.option('--password [password]', 'The password of the managed data server user')
	.option('--url [url]', 'The JDBC URL for the managed data server')
	.option('--comments [comment]', 'This is the comment for this managed data server')
	.option('--active [true|false]', 'This marks the managed data server active or inactive')
	.option('--comments [comment]', 'Comment on datasource')
	.option('--verbose', 'optional: Display list of datasources in detailed create format')
	.option('--file [file]', 'optional:: for import/export, the name of a file to read from/save to, if unspecified, use stdin/stdout')
	.action(managedserver.doDbase);

program
	.command('migrate <exportRepos|extract>')
	.description('Migrate creates a list of user libraries, auth providers, gateways, and projects to a named directory')
	.option('--directory [directory]', 'Required for export, the name of a directory to save all exported json files')
	.option('--file [file]', 'optional:: for source extract, the name of a file to read from/save to, if unspecified, use stdin/stdout')
	.action(migrate.doMigrate);

program
	.command('schema <create>')
	.description('Create new table/columns/relationships using @schema format and managed data server datasource.')
	.option('--project_ident [project_ident]','The project ident that will be marked as used' )
	.option('--prefix [prefix]','The datasource prefix used for export. Note for import, the prefix must be marked as schema isEditable' )
	.option('--ignoredbcolumntype [true|false]','optional: The ignoredbcolumntype setting is used when moving between database vendors' )
	.option('--ignoreprimarykeyname [true|false]','optional: The ignoreprimarykeyname setting is used when moving between database vendors' )
	.option('--ignoreconstraintname [true|false]','optional: The ignoreconstraintname setting is used when moving between database vendors' )
	.option('--skiprelationships [true|false]','optional: If true, relationships will not be created - default: false')
	.option('--skiptablecreation [true|false]','optional: If true, tables will not be created - default: false')
	.option('--file [fileName]', 'optional: Name of file to import/export (if not provided stdin/stdout used)')
	.action(schema.doSchema);

program
	.command('function <list|delete|export|import>')
	.description('Administer Functions for current project.')
	.option('--ident [ident]', 'This is the ident of the function')
	.option('--name [name]', 'Name of the function')
	.option('--project_ident [project_ident]','optional: The project ident that will be used' )
	.option('--verbose', 'optional: display list of functions in detailed create format')
	.option('--file [fileName]', 'optional: Name of file to import/export (if not provided stdin/stdout used for export)')
	.action(fnction.doFunction);

program
	.command('virtualkey <list|create|update|delete|import|export>')
	.description('Manage a virtualkey to a table or view.')
	.option('--table_ident [ident]', 'For delete or update, the ident of the listed table')
	.option('--view_ident [ident]', 'For delete or update, the ident of the listed view')
	.option('--project_ident [project_ident]','The project ident that will be used to list all datasources' )
	.option('--prefix [prefix]','The datasource prefix for this table or view virtual primary key' )
	.option('--table_name [name]','The name of the table to attach a virtual primary key' )
	.option('--view_name [name]','The name of the view to attach a virtual primary key' )
	.option('--keyname [colnamelist]','The comma separated list of column names' )
	.option('--is_autonum [true|false]','If the keyname of a view column that is an autonum - default false' )
	.option('--verbose', 'optional: display list of virtual keys in detailed create format')
	.option('--file [fileName]', 'optional: Name of file to import/export (if not provided stdin/stdout used for export)')
	.action(vkey.doVirtualKey);

program
	.command('sequence <list|create|update|delete|import|export>')
	.description('Manage a database sequence on a key column for a table or view.')
	.option('--table_ident [ident]', 'For delete or update, the ident of the listed table')
	.option('--view_ident [ident]', 'For delete or update, the ident of the listed view')
	.option('--project_ident [project_ident]','The project ident that will be used to list all datasources' )
	.option('--prefix [prefix]','The datasource prefix for this table or view virtual primary key' )
	.option('--table_name [name]','The name of the table to attach a virtual primary key' )
	.option('--view_name [name]','The name of the view to attach a virtual primary key' )
	.option('--keyname [colnamelist]','The comma separated list of column names' )
	.option('--sequence [colnamelist]','The comma separated list of column names' )
	.option('--file [fileName]', 'optional: Name of file to import/export (if not provided stdin/stdout used for export)')
	.action(seq.doSequence);

program
	.command('listener <list|delete|export|import>')
	.description('Administer Listener Events for current project.')
	.option('--listener_name [name]', 'The Listener Name')
	.option('--ident [ident]', 'The ident of the specific listener')
	.option('--project_ident [project_ident]','The project ident that will be used' )
	.option('--verbose', 'optional: Display list of listeners in detailed export/import format')
	.option('--file [fileName]', 'optional: Name of file to import/export (if not provided stdin/stdout used for export)')
	.action(listener.doListener);

program
	.command('provider <list|delete|export|import>')
	.description('Administer Listener Provider definitions. (requires login as "sa")')
	.option('--provider_name [name]', 'The Provider Name')
	.option('--ident [ident]', 'The ident of the specific provider')
	.option('--verbose', 'optional: Display list of providers in detailed export/import format')
	.option('--file [fileName]', 'optional: Name of file to import/export (if not provided stdin/stdout used for export)')
	.action(provider.doProvider);
	
program
	.command('connection <list|delete|export|import|stop|start>')
	.description('Administer Connections for current project.')
	.option('--connection_name [name]', 'The connection name')
	.option('--ident [ident]', 'The ident of the specific connection')
	.option('--project_ident [project_ident]','The project ident that will be used' )
	.option('--verbose', 'optional: Display list of connection in detailed export/import format')
	.option('--file [fileName]', 'optional: Name of file to import/export (if not provided stdin/stdout used for export)')
	.action(connection.doConnection);

program
	.command('timer <list|delete|export|import>')
	.description('Administer Timer definitions.')
	.option('--timer_name [name]', 'The Timer Name')
	.option('--ident [ident]', 'The ident of the specific timer')
	.option('--verbose', 'optional: Display list of timer in detailed export/import format')
	.option('--file [fileName]', 'optional: Name of file to import/export (if not provided stdin/stdout used for export)')
	.action(timer.doTimer);

program
	.command('application <list|delete|import|export>')
	.description('Administer Data Explorer Applications.')
	.option('--ident [ident]', 'The ident of the specific project (see project list)')
	.option('--project_name [name]', 'The name of the project')
	.option('--url_name [name]', 'The name of the project')
	.option('--application_name [name]', 'The name of the application')
	.option('--file [file]', 'optional: for import/export, the name of a file to read from/save to, if unspecified, use stdin/stdout')
	.action(application.doApplication);

program.parse(process.argv);

if (process.argv.length < 3) {
	console.log('You must specify a command'.red);
	program.help();
}
