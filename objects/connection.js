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
	doConnection: function(action, cmd) {
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
		else if (action === 'stop') {
			module.exports.stop(cmd);
		}
		else if (action === 'start') {
			module.exports.start(cmd);
		}
		else {
			console.log('You must specify an action: list, delete, import, export, stop, or start');
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
		client.get(url + "/admin:connections?sysfilter=equal(project_ident:" + projIdent+")&pagesize=100&&sysorder=(name:asc_uc,name:desc)", {
				headers: {
					Authorization: "CALiveAPICreator " + apiKey + ":1",
					"Content-Type" : "application/json"
				}
			}, function(data) {
				if (data.errorMessage) {
					console.log(data.errorMessage.red);
					return;
				}
				printObject.printHeader('Connections');
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
					table.cell("Active", p.is_active == true);

					var comments = p.connect_code;
					if ( ! comments) {
						comments = "";
					}
					else if (comments.length > 50){
						comments = comments.replace("\n"," ");
						comments = comments.substring(0, 47) + "...";
					}
					table.cell("Connect Code", comments);
					comments = p.disconnect_code;
					if ( ! comments) {
						comments = "";
					}
					else if (comments.length > 50){
						comments = comments.substring(0, 47) + "...";
					}
					comments = comments.replace("\n"," ");
					table.cell("Disconnect Code", comments);
					table.newRow();
					if(cmd.verbose) {
					   verboseDisplay += "\n";
					   verboseDisplay += "lacadmin connection export --connection_name '"+p.name+"' --file  CONNECTION_"+p.name + ".json\n";
					   verboseDisplay += "#lacadmin conneciton import --file  CONNECTION_"+p.name + ".json\n";
				   }
				});
			table.sort(['Name']);
			console.log(table.toString());
			printObject.printTrailer("# connection: " + data.length);
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
			console.log('Missing parameter: please specify ident'.red);
			return;
		}
		
		client.get(loginInfo.url + "/admin:connections?sysfilter=" + filt, {
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
				console.log(("Error: more than one connection for the given condition: " + filter).red);
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
				printObject.printHeader('Connection was deleted, including the following objects:');
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
		} else if (cmd.conection_name) {
			filter += sep + "sysfilter=equal(name:'" + cmd.conection_name + "')";
			sep = "&";
		} 
	 	if (projIdent) {
			filter += sep + "sysfilter=equal(project_ident:" + projIdent + ")";
		}
		var toStdout = false;
		if ( ! cmd.file) {
			toStdout = true;
		}
		client.get(loginInfo.url + "/ConnectionExport?pagesize=1000&"+filter, {
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
				console.log(("No Conneciton(s) found").red);
				return;
			}
			for(var idx = 0; idx < data.length ; idx++){
				delete data[idx].ident;
				delete data[idx]['@metadata']
				delete data[idx].project_ident;
				delete data[idx].ts;
				for(var j =0 ; j < data[idx].ConnectionParameters.length; j++ ) {
					delete data[idx].ConnectionParameters[j].ident;
					delete data[idx].ConnectionParameters[j].connection_ident;
					delete data[idx].ConnectionParameters[j].ts;
					delete data[idx].ConnectionParameters[j]["@metadata"];
				}
			}
			if (toStdout) {
				console.log(JSON.stringify(data, null, 2));
			}
			else {
				var exportFile = fs.openSync(cmd.file, 'w+', 0600);
				fs.writeSync(exportFile, JSON.stringify(data, null, 2));
				console.log(('Connections have been exported to file: ' + cmd.file).green);
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
		   client.put(loginInfo.url + "/ConnectionExport", {
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
			   printObject.printHeader('Connection(s) created, including:');
			   if(data.statusCode == 200 ){
				   console.log("Request took: " + (endTime - startTime) + "ms");
				   return;
			   }
			   var newConnection = _.find( data.txsummary, function(p) {
				   return p['@metadata'].resource === 'ConnectionExport';
			   });
			   if ( ! newConnection) {
			   var newHandler = _.find( data.txsummary, function(p) {
				   return p['@metadata'].resource === 'admin:connections';
			   });
			   if ( ! newHandler) {
				   console.log('ERROR: unable to find imported connections'.red);
				   return;
			   }
			   if (cmd.verbose) {
				   _.each(data.txsummary, function(obj) {
					   printObject.printObject(obj, obj['@metadata'].entity, 0, obj['@metadata'].verb);
				   });
			   }
			   else {
				   printObject.printObject(newConnection, newConnection['@metadata'].entity, 0, newHandler['@metadata'].verb);
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
			};
		});
	  });
	},
	stop: function(cmd) {
		var client = new Client();
		var loginInfo = login.login(cmd);
		if ( ! loginInfo) {
			return;
		}
		var startTime = new Date();
		var projIdent = cmd.project_ident;
		if ( ! projIdent) {
			projIdent = dotfile.getCurrentProject();
			if ( ! projIdent) {
				console.log('There is no current project.'.yellow);
				return;
			}
		}
		var filter = "/" + cmd.ident;
		if(!cmd.ident && !cmd.connection_name) {
			console.log("Connection --ident or --connnection_name is required".red);
			return
		}
		if(cmd.connection_name) {
			filter = "?sysfilter=equal(name:'"+cmd.connection_name+"')";
		}
		client.get(loginInfo.url + "/admin:connections"+ filter, {
			headers: {
				Authorization: "CALiveAPICreator " + loginInfo.apiKey + ":1",
				"Content-Type" : "application/json"
			}
		 }, function(content) {
		 	if (content.errorMessage) {
				console.log(content.errorMessage.red);
				return;
			}
			if(content.length === 0 ){
				console.log("Connection not found using filter "+filter);
				return;
			}
			if(cmd.connection_name) {
			    filter = "/" + content[0].ident;
			 }
			 content[0].is_active = false;
			 client.put(loginInfo.url + "/admin:connections"+ filter, {
				 data: content,
				 headers: {
					 Authorization: "CALiveAPICreator " + loginInfo.apiKey + ":1",
					 "Content-Type" : "application/json"
				 }
			  }, function(data) {
				 //console.log(data);
				 var endTime = new Date();
				 if (data.errorMessage) {
					 console.log(data.errorMessage.red);
					 return;
				 }
				 printObject.printHeader('Connection(s) stopped, including:');
				 if(data.statusCode == 200 ){
					 console.log("Request took: " + (endTime - startTime) + "ms");
					 return;
				 } 	
				 var newConnection = _.find( data.txsummary, function(p) {
					 return p['@metadata'].resource === 'admin:connections';
				 });
				 if ( ! newConnection) {
					 console.log('ERROR: unable to find connections'.red);
					 return;
				 }
				 if (cmd.verbose) {
					 _.each(data.txsummary, function(obj) {
						 printObject.printObject(obj, obj['@metadata'].entity, 0, obj['@metadata'].verb);
					 });
				 }
				 else {
					 printObject.printObject(newConnection, newConnection['@metadata'].entity, 0, newHandler['@metadata'].verb);
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
	},
	start: function(cmd) {
		var client = new Client();
		var client = new Client();
		var loginInfo = login.login(cmd);
		if ( ! loginInfo) {
			return;
		}
		var startTime = new Date();
		var projIdent = cmd.project_ident;
		if ( ! projIdent) {
			projIdent = dotfile.getCurrentProject();
			if ( ! projIdent) {
				console.log('There is no current project.'.yellow);
				return;
			}
		}
		var filter = "/" + cmd.ident;
		if(!cmd.ident && !cmd.connection_name) {
			console.log("Connection --ident or --connnection_name is required".red);
			return
		}
		if(cmd.connection_name) {
			filter = "?sysfilter=equal(name:'"+cmd.connection_name+"')";
		}
		client.get(loginInfo.url + "/admin:connections"+ filter, {
			headers: {
				Authorization: "CALiveAPICreator " + loginInfo.apiKey + ":1",
				"Content-Type" : "application/json"
			}
		 }, function(content) {
		 	if (content.errorMessage) {
				console.log(content.errorMessage.red);
				return;
			}
			if(content.length === 0 ){
				console.log("Connection not found using filter "+filter);
				return;
			 }
			 if(cmd.connection_name) {
			    filter = "/" + content[0].ident;
			 }
			 content[0].is_active = true;
			 client.put(loginInfo.url + "/admin:connections"+ filter, {
				 data: content,
				 headers: {
					 Authorization: "CALiveAPICreator " + loginInfo.apiKey + ":1",
					 "Content-Type" : "application/json"
				 }
			  }, function(data) {
				 //console.log(data);
				 var endTime = new Date();
				 if (data.errorMessage) {
					 console.log(data.errorMessage.red);
					 return;
				 }
				 printObject.printHeader('Connection(s) started, including:');
				 if(data.statusCode == 200 ){
					 console.log("Request took: " + (endTime - startTime) + "ms");
					 return;
				 } 	
				 var newConnection = _.find( data.txsummary, function(p) {
					 return p['@metadata'].resource === 'admin:connections';
				 });
				 if ( ! newConnection) {
					 console.log('ERROR: unable to find connections'.red);
					 return;
				 }
				 if (cmd.verbose) {
					 _.each(data.txsummary, function(obj) {
						 printObject.printObject(obj, obj['@metadata'].entity, 0, obj['@metadata'].verb);
					 });
				 }
				 else {
					 printObject.printObject(newConnection, newConnection['@metadata'].entity, 0, newHandler['@metadata'].verb);
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
