var Client = require('node-rest-client').Client;
var colors = require('colors');
var _ = require('underscore');
var fs = require('fs');
var CLITable = require('cli-table');
var Table = require('easy-table');
var context = require('./context.js');
var login = require('../util/login.js');
var printObject = require('../util/printObject.js');
var dotfile = require('../util/dotfile.js');

module.exports = {
	doSettings: function(action, cmd) {
		if (action === 'list') {
			module.exports.list(cmd);
		}
		else if (action === 'update') {
			module.exports.update(cmd);
		}
		else if (action === 'import') {
			module.exports.import(cmd);
		}
		else if (action === 'export') {
			module.exports.export(cmd);
		}
		else {
			console.log('You must specify an action: list, update, import, or export');
			//program.help();
		}
	},
	
	list: function(cmd) {
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
		client.get(url + "/ProjectOptions?sysfilter=equal(project_ident:" + projIdent +")&pagesize=100", {
			headers: {
				Authorization: "CALiveAPICreator " + apiKey + ":1",
				"Content-Type" : "application/json"
			}
		}, function(data) {
			if (data.errorMessage) {
				console.log(data.errorMessage.red);
				return;
			}
			printObject.printHeader('API Project Option Settings');
			var table = new Table();
			_.each(data, function(p) {
				table.cell("Ident", p.ident);
				table.cell("Project", p.project_ident);
				table.cell("Name", p.ProjectOptionTypes.name);
				table.cell("Value", p.option_value);
				
				var comments = p.ProjectOptionTypes.description;
				if ( ! comments) {
					comments = "";
				}
				else if (comments.length > 50){
					comments = comments.substring(0, 47) + "...";
				}
				//table.cell("Comments", comments);
				table.newRow();
			});
			table.sort(['Name']);
			console.log(table.toString());
			printObject.printHeader("# settings: " + data.length);
		});
	},
		
	update: function(cmd) {
		var client = new Client();
		var loginInfo = login.login(cmd);
		if ( ! loginInfo)
			return;

		if ( ! cmd.ident) {
			console.log('Missing parameter: ident'.red);
			return;
		}
		var apiKey = loginInfo.apiKey;
		if ( ! apiKey){
			console.log(("Error: Login apiKey is missing or empty").red);
			return;
		}
		var filter = null;
		if (cmd.ident) {
			filter = "equal(ident:" + cmd.ident + ")";
		} else {
			console.log('There is no setting ident.'.yellow);
			eturn;
		}
		var projIdent = cmd.project_ident;
		if ( ! projIdent) {
			projIdent = dotfile.getCurrentProject();
			if ( ! projIdent) {
				console.log('There is no current project.'.yellow);
				return;
			}
			filter += "&sysfilter=equal(project_ident:" + projIdent + ")";
		}	
		
		client.get(loginInfo.url + "/ProjectOptions?sysfilter=" + filter, {
			headers: {
				Authorization: "CALiveAPICreator " + apiKey + ":1",
				"Content-Type" : "application/json"
			}
		}, function(data) {
			//console.log('get result: ' + JSON.stringify(data, null, 2));
			if (data.errorMessage) {
				console.log(("Error: " + data.errorMessage).red);
				return;
			}
			
			if (data.length === 0) {
				console.log(("Error: no such project setting ").red);
				return;
			}
			if (data.length > 1) {
				console.log(("Error: more than one project setting for the given condition: " + filter).red);
				return;
			}
			var setting = data[0];
			if (cmd.option_value) {
				setting.option_value = cmd.option_value;
			}
			if (cmd.project_ident) {
				setting.project_ident = cmd.project_ident;
			}
			var startTime = new Date();
			client.put(setting['@metadata'].href, {
				data: setting,
				headers: {
					Authorization: "CALiveAPICreator " + loginInfo.apiKey + ":1",
					"Content-Type" : "application/json"
				}
			}, function(data) {
				var endTime = new Date();
				if (data.errorMessage) {
					console.log(data.errorMessage.red);
					return;
				}
				printObject.printHeader('Project setting was updated, including the following objects:');
				_.each(data.txsummary, function(obj) {
					printObject.printObject(obj, obj['@metadata'].entity, 0, obj['@metadata'].verb);
				});
				var trailer = "Request took: " + (endTime - startTime) + "ms";
				trailer += " - # objects touched: ";
				if (data.txsummary.length == 0) {
					console.log('No data returned'.yellow);
				}
				else {
					trailer += data.txsummary.length;
				}
				printObject.printTrailer(trailer);
			});
		});
	},
	
	import: function(cmd) {
		var client = new Client();
		var loginInfo = login.login(cmd);
		if ( ! loginInfo)
			return;
		var url = loginInfo.url;
		var apiKey = loginInfo.apiKey;
		
		if ( ! cmd.file) {
			cmd.file = '/dev/stdin';
		}
		
		var projIdent = cmd.project_ident;
		if ( ! projIdent) {
			projIdent = dotfile.getCurrentProject();
			if ( ! projIdent) {
				console.log('There is no current project.'.yellow);
				return;
			}
		}
		context.getContext(cmd, function() {
			var fileContent = JSON.parse(fs.readFileSync(cmd.file));
			var row = null;
			for(var i = 0 ; i < fileContent.length ; i++ ){
				delete fileContent[i].ProjectOptionTypes;
				delete fileContent[i].ts;
				fileContent[i].project_ident = projIdent;
				fileContent[i]["@metadata"] = {action:"MERGE_INSERT", key: ["projectoptiontype_ident","project_ident"]} ;

			row = fileContent[i];
			var startTime = new Date();
			client.put(loginInfo.url + "/ProjectOptions", {
				data: row,
				headers: {
					 Authorization: "CALiveAPICreator " + loginInfo.apiKey + ":1",
					"Content-Type" : "application/json"
				}
				}, function(data) {
				var endTime = new Date();
				if (data.errorMessage) {
					console.log(data.errorMessage.red);
					return;
				}
				printObject.printHeader('Logic project settings was created, including:');
				if(data.statusCode == 200 ){
					console.log("Request took: " + (endTime - startTime) + "ms");
					return;
				} 
				var newSettings = _.find(data.txsummary, function(p) {
					return p['@metadata'].resource === 'ProjectOptions';
				});
				if ( ! newSettings) {
					console.log('INFO: no change to find imported project settings'.yellow);
					return;
				}
				if (cmd.verbose) {
					_.each(data.txsummary, function(obj) {
						printObject.printObject(obj, obj['@metadata'].entity, 0, obj['@metadata'].verb);
					});
				}
				else {
					printObject.printObject(newSettings, newSettings['@metadata'].entity, 0, newSettings['@metadata'].verb);
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
				printObject.printTrailer(trailer);
			})
			}
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
			filter = "equal(project_ident:" + projIdent + ")";
		} else {
			console.log('Missing parameter: please specify project settings (use list) project_ident '.red);
			return;
		}
		if(cmd.ident){
			filter += "&sysfilter=equal(ident:" + cmd.ident + ")";
		}
		var toStdout = false;
		if ( ! cmd.file) {
			toStdout = true;
		}
		//console.log(filter);
		client.get(loginInfo.url + "/ProjectOptions?sysfilter=" + filter +"&pagesize=100", {
			headers: {
				Authorization: "CALiveAPICreator " + loginInfo.apiKey + ":1",
				"Content-Type" : "application/json"
			}
		}, function(data) {
			if (data.errorMessage) {
				console.log(("Error: " + data.errorMessage).red);
				return;
			}
			if (data.length === 0) {
				console.log(("Error: no such project").red);
				return;
			}
			for(var i = 0; i < data.length ; i++){
			      delete data[i].ident;
			      delete data[i].project_ident;
			      delete data[i]['@metadata'];
			      delete data[i].ProjectOptionTypes['@metadata'];
			}
			if (toStdout) {
				console.log(JSON.stringify(data, null, 2));
				var libcode = data[0].code;
				//console.log("libcode "+new Buffer(libcode.value.toString(), 'base64').toString('ascii'));
			} else {
				var exportFile = fs.openSync(cmd.file, 'w+', 0600);
				fs.writeSync(exportFile, JSON.stringify(data, null, 2));
				console.log(('API Project settings has been exported to file: ' + cmd.file).green);
			}
		});	
			
	}
}