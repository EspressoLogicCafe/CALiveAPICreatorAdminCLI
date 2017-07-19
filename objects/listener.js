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
	doListener: function(action, cmd) {
		if (action === 'list') {
			module.exports.list(cmd);
		}
		else if (action === 'delete') {
			module.exports.del(cmd);
		}
		else if (action === 'export') {
			module.exports.export(cmd);
		}
		else if (action === 'import') {
			module.exports.import(cmd);
		}
		else {
			console.log('You must specify an action: list, delete, import, or  export');
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
		client.get(url + "/admin:listeners?sysfilter=equal(project_ident:" + projIdent+")&pagesize=100&&sysorder=(name:asc_uc,name:desc)", {
						headers: {
							Authorization: "CALiveAPICreator " + apiKey + ":1",
							"Content-Type" : "application/json"
						}
					}, function(data) {
						if (data.errorMessage) {
							console.log(data.errorMessage.red);
							return;
						}
						printObject.printHeader('Listeners');
						var table = new Table();
						var type = "";
						var verboseDisplay = "";
						_.each(data, function(p) {
						   if(p.provider_ident == 1) {
							   type =  "Startup";
						   } 
						   if( p.provider_ident == 2) {
							   type = "Shutdown";
						   } 
						   if ( p.provider_ident == 3) {
							   type = "MQTT";
						   } 
						   if ( p.provider_ident == 4) {
							   type = "Kafka";
						   } 
						   if ( p.provider_ident > 4) {
							   type = "Other";
						   }
							table.cell("Ident", p.ident);
							table.cell("Name", p.name);
							table.cell("Type", type);
							table.cell("Logging Level", p.logging_level);
							table.cell("Active", p.active == true);
			
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
							table.cell("Description", comments);
							table.newRow();
							if(cmd.verbose) {
							   verboseDisplay += "\n";
							   verboseDisplay += "lacadmin listeners export --listener_name '"+p.name+"' --file  LISTENERS_"+p.name + ".json\n";
							   verboseDisplay += "#lacadmin listeners import --file  LISTENERS_"+p.name + ".json\n";
						   }
				});
			table.sort(['Name']);
			console.log(table.toString());
			printObject.printTrailer("# listeners: " + data.length);
			if(cmd.verbose) {
				console.log(verboseDisplay); 
			}
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
			filt += ",ident:" + cmd.ident + ")";
		} else {
			if(cmd.listener_name) {
				filt += ",name:"+ cmd.listener_name + ")";
			} else {
				console.log('Missing parameter: please specify listener_name or ident'.red);
				return;
			}
		}
		
		client.get(loginInfo.url + "/admin:listeners?sysfilter=" + filt, {
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
				console.log(("Error: no such listener ident").red);
				return;
			}
			if (data.length > 1) {
				console.log(("Error: more than one listener for the given condition: " + filter).red);
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
				printObject.printHeader('Listener was deleted, including the following objects:');
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
		} else if (cmd.listener_name) {
			filter += sep + "sysfilter=equal(name:'" + cmd.listener_name + "')";
			sep = "&";
		} 
	 	if (projIdent) {
			filter += sep + "sysfilter=equal(project_ident:" + projIdent + ")";
		}
		
		var toStdout = false;
		if ( ! cmd.file) {
			toStdout = true;
		}
		
		client.get(loginInfo.url + "/admin:listeners?pagesize=1000&"+filter, {
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
				console.log(("No listener(s) found").red);
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
				console.log(('Listeners have been exported to file: ' + cmd.file).green);
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
		client.put(loginInfo.url + "/admin:listeners", {
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
			printObject.printHeader('Listener(s) created, including:');
			if(data.statusCode == 200 ){
				console.log("Request took: " + (endTime - startTime) + "ms");
				return;
			} 	
			var newHandler = _.find( data.txsummary, function(p) {
				return p['@metadata'].resource === 'admin:listeners';
			});
			if ( ! newHandler) {
				console.log('ERROR: unable to find imported listeners'.red);
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
