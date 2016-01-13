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
var dotfile = require('./util/dotfile.js');

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
	.option('--url_name [url_name]', 'The name of the project')
	.option('--status [status]', 'Optional: the status of the project, can be A (for Active) or I for (Inactive)')
	.option('--authprovider [ident]', 'Optional: the ident of the authentication provider for the project')
	.option('--comments [comments]', 'Optional: a description of the project')
	.option('--file [file]', 'Optional: for import/export, the name of a file to read from/save to, if unspecified, use stdin/stdout')
	.option('--verbose', 'Optional: whether to display detailed results, or just a summary')
	.action(project.doProject);

program
	.command('database <list|create|update|delete>')
	.description('Administer databases within a project.')
	.option('--db_name [name]', 'The name of the database connection')
	.option('--prefix [prefix]', 'The prefix of the database connection')
	.option('--dbasetype [dbasetype]', 'The type of the database connection, can be mysql, oracle, sqlserver, nuodb, postgres')
	.option('--catalog_name [catalog_name]', 'The catalog in the database')
	.option('--schema_name [schema_name]', 'The schema in the database')
	.option('--user_name [user_name]', 'The name of the database user')
	.option('--password [password]', 'The password of the database user')
	.option('--url [url]', 'The JDBC URL for the database')
	.option('--project_ident', 'The ident of a project, if other than the current project')
	.action(dbase.doDbase);

program
	.command('resource <list>')
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
	.option('--project_ident', 'The ident of a project, if other than the current project')
	.action(resource.doResource);

program
	.command('rule <list|create|delete>')
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
	.option('--verbose', 'Optional: whether to display list of rules in detailed format that can be used to recreate line by line')
	.action(rule.doRule);

program
	.command('authprovider <list|create|delete|export|import>')
	.description('Administer authentication providers for an account.')
	.option('--ident [ident]','The ident of the auth provider')
	.option('--name [name]', 'Name of auth provider')
	.option('--createFunction [bootstrap]', 'Name for Create Function')
	.option('--paramMap [map]', 'Map of auth provider settings')
	.option('--comments [comment]', 'Comment on auth provider')
	.option('--exportFile [fileName]', 'Name of file to Export auth provider')
	.option('--importFile [fileName]', 'Name of file to Import auth provider')
	.action(authprovider.doAuthProvider);
	 

program.parse(process.argv);

if (process.argv.length < 3) {
	console.log('You must specify a command'.red);
	program.help();
}
