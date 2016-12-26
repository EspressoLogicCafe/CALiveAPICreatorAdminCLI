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
	doHandler: function(action, cmd) {
		if (action === 'list') {
			module.exports.list(cmd);
		}
		else if(action === 'delete') {
			module.export.del(cmd);
		}
		else if (action === 'export') {
			module.exports.export(cmd);
		}
		else if (action === 'import') {
			module.exports.import(cmd);
		}
		else {
			console.log('You must specify an action: list or  export');
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
		client.get(url + "/admin:handlers?sysfilter=equal(project_ident:" + projIdent+")&pagesize=100&&sysorder=(name:asc_uc,name:desc)", {
						headers: {
							Authorization: "CALiveAPICreator " + apiKey + ":1",
							"Content-Type" : "application/json"
						}
					}, function(data) {
						if (data.errorMessage) {
							console.log(data.errorMessage.red);
							return;
						}
						printObject.printHeader('Custom Hanlders');
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
								
								comments = comments.substring(0, 47) + "...";
							}
							comments = comments.replace("\n"," ");
							table.cell("URL Pattern",p.url_pattern);
							table.cell("Code", comments);
							table.newRow();
				});
			table.sort(['Name']);
			console.log(table.toString());
			printObject.printHeader("# hanlders: " + data.length);
		});
			
	},
	del: function(cmd) {
		var client = new Client();
		var loginInfo = login.login(cmd);
		if ( ! loginInfo) {
			console.log('You are not currently logged into a CA Live API Creator server.'.red);
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
		var filt = "equal(project_ident:"+projIdent ;
		if (cmd.ident) {
			filt = ",ident:" + cmd.ident + ")";
		} else {
			console.log('Missing parameter: please specify ident'.red);
			return;
		}
		
		client.get(loginInfo.url + "/admin:handlers?sysfilter=" + filt, {
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
				console.log(("Error: no such handler ident").red);
				return;
			}
			if (data.length > 1) {
				console.log(("Error: more than one custom endpoint (handler) for the given condition: " + filter).red);
				return;
			}
			var db = data[0];
			var startTime = new Date();
			client['delete'](db['@metadata'].href + "?checksum=" + db['@metadata'].checksum, {
				headers: {
					Authorization: "CALiveAPICreator " + loginInfo.apiKey + ":1",
					"Content-Type" : "application/json"
				}
			}, function(data2) {
				var endTime = new Date();
				if (data2.errorMessage) {
					console.log(data2.errorMessage.red);
					return;
				}
				printObject.printHeader('Handler was deleted, including the following objects:');
				_.each(data2.txsummary, function(obj) {
					printObject.printObject(obj, obj['@metadata'].entity, 0, obj['@metadata'].verb);
				});
				var trailer = "Request took: " + (endTime - startTime) + "ms";
				trailer += " - # objects touched: ";
				if (data2.txsummary.length == 0) {
					console.log('No data returned'.yellow);
				}
				else {
					trailer += data2.txsummary.length;
				}
				printObject.printHeader(trailer);
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
		
		client.get(loginInfo.url + "/admin:handlers?pagesize=1000&"+filter, {
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
				console.log(("No custom handler(s) found").red);
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
				console.log(('Handlers have been exported to file: ' + cmd.file).green);
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
				for(var i = 0; i < fileContent.length; i++){
					fileContent[i].project_ident = projIdent;
					delete fileContent[i].ts;
					//fileContent[0]["@metadata"] = {action:"MERGE_INSERT", key: "name"} ;
				}
			} else {
				fileContent.project_ident = projIdent;
				delete fileContent.ts;
				//fileContent["@metadata"] = {action:"MERGE_INSERT", key: "name"} ;
			}
		
		var startTime = new Date();
		client.post(loginInfo.url + "/admin:handlers", {
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
			printObject.printHeader('Handler(s) created, including:');
			if(data.statusCode == 200 ){
				console.log("Request took: " + (endTime - startTime) + "ms");
				return;
			} 	
			var newHandler = _.find( data.txsummary, function(p) {
				return p['@metadata'].resource === 'admin:handlers';
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
			printObject.printHeader(trailer);
		});
	  });
	}
};
