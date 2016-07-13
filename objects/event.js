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
	doEvent: function(action, cmd) {
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
		client.get(url + "/admin:eventhandlers?sysfilter=equal(project_ident:" + projIdent+")&pagesize=100&&sysorder=(name:asc_uc,name:desc)", {
						headers: {
							Authorization: "CALiveAPICreator " + apiKey + ":1",
							"Content-Type" : "application/json"
						}
					}, function(data) {
						if (data.errorMessage) {
							console.log(data.errorMessage.red);
							return;
						}
						printObject.printHeader('Request/Response Events');
						var table = new Table();
						var type = "";
						_.each(data, function(p) {
						type = p.eventtype_ident == 1 ? "Request":"Response";
							table.cell("Ident", p.ident);
							table.cell("Name", p.name);
							table.cell("Type", type);
							table.cell("Active", p.active);
			
							var comments = p.code;
							if ( ! comments) {
								comments = "";
							}
							else if (comments.length > 50){
								comments = comments.replace("\n"," ");
								comments = comments.substring(0, 47) + "...";
							}
				
							table.cell("Code", comments);
							comments = p.description;
							if ( ! comments) {
								comments = "";
							}
							else if (comments.length > 50){
								
								comments = comments.substring(0, 47) + "...";
							}
							comments = comments.replace("\n"," ");
							table.cell("Comments", comments);
							table.newRow();
				});
			table.sort(['Name']);
			console.log(table.toString());
			printObject.printTrailer("# events: " + data.length);
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
		}
		var sep = "";
		var filter = "";
		if (cmd.ident) {
			filter += sep + "sysfilter=equal(ident:" + cmd.ident + ")";
			sep = "&";
		} else if (cmd.eventname) {
			filter += sep + "sysfilter=equal(name:'" + cmd.eventname + "')";
			sep = "&";
		} else if (projIdent) {
			filter += sep + "sysfilter=equal(project_ident:" + projIdent + ")";
		}
		
	
		var toStdout = false;
		if ( ! cmd.file) {
			toStdout = true;
		}
		
		client.get(loginInfo.url + "/admin:eventhandlers?pagesize=1000&"+filter, {
			headers: {
				Authorization: "CALiveAPICreator " + loginInfo.apiKey + ":1",
				"Content-Type" : "application/json"
			}
		}, function(data) {
			//console.log('get result: ' + JSON.stringify(data, null, 2));
			if (data.errorMessage) {
				console.log(("Error: " + data.errorMessage).red);
				return;
			}
			if (data.length === 0) {
				console.log(("No request or response event(s) found").red);
				return;
			}
			for(var idx = 0; idx < data.length ; idx++){
				delete data[idx].ident;
				delete data[idx]['@metadata']
				delete data[idx].project_ident;
			}
			
			if (toStdout) {
				console.log(JSON.stringify(data, null, 2));
			}
			else {
				var exportFile = fs.openSync(cmd.file, 'w+', 0600);
				fs.writeSync(exportFile, JSON.stringify(data, null, 2));
				console.log(('Events have been exported to file: ' + cmd.file).green);
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
		var fileContent  = null;
		var json = null;
		fs.readFile(cmd.file, function read(err,data){
			if(err) {
				console.log("Unable to read file");
				return;
			}
			json = data;
		
			fileContent = JSON.parse(json);
			if(Array.isArray(fileContent) && fileContent.length > 0){
					for(var i = 0 ; i < fileContent.length; i++){
						fileContent[i].project_ident = projIdent;
						delete fileContent[i].ts;
						delete fileContent[i].ident;
						fileContent[i]["@metadata"] = {action:"MERGE_INSERT", key:  ["project_ident","name"]};
					} 
			} else {
				fileContent.project_ident = projIdent;
				delete fileContent.ts;
				fileContent["@metadata"] = {action:"MERGE_INSERT", key: ["project_ident","name"]};
			}
		
		var startTime = new Date();
		client.put(loginInfo.url + "/admin:eventhandlers", {
			data: fileContent,
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
			printObject.printHeader('Event Handler(s) created, including:');
			if(data.statusCode == 200 ){
				console.log("Request took: " + (endTime - startTime) + "ms");
				return;
			} 	
			var newHandler = _.find( data.txsummary, function(p) {
				return p['@metadata'].resource === 'admin:eventhandlers';
			});
			if ( ! newHandler) {
				console.log('ERROR: unable to find imported handler'.red);
				return;
			}
			if (cmd.verbose) {
				_.each(data.txsummary, function(obj) {
					printObject.printObject(obj, obj['@metadata'].entity, 0, obj['@metadata'].verb);
				});
			}
			else {
				printObject.printObject(newHandler, newHandler['@metadata'].entity, 0, newHandler['@metadata'].verb);
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
		});
	  });
	}
};
