var Client = require('node-rest-client').Client;
var colors = require('colors');
var _ = require('underscore');
var Table = require('easy-table');
var fs = require('fs');
var context = require('./context.js');
var login = require('../util/login.js');
var printObject = require('../util/printObject.js');
var dotfile = require('../util/dotfile.js');

module.exports = {
	doToken: function(action, cmd) {
		if (action === 'list') {
			module.exports.list(cmd);
		}
		else if (action === 'export') {
			module.exports.export(cmd);
		}
		else if (action === 'import') {
			module.exports.import(cmd);
		}
		else {
			console.log('You must specify an action: list, import, or  export');
			//program.help();
		}
	},
	
	list: function (cmd) {
		var client = new Client();
		
		var loginInfo = login.login(cmd);
		if ( ! loginInfo)
			return;
		var url = loginInfo.url;
		var apiKey = loginInfo.apiKey;
		
		var projIdent = cmd.project_ident;
		if ( ! projIdent) {
			projIdent = dotfile.getCurrentProject();
			if ( ! projIdent) {
				console.log('There is no current project.'.yellow);
				return;
			}
		}
		client.get(url + "/admin:roles?sysfilter=equal(project_ident:" + projIdent+")&pagesize=100", {
						headers: {
							Authorization: "CALiveAPICreator " + apiKey + ":1"
						}
					}, function(roles) {
						if (roles.errorMessage) {
							console.log(roles.errorMessage.red);
							return;
						}
						
					var table = new Table();
					client.get(url + "/AllApiKeys?pagesize=1000&sysfilter=equal(project_ident:" + projIdent+")&sysfilter=equal(origin:null)", {
						headers: {
							Authorization: "CALiveAPICreator " + apiKey + ":1"
						}
					}, function(data) {
						if (data.errorMessage) {
							console.log(data.errorMessage.red);
							return;
						}
						printObject.printHeader('Auth Tokens');
						
						_.each(data, function(p) {
							table.cell("Ident", p.ident);
							table.cell("Name", p.name);
							table.cell("APKey", p.apikey);
							table.cell("Active", p.status);
							var comments = p.description;
							if ( ! comments) {
								comments = "";
							}
							else if (comments.length > 50){
								comments = comments.substring(0, 47) + "...";
							}
				
							var roles = "";
							var sep = "";
						//calling roles here does not hold the roles
						//console.log(Array.isArray(roles) && roles.length > 0);
						//if(roles !== null && Array.isArray(roles)) {
							_.each(p.ApiKeyRoles, function(r) {
							//console.log(r.apikey_ident);
							//console.log(roles.length);
								//for(var i = 0; i < roles.length ; i++ ){
								//console.log(roles[i].ident);
									//if(roles[i].ident == r.apikey_ident){
										roles +=  sep + r.ident; //r.name
										sep = ",";
									//}
								//}
							});
						//}
				table.cell("Roles" , roles);
				table.cell("Description", comments);
				table.newRow();
			});
			table.sort(['Name', 'name']);
			if (data.length === 0) {
				console.log('There are no auth tokens defined for this project'.yellow);
			}
			else {
				console.log(table.toString());
			}
			
			printObject.printHeader("# auth tokens: " + data.length);
			});
		});
	},
	export: function(cmd) {
		var client = new Client();
		
		var loginInfo = login.login(cmd);
		if ( ! loginInfo)
			return;
		var url = loginInfo.url;
		var apiKey = loginInfo.apiKey;
		var projIdent = cmd.project_ident;
		if ( ! projIdent) {
			projIdent = dotfile.getCurrentProject();
			if ( ! projIdent) {
				console.log('There is no current project.'.yellow);
				return;
			}
		}
		
		var filter = null;
		if (projIdent) {
			filter = "sysfilter=equal(project_ident:" + projIdent + ")";
		} else {
			console.log('Missing parameter: please specify project settings (use list) project_ident '.red);
			return;
		}
		
	
		var toStdout = false;
		if ( ! cmd.file) {
			toStdout = true;
		}
		
		client.get(loginInfo.url + "/AllApiKeys?pagesize=1000&"+filter+"&sysfilter=equal(origin:null)", {
			headers: {
				Authorization: "CALiveAPICreator " + loginInfo.apiKey + ":1"
			}
		}, function(data) {
			//console.log('get result: ' + JSON.stringify(data, null, 2));
			if (data.errorMessage) {
				console.log(("Error: " + data.errorMessage).red);
				return;
			}
			if (data.length === 0) {
				console.log(("Error: no such project").red);
				return;
			}
			for(var idx = 0; idx < data.length ; idx++){
				delete data[idx].ident;
				delete data[idx]['@metadata']
			}
			
			if (toStdout) {
				console.log(JSON.stringify(data, null, 2));
			}
			else {
				var exportFile = fs.openSync(cmd.file, 'w+', 0600);
				fs.writeSync(exportFile, JSON.stringify(data, null, 2));
				console.log(('Auth Tokens have been exported to file: ' + cmd.file).green);
			}
		});
	},
	
	import: function(cmd) {
		var client = new Client();
		var loginInfo = login.login(cmd);
		if ( ! loginInfo) {
			return;
		}

		var projIdent = cmd.project_ident;
		if ( ! projIdent) {
			projIdent = dotfile.getCurrentProject();
			if ( ! projIdent) {
				console.log('There is no current project.'.yellow);
				return;
			}
		}
		if ( ! cmd.file) {
			cmd.file = '/dev/stdin';
		}
		
		var fileContent = JSON.parse(fs.readFileSync(cmd.file));
		if(Array.isArray(fileContent) && fileContent.length > 0){
			for(var i = 0 ; i < fileContent.length ; i++ ){
				fileContent[i].project_ident = projIdent;
				delete fileContent[i].ts;
				fileContent[i]["@metadata"] = {action:"MERGE_INSERT", key: ["name","project_ident"]} ;
			}
		} else {
			fileContent.project_ident = projIdent;
			delete fileContent.ts;
			fileContent["@metadata"] = {action:"MERGE_INSERT", key: ["project_ident","name"]} ;
		}
		
		var startTime = new Date();
		client.put(loginInfo.url + "/AllApiKeys", {
			data: fileContent,
			headers: {
				Authorization: "CALiveAPICreator " + loginInfo.apiKey + ":1"
			}
		}, function(data) {
		
			var endTime = new Date();
			if (data.errorMessage) {
				console.log(data.errorMessage.red);
				return;
			}
			printObject.printHeader('Authentication Token(s) created, including:');
			if(data.statusCode == 200 ){
				console.log("Request took: " + (endTime - startTime) + "ms");
				return;
			} 	
			var newTokens = _.find( data.txsummary, function(p) {
				return p['@metadata'].resource === 'AllApiKeys';
			});
			if ( ! newTokens) {
				console.log('ERROR: unable to find imported auth tokens'.red);
				return;
			}
			if (cmd.verbose) {
				_.each(data.txsummary, function(obj) {
					printObject.printObject(obj, obj['@metadata'].entity, 0, obj['@metadata'].verb);
				});
			}
			else {
				printObject.printObject(newTokens, newTokens['@metadata'].entity, 0, newTokens['@metadata'].verb);
				console.log(('and ' + (data.txsummary.length - 1) + ' other objects').grey);
			}
			
			var trailer = "Request took: " + (endTime - startTime) + "ms";
			trailer += " - # objects touched: ";
			if (data.txsummary.length === 0) {
				console.log('No data returned'.yellow);
			}
			else {
				trailer += data.txsummary.length;
			}
			printObject.printHeader(trailer);
		});
	}
};
