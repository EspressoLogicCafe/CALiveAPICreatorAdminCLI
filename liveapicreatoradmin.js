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

//var sequence = require('./objects/sequence.js'); //Oracle
//var apps = require('./objects/applicaitons.js'); //list | export | import
// 2.1 features
var snapshot = require('./objects/snapshot.js');//list | start  | restore --name  
var npa = require('./objects/npattrs.js');// list | create | delete | update | import |export
var gateway = require('./objects/gateway.js');

program
	.version(pkg.version);

program
	.command('login <url>')
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
	.command('project <list|create|update|delete|use|import|export>')
	.description('Administer projects. Actions are: list, create, update, delete, use, export')
	.option('--project_name [name]', 'The name of the project')
	.option('--url_name [name]', 'The name of the project')
	.option('--status [status]', 'Optional: the status of the project, can be A (for Active) or I for (Inactive)')
	.option('--authprovider [ident]', 'Optional: the ident of the authentication provider for the project')
	.option('--comments [comments]', 'Optional: a description of the project')
	.option('--file [file]', 'Optional: for import/export, the name of a file to read from/save to, if unspecified, use stdin/stdout')
	.option('--verbose', 'Optional: whether to display detailed results, or just a summary')
	.action(project.doProject);

program
	.command('datasource <list|create|update|delete|import|reload|export>')
	.description('Administer datasources within a project.')
	.option('--db_name [name]', 'The name of the datasource connection')
	.option('--ident [ident]', 'For delete or reload, the ident of the datasource')
	.option('--prefix [prefix]', 'The prefix of the datasource connection')
	.option('--dbasetype [dbasetype]', 'The type of the datasource connection, can be mysql, oracle, sqlserver,derby, postgres')
	.option('--catalog_name [catalog_name]', 'The catalog in the datasource')
	.option('--schema_name [schema_name]', 'The schema in the datasource')
	.option('--user_name [user_name]', 'The name of the datasource user')
	.option('--password [password]', 'The password of the datasource user')
	.option('--url [url]', 'The JDBC URL for the datasource')
	.option('--active [true|false]', 'This marks the datasource active or inactive')
	.option('--project_ident [ident]', 'The ident of a project, (if other than the current project')
	.option('--file [file]', 'Optional: for import/export, the name of a file to read from/save to, if unspecified, use stdin/stdout')
	.action(dbase.doDbase);

program
	.command('resource <list|create|delete|import|export>')
	.description('Administer resources within a project.')
	.option('--resource_name [name]', 'The name of the resource')
	.option('--type [type]', 'The type of the resource: normal, sql, javascript, storedproc, mongo')
	.option('--prefix [prefix]', 'The prefix of the table')
	.option('--table_name [name]', 'The name of the table')
	.option('--description [description]', 'A description of the resource')
	.option('--is_collection [true|false]', 'Whether the resource is for a single value or more than one')
	.option('--join_condition [join]', 'How to join this resource to its parent resource')
	.option('--container_ident [ident]', 'The ident of the parent resource, if any')
	.option('--attributes [attributes]', 'The columns t oadd to the resource, in the form {colname: alias, colname:alias}, all if not specified')
	.option('--apiversion [apiversion]', 'The name of an API version, if there is more than one')
	.option('--project_ident [ident]', 'The ident of a project, (if other than the current project')
	.option('--file [file]', 'Optional: for import/export, the name of a file to read from/save to, if unspecified, use stdin/stdout')
	.action(resource.doResource);

program
	.command('rule <list|create|update|delete|import|export>')
	.description('Administer rules within a project.')
	.option('--ruletype [type]', 'The type of the rule, can be: sum,formula,validation,parentcopy')
	.option('--entity_name [prefix:table]', 'The table, qualified with a prefix, for the rule')
	.option('--attribute_name [name]', 'The name of the attribute whose value is computed by the rule. Required for sum, count, formula, minimum, maximum.')
	.option('--role_name [name]', 'The role name - required for sum, count, minimum, maximum')
	.option('--clause [clause]', 'The clause - required for sum, count, minimum, maximum')
	.option('--child_attribute [name]', 'The name of the child attribute - required for sum, minimum, maximum')
	.option('--parent_attribute [name]', 'The name of the parent attribute - required for parent copy')
	.option('--expression [code]', 'The code for the rule - required for formula, events and validations')
	.option('--error_message [message]', 'The error mesaage for the rule - required for validations')
	.option('--rule_name [name]', 'Optional: a name for the rule. If not specified, a name will be generated.')
	.option('--comments [comments]', 'Optional: a comment for the rule')
	.option('--active [true|false]', 'Optional: whether the rule should be active, true by default')
	.option('--project_ident', 'The ident of a project, if other than the current project')
	.option('--ident [ident]', 'For delete, the ident of the rule to delete')
	.option('--file [file]', 'Optional: for import/export, the name of a file to read from/save to, if unspecified, use stdin/stdout')
	.option('--verbose', 'Optional: whether to display list of rules in detailed format that can be used to recreate line by line')
	.action(rule.doRule);

program
	.command('authprovider <list|create|linkProject|delete|export|import>')
	.description('Administer authentication providers for an account.')
	.option('--ident [ident]','The ident of the auth provider')
	.option('--project_ident [ident]','The project ident used to link this auth provider')
	.option('--name [name]', 'Name of auth provider')
	.option('--createFunction [bootstrap]', 'Name for Create Function')
	.option('--paramMap [map]', 'Map of auth provider settings')
	.option('--comments [comment]', 'Comment on auth provider')
	.option('--file [fileName]', '[Optional] Name of file to Import/Export auth provider (if not provided stdin/stdout used)')
	.action(authprovider.doAuthProvider);
	
program
	.command('libraries <list|create|update|delete|export|import>')
	.description('Administer java and javascript libraries for an account.')
	.option('--ident [ident]','The ident of the library')
	.option('--project_ident [projectId]','The project ident that this library will be marked as used' )
	.option('--name [name]', 'Name of library')
	.option('--libtype [type]', 'Type of Library javascript ! java')
	.option('--ver [version]', 'Version of Library JS or Java')
	.option('--short_name [shortname]', 'Short Name')
	.option('--docUrl [docurl]', 'Documentation URL')
	.option('--refUrl [refurl]', 'Reference URL')
	.option('--linkProject','Link the imported library to the current project')
	.option('--comments [comment]', 'Comment on Library')
	.option('--file [fileName]', '[Optional] Name of file to import/export library JAR or JS (if not provided stdin/stdout used for export)')
	.action(library.doLibrary);
	 
	 
program
	.command('apioptions <list|update|import|export>')
	.description('Administer API project options for an account.')
	.option('--ident [ident]','The ident of the specific project settings object')
	.option('--option_value [value]','This is the value for the specific setting for the ident')
	.option('--project_ident [project_ident]','The project ident that will be marked as used' )
	.option('--file [fileName]', '[Optional] Name of file to settings for import/export (if not provided stdin/stdout used for export)')
	.action(apioptions.doSettings);


program
	.command('namedsort <list|create|update|delete|import|export>')
	.description('Administer Named Sorts for the active API Project.')
	.option('--ident [ident]', 'The ident of the specific named sort object')
	.option('--sortname [name]', 'The Name of named sort')
	.option('--sort_text [sorttext]', 'Sort Text to define named sort')
	.option('--resource_names [name]', '[Optional] Comma seperated list of Resource Names in quotes')
	.option('--comments [comment]', '[Optional] Comment on named sort')
	.option('--project_ident [project_ident]', '[Optional] The project ident if not the active project')
	.option('--file [fileName]', '[Optional] Name of file for import/export (if not provided stdin/stdout used for export)')
	.option('--verbose', '[Optional]  whether to display list of named sorts in detailed format')
	.action(sorts.doSort);
	
program
	.command('namedfilter <list|create|delete|update|import|export>')
	.description('Administer Named filter for the active API Project.')
	.option('--ident [ident]', 'The ident of the specific named filter object')
	.option('--filtername [name]', 'The Name of named filter')
	.option('--filter_text [text]', 'Text to define named filter')
	.option('--resource_names [name]', '[Optional] Comma seperated list of Resource Names in quotes')
	.option('--comments [comment]', '[Optional] omment on named filter')
	.option('--project_ident [project_ident]', '[Optional] The project ident if not the active project')
	.option('--file [fileName]', '[Optional] Name of file for import/export (if not provided stdin/stdout used for export)')
	.option('--verbose', '[Optional] whether to display list of named filter in detailed format')
	.action(filters.doFilter);

program
	.command('token <list|export|import>')
	.description('Administer Auth Tokens for current project.')
	.option('--project_ident [project_ident]','The project ident that will be marked as used' )
	.option('--file [fileName]', '[Optional] Name of file to import/export (if not provided stdin/stdout used for export)')
	.action(token.doToken);	

program
	.command('role <list|export|import>')
	.description('Administer Roles for current project.')
	.option('--project_ident [project_ident]','The project ident that will be marked as used' )
	.option('--file [fileName]', '[Optional] Name of file to import/export (if not provided stdin/stdout used for export)')
	.action(role.doRole);	
	
program
	.command('user <list|update|export|import>')
	.description('Administer Users for current project.')
	.option('--project_ident [project_ident]','The project ident that will be marked as used' )
	.option('--file [fileName]', '[Optional] Name of file to import/export (if not provided stdin/stdout used for export)')
	.option('--password [password]','The password for this user' )
	.option('--fullname [fullname]','User fullname' )
	.option('--name [name]','User name' )
	.option('--status [status]','Status active A or inactive I' )
	.option('--roles [roles]','Comma separated list of role names' )
	.option('--comments [comments]','User comments' )
	.action(user.doUser);	
	
	
program
	.command('npa <list|create|import|export>')
	.description('Administer Non Persistent Attributes for the active API Project.')
	.option('--ident [ident]', 'The ident of the specific named sort object')
	.option('--dbschema_ident [ident]', '[Optional] The dbschema ident if not the active project')
	.option('--file [fileName]', '[Optional] Name of file for import/export (if not provided stdin/stdout used for export)')
	.option('--verbose', '[Optional]  whether to display list of named sorts in detailed format')
	.action(npa.doNPAttr);
	
program
	.command('topic <list|export|import>')
	.description('Administer Topics for current project.')
	.option('--project_ident [project_ident]','The project ident that will be marked as used' )
	.option('--file [fileName]', '[Optional] Name of file to import/export (if not provided stdin/stdout used for export)')
	.action(topic.doTopic);	
	
program
	.command('event <list|export|import>')
	.description('Administer Request & Response Events for current project.')
	.option('--eventname [name]', 'The request or response Name')
	.option('--project_ident [project_ident]','The project ident that will be used' )
	.option('--file [fileName]', '[Optional] Name of file to import/export (if not provided stdin/stdout used for export)')
	.action(event.doEvent);	
	
program
	.command('handler <list|export|import>')
	.description('Administer Custom Endpoints (Handlers) for current project.')
	.option('--project_ident [project_ident]','The project ident that will be used' )
	.option('--file [fileName]', '[Optional] Name of file to import/export (if not provided stdin/stdout used for export)')
	.action(handler.doHandler);	

program
	.command('apiversion <list|export|import>')
	.description('Administer API Versions for Resources for current project.')
	.option('--project_ident [project_ident]','The project ident that will be used' )
	.option('--file [fileName]', '[Optional] Name of file to import/export (if not provided stdin/stdout used for export)')
	.action(apiversion.doVersion);	
	
program
	.command('relationship <list|export|import>')
	.description('Administer Relationships (Virtual Keys) for current project.')
	.option('--ident [ident]', 'This is the ident of the relationship')
	.option('--project_ident [project_ident]','The project ident that will be used' )
	.option('--file [fileName]', '[Optional] Name of file to import/export (if not provided stdin/stdout used for export)')
	.action(reln.doReln);	

program
	.command('snapshot <list|start|restore>')
	.description('List or start a project snapshot (backup) for current project.')
	.option('--name [name]', 'The snapshot Name used by both start and restore')
	.option('--project_ident [project_ident]','[optional] The project ident that will be used instead of current selected' )
	.action(snapshot.doSnapshot);	

program
	.command('gateway <publish>')
	.description('Publish Swagger document for current project to Gateway.')
	.option('--username [name]', 'The username for the gateway')
	.option('--password [password]','The gateway password.')
	.option('--hostname [server]','The gateway server hostname or IP' )
	.option('--port [port]','[Optional] The port number - default 8443' )
	.option('--version [version]','[Optional] The version - default 1.0' )
	.option('--file [fileName]', '[Optional] Name of file to settings for Swagger doc export')
	.action(gateway.doGateway);	
	
program.parse(process.argv);

if (process.argv.length < 3) {
	console.log('You must specify a command'.red);
	program.help();
}
