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
	doVirtualKey: function(action, cmd) {
		if (action === 'list') {
			module.exports.list(cmd);
		}
		else if (action === 'create') {
			module.exports.create(cmd);
		}
		else if (action === 'update') {
			module.exports.update(cmd);
		}
		else if (action === 'delete') {
			module.exports.del(cmd);
		}
		else if (action === 'import') {
			module.exports.import(cmd);
		}
		else if (action === 'export') {
			module.exports.export(cmd);
		}
		else {
			console.log('You must specify an action: list, create, update, delete, import, or  export');
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

		client.get(url + "/AllEntityInfos?sysfilter=equal(project_ident:" + projIdent+")", {
			headers: {
				Authorization: "CALiveAPICreator " + apiKey + ":1",
				"Content-Type" : "application/json"
			}
		}, function(data) {
			if (data.errorMessage) {
				console.log(data.errorMessage.red);
				return;
			}
			printObject.printHeader('Virtual Primary Key');
			var table = new Table();
			var verboseDisplay = "";
			_.each(data, function(p) {
				//console.log(JSON.stringify(p.TableInfos));
				//console.log(JSON.stringify(p.ViewInfos));
				//table.cell("Ident", p.ident);
				var prefix = p.prefix;
				var active = p.active;
				if(cmd.verbose) {
					   verboseDisplay +=  "\n";
					   verboseDisplay += "lacadmin virtualkey create ";
				}
				_.each(p.ViewInfos, function(q) {
					table.cell("view_ident",q.ident);
					table.cell("view_name",q.view_name);
					table.cell("prefix", prefix);
					table.cell("active", active);
					table.cell("key name",q.primary_key_definition);
					table.cell("autonums",q.autonums);
					table.newRow();
					verboseDisplay += " --view_name " + q.view.name;
					verboseDisplay += " --keyname "+ q.primary_key_definition;
					verboseDisplay += " --prefix "+ prefix;
					verboseDisplay += " --active "+ active;
					verboseDisplay += " --is_autonum "+ q.autonums;
					verboseDisplay += " --active "+ q.active;
				});
				table.newRow();
				table.cell("prefix", prefix);
				table.cell("Active", active);
				_.each(p.TableInfos, function(q) {
					table.cell("table_ident",q.ident);
					table.cell("table_name",q.table_name);
					table.cell("key name",q.primary_key_definition);
					table.cell("prefix", prefix);
					table.cell("autonums",q.autonums);
					table.newRow();
					if(cmd.verbose) { 
					   verboseDisplay += " --table_name " + q.table_name;
					   verboseDisplay += " --prefix "+ prefix;
					   verboseDisplay += " --active "+ active;
					   verboseDisplay += " --keyname '"+ q.primary_key_definition + "'";
					   if( p.comments ) {
						   verboseDisplay +=  " --comments \""+ comments +"\"";
					   }
					   verboseDisplay +=  "\n";
				   }
				});
			});
			table.sort(['View Name', 'Name']);
			if (data.length === 0) {
				console.log('There is no virtual primary keys defined for this project'.yellow);
			}
			else {
				console.log(table.toString());
			}
			printObject.printHeader("# view_infos: " + data.length);
			if(cmd.verbose) {
				console.log(verboseDisplay);
			}
		});
	},
	create: function(cmd) {
		var client = new Client();
		var loginInfo = login.login(cmd);
		if ( ! loginInfo) {
			console.log('You are not currently logged into any API Creator server.'.red);
			return;
		}
		if ( ! loginInfo)
			return;
		
		var curProj = cmd.project_ident;
		if ( ! curProj) {
			curProj = dotfile.getCurrentProject();
		}
		if ( ! curProj) {
			console.log('There is no current project.'.yellow);
			return;
		}
		
		if ( ! cmd.prefix) {
			console.log('Missing parameter: --prefix)'.red);
			return;
		}
		if ( ! cmd.keyname) {
			console.log('Missing parameter: --keyname)'.red);
			return;
		}
		if ( ! cmd.table_name && ! cmd.view_name) {
			console.log('Missing parameter: --table_name or --view_name)'.red);
			return;
		}
		var url = "/admin:view_infos";
		var json = {};
		json.primary_key_definition = cmd.keyname;
		json.dbaseschema_ident = 0; //TODO - use prefix to get AllEntityInfos?sysfilter=equal(project_ident:ident,prefix:'demo')
		if(cmd.table_name){
			url = "/admin:table_infos";
			json.table_name = cmd.table_name;
		} else {
			json.view_name = cmd.view_name;
			if(cmd.is_autonum){
				json.autonum_columns = cmd.keyname;
			}
		}
		var startTime = new Date();
		var filter = "equal(project_ident:"+curProj+",prefix:'"+cmd.prefix+"')";
		client.get(loginInfo.url + "/DbSchemas?sysfilter=" + filter, {
			headers: {
				Authorization: "CALiveAPICreator " + loginInfo.apiKey + ":1",
				"Content-Type" : "application/json"
			}
		}, function(data) {
			//console.log(data);
			if (data.errorMessage) {
				//console.log(data);
				console.log(("Error: " + data.errorMessage).red);
				return;
			}
			if (data.length === 0) {
				console.log(("Virtual key not found").red);
				return;
			}
			if (data.length > 1) {
				console.log(("Error: more than one datasource for the given condition: " + filter).red);
				return;
			}
			var db = data[0];
			json.dbaseschema_ident = db.ident;
		    client.post(loginInfo.url +  url , {
				   data: json,
				   headers: {
					   Authorization: "CALiveAPICreator " + loginInfo.apiKey + ":1",
					   "Content-Type" : "application/json"
				   }
			   }, function(data) {
				   if (data.errorMessage) {
					   console.log("@database error: "+data.errorMessage.red);
					   return;
				   }
					 var endTime = new Date();
					  printObject.printHeader('Virtual Primary Key was created');
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
	update: function(cmd) {
		var client = new Client();
		var loginInfo = login.login(cmd);
		if ( ! loginInfo) {
			console.log('You are not currently logged into any API Creator server.'.red);
			return;
		}
		var vkeyurl = "admin:view_infos";
		var filter = "";
		var projIdent = cmd.project_ident;
		if ( ! projIdent) {
			projIdent = dotfile.getCurrentProject();
			if ( ! projIdent) {
				console.log('There is no current project.'.yellow);
				return;
			}
		}

		if ( ! cmd.view_ident && ! cmd.table_ident) {
			console.log('Missing parameter: --view_ident or --table_ident)'.red);
			return;
		}
		if(cmd.view_ident){
			filter += "&sysfilter=equal(ident: "+ cmd.view_ident +")" ;
		} 
		if(cmd.table_ident){
			 vkeyurl = "admin:table_infos";
			 filter += "&sysfilter=equal(ident: "+ cmd.table_ident +")" ;
		}
		
		client.get(loginInfo.url + "/"+ vkeyurl +"?sysfilter=" + filter, {
			headers: {
				Authorization: "CALiveAPICreator " + loginInfo.apiKey + ":1",
				"Content-Type" : "application/json"
			}
		}, function(data) {
			//console.log(data);
			if (data.errorMessage) {
				//console.log(data);
				console.log(("Error: " + data.errorMessage).red);
				return;
			}
			if (data.length === 0) {
				console.log(("Error: no such virtual key table/view").red);
				return;
			}
			if (data.length > 1) {
				console.log(("Error: more than one row returned for the given condition: " + filter).red);
				return;
			}
			var vkey = data[0];
			
			if( cmd.table_name) {
				vkey.table_name = cmd.table_name;
			}
			if( cmd.keyname ){
			 	vkey.primary_key_definition = cmd.keyname;
			}
			if( cmd.view_name ){
			 	vkey.view_name = cmd.view_name;
			}
			if( cmd.is_autonum ){
			 	vkey.autonum_columns = vkey.keyname;
			}
			var startTime = new Date();
			client.put(vkey['@metadata'].href, {
				data: vkey,
				headers: {
					Authorization: "CALiveAPICreator " + loginInfo.apiKey + ":1",
					"Content-Type" : "application/json"
				}
			}, function(data2) {
				var endTime = new Date();
				//console.log(JSON.stringify(data2,null,2));
				if (data2.errorMessage) {
					console.log(data2.errorMessage.red);
					return;
				}
				printObject.printHeader('Database connection was updated, including the following objects:');
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
				printObject.printTrailer(trailer);
			});
		});
	},
	del : function(cmd) {
		var client = new Client();
		var loginInfo = login.login(cmd);
		if ( ! loginInfo) {
			console.log('You are not currently logged into any API Creator server.'.red);
			return;
		}

		var filter = null;
		
		if (cmd.view_ident) {
			filter = "/view_infos?sysfilter=equal(ident:" + cmd.view_ident + ")";
		}
		if (cmd.table_ident) {
			filter = "/table_infos?sysfilter=equal(ident:" + cmd.ident + ")";
		}
		if(!filter) {
			console.log('Missing parameter: please specify either --table_ident, --view_ident '.red);
			return;
		}
		client.get(loginInfo.url + filter, {
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
				console.log(("Virtual key(s) not found").red);
				return;
			}
			if (data.length > 1) {
				console.log(("Error: more than one virtual key for the given condition: " + filter).red);
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
				printObject.printHeader('Virtual Key definiton was deleted, including the following objects:');
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
				printObject.printTrailer(trailer);
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
			console.log('No current Project found - please specify project settings (use list) project_ident '.red);
			return;
		}
		if (cmd.prefix) {
			filter += "&sysfilter=equal(prefix:'" + cmd.prefix + "')";
		} 
		var toStdout = false;
		if ( ! cmd.file) {
			toStdout = true;
		}
		
		client.get(loginInfo.url + "/AllEntityInfos?" + filter, {
			headers: {
				Authorization: "CALiveAPICreator " + loginInfo.apiKey + ":1",
				"Content-Type" : "application/json"
			}
		}, function(data) {
			//Sconsole.log('get result: ' + JSON.stringify(data, null, 2));
			if (data.errorMessage) {
				console.log(("Error: " + data.errorMessage).red);
				return;
			}
			if (data.length === 0) {
				console.log(("Error: no such project virtualkey").red);
				return;
			}
			//do not export passwords
			if(Array.isArray(data) && data.length > 0){
				for(var i = 0; i < data.length ; i++){
					data[i].project_ident = null;
					delete data[i]["ident"];
					delete data[i]["@metadata"];
				} 
			} else {
				data.project_ident = null;
				delete data["ident"];
				delete data["@metadata"];
			}
			if (toStdout) {
				console.log(JSON.stringify(data, null, 2));
			} else {
				var exportFile = fs.openSync(cmd.file, 'w+', 0600);
				fs.writeSync(exportFile, JSON.stringify(data, null, 2));
				console.log(('AllEntityInfos has been exported to file: ' + cmd.file).green);
			}
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
		var curProj = cmd.project_ident;
		if ( ! curProj) {
			curProj = dotfile.getCurrentProject();
		}
		if ( ! curProj) {
			console.log('There is no current project.'.yellow);
			return;
		}
		context.getContext(cmd, function() {
			var fileContent = JSON.parse(fs.readFileSync(cmd.file));
			if(Array.isArray(fileContent) && fileContent.length > 0){
				for(var i = 0; i < fileContent.length ; i++ ){
					fileContent[i].project_ident = curProj;
					delete fileContent[i].ident;
					delete fileContent[i].ts;
					fileContent[i]["@metadata"] = { action: "MERGE_INSERT", key:["project_ident","prefix"] };
				}
			}
			var startTime = new Date();
			client.put(loginInfo.url + "/AllEntityInfos", {
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
				printObject.printHeader('AllEntityInfos was imported, including:');
				if(data.statusCode == 200 ){
					console.log("Request took: " + (endTime - startTime) + "ms");
					return;
				} 
				var newDataSource = _.find(data.txsummary, function(p) {
					return p['@metadata'].resource === 'AllEntityInfos';
				});
				if ( ! newDataSource) {
					console.log('ERROR: unable to find AllEntityInfos'.red);
					return;
				}
				if (cmd.verbose) {
					_.each(data.txsummary, function(obj) {
						printObject.printObject(obj, obj['@metadata'].entity, 0, obj['@metadata'].verb);
					});
				}
				else {
					printObject.printObject(cd , newDataSource['@metadata'].entity, 0, newDataSource['@metadata'].verb);
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
		});
	}
};
