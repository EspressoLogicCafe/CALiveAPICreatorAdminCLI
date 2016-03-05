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
	doDbase: function(action, cmd) {
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
		else if (action === 'reload') {
			module.exports.reload(cmd);
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

		client.get(url + "/dbaseschemas?sysfilter=equal(project_ident:" + projIdent+")", {
			headers: {
				Authorization: "CALiveAPICreator " + apiKey + ":1"
			}
		}, function(data) {
			if (data.errorMessage) {
				console.log(data.errorMessage.red);
				return;
			}
			printObject.printHeader('Datasources');
			var table = new Table();
			_.each(data, function(p) {
				table.cell("Name", p.name);
				table.cell("Prefix", p.prefix);
				var type = "";
				switch(p.dbasetype_ident) {
					case 1: type = "MySQL"; break;
					case 2: type = "Oracle"; break;
					case 3: type = "SQL Server (jTDS)"; break;
					case 4: type = "SQL Server"; break;
					case 5: type = "SQL Server (Azure)"; break;
					case 6: type = "NuoDB"; break;
					case 7: type = "PostgreSQL"; break;
					case 8: type = "Derby"; break;
					default: type = "unknown";
				}
				table.cell("Type", type);
				table.cell("Active", p.active);
				table.cell("Catalog", p.catalog_name);
				table.cell("Schema", p.schema_name);
				table.cell("User", p.user_name);
				table.cell("URL", p.url);
				var comments = p.comments;
				if ( ! comments) {
					comments = "";
				}
				else if (comments.length > 50){
					comments = comments.substring(0, 47) + "...";
				}
				table.cell("Comments", comments);
				table.newRow();
			});
			table.sort(['Active', 'Name']);
			if (data.length === 0) {
				console.log('There is no database defined for this project'.yellow);
			}
			else {
				console.log(table.toString());
			}
			printObject.printHeader("# datasources: " + data.length);
		});
	},
	
	create: function(cmd) {
		var client = new Client();
		var loginInfo = login.login(cmd);
		if ( ! loginInfo)
			return;
		if ( ! cmd.db_name) {
			console.log('Missing parameter: name'.red);
			return;
		}
		if ( ! cmd.prefix) {
			prefix = "main";
		}
		var curProj = cmd.project_ident;
		if ( ! curProj) {
			curProj = dotfile.getCurrentProject();
		}
		if ( ! curProj) {
			console.log('There is no current project.'.yellow);
			return;
		}
		if ( ! cmd.user_name) {
			console.log('Missing parameter: user_name'.red);
			return;
		}
		if ( ! cmd.password) {
			console.log('Missing parameter: password'.red);
			return;
		}
		if ( ! cmd.url) {
			console.log('Missing parameter: url'.red);
			return;
		}
		
		var dbasetype = cmd.dbasetype;
		if ( ! dbasetype) {
			console.log('You must specify a database type.'.red);
			return;
		}
		dbasetype = dbasetype.toLowerCase();
		switch(dbasetype) {
			case "mysql": dbasetype = 1; break;
			case "oracle": dbasetype = 2; break;
			case "sqlserver": dbasetype = 5; break;
			case "sql server": dbasetype = 5; break;
			case "sqlserverazure": dbasetype = 6; break;
			case "sql server azure": dbasetype = 6; break;
			case "nuodb": dbasetype = 7; break;
			case "postgres": dbasetype = 8; break;
			case "postgresql": dbasetype = 8; break;
			case "derby": dbasetype = 17; break;
			default : console.log('Unknown database type: ' + dbasetype); return;
		}

		context.getContext(cmd, function() {
			//console.log('Current account: ' + JSON.stringify(context.account));
			
			var newDbase = {
				name: cmd.db_name,
				prefix: cmd.prefix,
				url: cmd.url,
				catalog_name: cmd.catalog_name,
				schema_name: cmd.schema_name,
				user_name: cmd.user_name,
				password: cmd.password,
				port_num: cmd.port_num,
				active: true,
				comments: cmd.comments,
				dbasetype_ident: dbasetype,
				project_ident: curProj
			};
			var startTime = new Date();
			client.post(loginInfo.url + "/dbaseschemas", {
				data: newDbase,
				headers: {
					Authorization: "CALiveAPICreator " + loginInfo.apiKey + ":1"
				}
			}, function(data) {
				var endTime = new Date();
				if (data.errorMessage) {
					console.log(data.errorMessage.red);
					return;
				}
				printObject.printHeader('Database connection was created');
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

		var filter = null;
		var projIdent = cmd.project_ident;
		if ( ! projIdent) {
			projIdent = dotfile.getCurrentProject();
			if ( ! projIdent) {
				console.log('There is no current project.'.yellow);
				return;
			}
			filter = "equal(project_ident: "+ projIdent +")" ;
		}
		if(cmd.ident){
			filter += "&sysfilter=equal(ident: "+ cmd.ident +")" ;
		} else {
			if (cmd.prefix) {
				filter += "&sysfilter=equal(prefix:'" + cmd.prefix + "')";
			}
			else if (cmd.db_name) {
				filter += "&sysfilter=equal(name:'" + cmd.db_name + "')";
			} else {
				console.log('Missing parameter: please specify either db_name or prefix'.red);
				return;
			}
		}
		
		//console.log(filter);
		client.get(loginInfo.url + "/DbSchemas?sysfilter=" + filter, {
			headers: {
				Authorization: "CALiveAPICreator " + loginInfo.apiKey + ":1"
			}
		}, function(data) {
			
			if (data.errorMessage) {
				//console.log(data);
				console.log(("Error: " + data.errorMessage).red);
				return;
			}
			if (data.length === 0) {
				console.log(("Error: no such datasource").red);
				return;
			}
			if (data.length > 1) {
				console.log(("Error: more than one datasource for the given condition: " + filter).red);
				return;
			}
			var db = data[0];
			
			
			if( cmd.password) {
				db.password = cmd.password;
				delete db.salt;
			}
			if( cmd.user_name){
				db.user_name = cmd.user_name;
			}
			if( cmd.db_name ){
				db.name = cmd.db_name;
			}
			if ( cmd.url ){
				db.url = cmd.url;
			}
			if( !cmd.prefix ) {
				db.prefix = cmd.prefix;
			}
			if( cmd.port ) {
				db.port = cmd.port;
			}
			if( cmd.schema_name ){
				db.schema_name = cmd.schema_name;
			}
			if( cmd.catalog_name ){
			 	db.catalog_name = cmd.catalog_name;
			}
			if( cmd.comments ){
			 	db.comments = cmd.comments;
			}
			if( cmd.active ){
			 	db.active = cmd.active;
			}
			var startTime = new Date();
			
			client.put(db['@metadata'].href, {
				data: db,
				headers: {
					Authorization: "CALiveAPICreator " + loginInfo.apiKey + ":1"
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
	reload: function(cmd) {
		var client = new Client();
		var loginInfo = login.login(cmd);
		if ( ! loginInfo) {
			console.log('You are not currently logged into any API Creator server.'.red);
			return;
		}

		var filter = null;
		var projIdent = cmd.project_ident;
		if ( ! projIdent) {
			projIdent = dotfile.getCurrentProject();
			if ( ! projIdent) {
				console.log('There is no current project.'.yellow);
				return;
			}
			filter = "sysfilter=equal(project_ident: "+ projIdent +")" ;
		}
		if(cmd.ident){
			filter += "&sysfilter=equal(ident: "+ cmd.ident +")" ;
		} else {
			if (cmd.prefix) {
				filter += "&sysfilter=equal(prefix:'" + cmd.prefix + "')";
			}
			else if (cmd.db_name) {
				filter += "&sysfilter=equal(name:'" + cmd.db_name + "')";
			} else {
				console.log('Missing parameter: please specify either --db_name, --ident or --prefix'.red);
				return;
			}
		}
		if( cmd.active ){
			filter += "&sysfilter=equal(active: "+ cmd.active + ")";
		} else {
			filter += "&sysfilter=equal(active: true)";
		}
		
		client.get(loginInfo.url + "/DbSchemas?" + filter, {
			headers: {
				Authorization: "CALiveAPICreator " + loginInfo.apiKey + ":1"
			}
		}, function(data) {
			
			if (data.errorMessage) {
				console.log(("Error: " + data.errorMessage).red);
				return;
			}
			if (data.length === 0) {
				console.log(("Error: no such database use --prefix, --db_name, or --ident").red);
				return;
			}
			if (data.length > 1) {
				console.log(("Error: more than one database for the given condition: " + filter).red);
				return;
			}
			var db = data[0];
			delete db.ident;
			var startTime = new Date();
			var request = {statusRequest: projIdent };
			client.put( loginInfo.url  + "/DbSchemas/"+db.ident, {
				data: db,
				headers: {
					Authorization: "CALiveAPICreator " + loginInfo.apiKey + ":1"
				}
			}, function(data2) {
				var endTime = new Date();
				if (data2.errorMessage) {
					console.log(data2.errorMessage.red);
					return;
				}
				printObject.printHeader('Database reload completed. Status Code: ' + data2.statusCode);
				
				var trailer = "Request took: " + (endTime - startTime) + "ms";
				
				if (data2.length == 0) {
					console.log('No data returned'.yellow);
				}
				else {
					//trailer += data2.length;
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

		var filt = null;
		if (cmd.prefix) {
			filt = "equal(prefix:'" + cmd.prefix + "')";
		}
		else if (cmd.db_name) {
			filt = "equal(name:'" + cmd.db_name + "')";
		}
		else if (cmd.ident) {
			filt = "equal(ident:" + cmd.ident + ")";
		}
		else {
			console.log('Missing parameter: please specify either --db_name, --ident or --prefix'.red);
			return;
		}
		
		client.get(loginInfo.url + "/dbaseschemas?sysfilter=" + filt, {
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
				console.log(("Error: no such database").red);
				return;
			}
			if (data.length > 1) {
				console.log(("Error: more than one database for the given condition: " + filter).red);
				return;
			}
			var db = data[0];
			var startTime = new Date();
			client['delete'](db['@metadata'].href + "?checksum=" + db['@metadata'].checksum, {
				headers: {
					Authorization: "CALiveAPICreator " + loginInfo.apiKey + ":1"
				}
			}, function(data2) {
				var endTime = new Date();
				if (data2.errorMessage) {
					console.log(data2.errorMessage.red);
					return;
				}
				printObject.printHeader('Database connection was deleted, including the following objects:');
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
			filter += "&sysfilter(prefix:'" + cmd.prefix + "')";
		} else if (cmd.db_name) {
			filter += "&sysfilter=(name:'" + cmd.db_name + "')";
		} 
		
		var toStdout = false;
		if ( ! cmd.file) {
			toStdout = true;
		}
		
		client.get(loginInfo.url + "/dbaseschemas?" + filter, {
			headers: {
				Authorization: "CALiveAPICreator " + loginInfo.apiKey + ":1"
			}
		}, function(data) {
			//Sconsole.log('get result: ' + JSON.stringify(data, null, 2));
			if (data.errorMessage) {
				console.log(("Error: " + data.errorMessage).red);
				return;
			}
			if (data.length === 0) {
				console.log(("Error: no such datasource").red);
				return;
			}
			//do not export passwords
			if(Array.isArray(data) && data.length > 0){
				for(var i = 0; i < data.length ; i++){
					//data[i].password = null;
					//data[i].salt = null;
					data[i].project_ident = null;
					delete data[i]["ident"];
					delete data[i]["@metadata"];
				} 
			} else {
				data.password = null;
				data.salt = null;
				data.project_ident = null;
				delete data["ident"];
				delete data["@metadata"];
			}
			if (toStdout) {
				console.log(JSON.stringify(data, null, 2));
			} else {
				var exportFile = fs.openSync(cmd.file, 'w+', 0600);
				fs.writeSync(exportFile, JSON.stringify(data, null, 2));
				console.log(('Data Source has been exported to file: ' + cmd.file).green);
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
					fileContent[i]["@metadata"] = { action: "MERGE_INSERT", key:["project_ident","prefix"] };
				}
			}
			var startTime = new Date();
			client.put(loginInfo.url + "/admin:dbaseschemas", {
				data: fileContent,
				headers: {Authorization: "CALiveAPICreator " + loginInfo.apiKey + ":1" }
				}, function(data) {
				var endTime = new Date();
				if (data.errorMessage) {
					console.log(data.errorMessage.red);
					return;
				}
				printObject.printHeader('Datasource was imported, including:');
				if(data.statusCode == 200 ){
					console.log("Request took: " + (endTime - startTime) + "ms");
					return;
				} 
				var newDataSource = _.find(data.txsummary, function(p) {
					return p['@metadata'].resource === 'admin:dbaseschemas';
				});
				if ( ! newDataSource) {
					console.log('ERROR: unable to find imported data source'.red);
					return;
				}
				if (cmd.verbose) {
					_.each(data.txsummary, function(obj) {
						printObject.printObject(obj, obj['@metadata'].entity, 0, obj['@metadata'].verb);
					});
				}
				else {
					printObject.printObject(newDataSource, newDataSource['@metadata'].entity, 0, newDataSource['@metadata'].verb);
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
