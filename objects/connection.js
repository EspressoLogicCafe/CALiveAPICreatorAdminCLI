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
			//console.log(table.toString());
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
		} else if (cmd.connection_name)  {
		 	filt += ",name:'" + cmd.connection_name + "')";
		} else {
			console.log('Missing parameter: please specify --ident or --connection_name'.red);
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
		} else if (cmd.connection_name) {
			filter += sep + "sysfilter=equal(name:'" + cmd.connection_name + "')";
			sep = "&";
		} 
	 	if (projIdent) {
			filter += sep + "sysfilter=equal(project_ident:" + projIdent + ")";
		}
		var toStdout = false;
		if ( ! cmd.file) {
			toStdout = true;
		}
		//console.log(filter);
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
				delete data[idx].ts;
				delete data[idx]['@metadata']
				delete data[idx].project_ident;
				for(var j =0; j < data[idx].ConnectionParameters.length ; j++) {
					delete data[idx].ConnectionParameters[j].ts;
					delete data[idx].ConnectionParameters[j].ident;
					delete data[idx].ConnectionParameters[j].connection_ident;
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
		var origFileContent = null;
		var json = null;
		fs.readFile(cmd.file, function read(err,data){
			if(err) {
				console.log("Unable to read file");
				return;
			}
			json = data;
		
			fileContent = JSON.parse(json);
			origFileContent = JSON.parse(json);
			//Cleanup the JSON and import as inactive (bug in function that tries to restart)
			if(Array.isArray(fileContent) && fileContent.length > 0){
					for(var i = 0 ; i < fileContent.length; i++){
						fileContent[i].project_ident = projIdent;
						fileContent[i].is_active = false;
						delete fileContent[i].ts;
						delete fileContent[i].ident;
						fileContent[i]["@metadata"] = {action:"MERGE_INSERT", key:  ["project_ident","name"]};
						for(var j =0; j < fileContent[i].ConnectionParameters.length ; j++) {
							delete fileContent[i].ConnectionParameters[j].ts;
							delete fileContent[i].ConnectionParameters[j].ident;
							delete fileContent[i].ConnectionParameters[j].connection_ident;
							delete fileContent[i].ConnectionParameters[j]["@metadata"];
						}
					} 
			} else {
				fileContent.project_ident = projIdent;
				fileContent.is_active = false;
				delete fileContent.ts;
				delete fileContent.ident;
				fileContent["@metadata"] = {action:"MERGE_INSERT", key: ["project_ident","name"]};
			}
		//console.log(JSON.stringify(fileContent,null,2));
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
				  // return;
			   }
			   var newConnection = _.find( data.txsummary, function(p) {
				   return p['@metadata'].resource === 'ConnectionExport';
			   });
			   console.log(">>>newConnection " + JSON.stringify(newConnection));
			   if (newConnection) {
				   if (cmd.verbose) {
					   _.each(data.txsummary, function (obj) {
						   printObject.printObject(obj, obj['@metadata'].entity, 0, obj['@metadata'].verb);
					   });
				   }
				   else {
					   printObject.printObject(newConnection, newConnection['@metadata'].entity, 0, newConnection['@metadata'].verb);
					   console.log(('and ' + (data.txsummary.length - 1) + ' other objects').grey);
				   }
				   var trailer = ">Request took: " + (endTime - startTime) + "ms";
				   trailer += " - # objects touched: ";
				   if (data.txsummary.length === 0) {
					   console.log('No data returned'.yellow);
				   }
				   else {
					   trailer += data.txsummary.length;
				   }

				   //ok - lets try to restart each conneciton
				   fileContent = origFileContent;
				   console.log(">>> " + JSON.stringify(fileContent));
				   var payload = [];
				   var connection = {};
				   if (Array.isArray(fileContent) && fileContent.length > 0) {
					   for (var i = 0; i < fileContent.length; i++) {
						   connection.project_ident = projIdent;
						   if (fileContent[i].is_active) {
						   		console.log("Connection "+fileContent[i].name + " needs activation");
						   		connection.name = fileContent[i].name;
						   		connection.is_active = true;
							   _.each(data.txsummary, function (obj) {
							   		if(obj.name == fileContent[i].name) {
							   			connection.ident = obj.ident;
										connection["@metadata"] = obj["@metadata"];
									}
							   });
							   	payload.push(connection);
						   }
					   }
				   } else {
					   if (fileContent.is_active) {
						   console.log("Connection "+fileContent[i].name + " needs activation");
						   connection.name = fileContent.name;
						   connection.is_active = true;
						   _.each(data.txsummary, function (obj) {
							   if(obj.name == fileContent.name) {
								   connection.ident = obj.ident;
								   connection["@metadata"] = obj["@metadata"];
							   }
						   });
						   payload.push(connection);
					   }
				   }
				   //do we have anything left to process
				   if (payload.length > 0) {
					   //console.log("Payload "+JSON.stringify(payload));
					   client.put(loginInfo.url + "/ConnectionExport", {
						   data: payload,
						   headers: {
							   Authorization: "CALiveAPICreator " + loginInfo.apiKey + ":1",
							   "Content-Type": "application/json"
						   }
					   }, function (data2) {
						   //console.log(data2);
						   if (data2.errorMessage) {
							   console.log(data2.errorMessage.red);
							   return;
						   }
						   //console.log('Connection(s) activated: ' + JSON.stringify(data2));
						   if (data2.statusCode == 200) {
							   _.each(data2.txsummary, function (obj) {
								   console.log("Connection activated "+ obj.name);
							   });
						   }
					   });
				   }
				   printObject.printTrailer(trailer);
			   } //new connection response
		}); //first client put
	  }); //readfile
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
			 filter = "projectIdent="+projIdent
					+"&providerIdent="+content[0].provider_ident
					+"&connectionIdent=" + content[0].ident;
			 if(!content[0].is_active) {
			 	//content[0].is_active = true;
			 	console.log(("Conneciton "+content[0].name +" is not active and cannot be started").red);
			 	return;
			 }
		 	 //console.log(filter);
			 client.get(loginInfo.url + "/reconnectConnection?"+ filter, {
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
				 console.log("connection start: " + data);
				 if ( ! data) {
					 console.log('ERROR: unable to start connections'.red);
					 return;
				 }
				 var trailer = "Request took: " + (endTime - startTime) + "ms";
				 trailer += " - # objects touched: ";
				 if (data.length === 0) {
					 console.log('No data returned'.yellow);
				 }
				 else {
					 trailer += data;
				 }
				 printObject.printTrailer(trailer);
			 });
	    });
	}
};
