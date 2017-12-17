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

		client.get(url + "/admin:managed_data_servers", {
			headers: {
				Authorization: "CALiveAPICreator " + apiKey + ":1",
				"Content-Type" : "application/json"
			}
		}, function(data) {
			if (data.errorMessage) {
				console.log(data.errorMessage.red);
				return;
			}
			printObject.printHeader('Managed Data Server(s)');
			var table = new Table();
			var verboseDisplay = "";
			_.each(data, function(p) {
				table.cell("Ident", p.ident);
				table.cell("Name", p.name);
				var type = "";
				switch(p.dbasetype_ident) {
					case 1: type = "mysql"; break;
					case 2: type = "oracle"; break;
					case 3: type = "SQL Server (jTDS)"; break;
					case 4: type = "SQL Server"; break;
					case 5: type = "sqlserver"; break;
					case 6: type = "sqlserverazure"; break;
					case 8: type = "postgresql"; break;
					case 17: type = "derby"; break;
					default: type = "unknown";
				}
				table.cell("Type", type);
				table.cell("Active", p.is_active);
				table.cell("Catalog", p.catalog_name);
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
				if(cmd.verbose) {
					verboseDisplay += "\n";
					verboseDisplay += "lacadmin managedserver create --server_name '"+p.name+"'";
					verboseDisplay += " --dbasetype '"+ type +"'";
					verboseDisplay += " --url '"+p.url + "'";
					verboseDisplay += " --active "+p.is_active ;
					if(p.catalog_name){
						verboseDisplay += " --catalog "+p.catalog_name;
				  }
					verboseDisplay += " --user_name "+p.user_name;
					verboseDisplay += " --password <password>";
					if(comments){
						verboseDisplay += " --comments '"+comments+"'";
					}
				}
			});
			table.sort(['Active', 'Name']);
			if (data.length === 0) {
				console.log('There is no managed_data_servers defined for this project'.yellow);
			}
			else {
				console.log(table.toString());
			}
			printObject.printHeader("# managed_data_servers: " + data.length);
			if(cmd.verbose) {
				console.log(verboseDisplay);
			}
		});
	},

	create: function(cmd) {
		var client = new Client();
		var loginInfo = login.login(cmd);
		if ( ! loginInfo)
			return;
		if ( ! cmd.server_name) {
			console.log('Missing parameter: server_name'.red);
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
		if ( ! cmd.active) {
			console.log('Missing parameter: active'.red);
			return;
		}

		var dbasetype = cmd.dbasetype;
		if ( ! dbasetype) {
			console.log('You must specify a dbasetype.'.red);
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
			default : console.log('Unknown database type: ' + dbasetype);
				return;
		}

		context.getContext(cmd, function() {

			var newServer = {
				name: cmd.server_name,
				url: cmd.url,
				catalog_name: cmd.catalog_name,
				user_name: cmd.user_name,
				password: cmd.password || null,
				is_active: cmd.active == 'true',
				comments: cmd.comments || "Created by lacadmin command line service",
				dbasetype_ident: dbasetype,
				account_ident: context.account.ident
			};
			console.log(newServer);
			var startTime = new Date();
			console.log("POST: "+loginInfo.url + "/admin:managed_data_servers");
			client.post(loginInfo.url + "/admin:managed_data_servers", {
				data: newServer,
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
				console.log(JSON.stringify(data,null,2));
				printObject.printHeader('Managed data server created');
				_.each(data.txsummary, function(obj) {
					printObject.printObject(obj, obj['@metadata'].entity, 0, obj['@metadata'].verb);
				});
				var trailer = "Request took: " + (endTime - startTime) + "ms";
				trailer += " - # objects touched: ";

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

		var filter = "";

		if(cmd.ident){
			filter += "equal(ident: "+ cmd.ident +")" ;
		} else {

		    if (cmd.serer_name) {
				filter += "equal(name:'" + cmd.server_name + "')";
			} else {
				console.log('Missing parameter: please specify ident or server_name '.red);
				return;
			}
		}

		//console.log(filter);
		client.get(loginInfo.url + "/admin:managed_data_servers?sysfilter=" + filter, {
			headers: {
				Authorization: "CALiveAPICreator " + loginInfo.apiKey + ":1",
				"Content-Type" : "application/json"
			}
		}, function(data) {

			if (data.errorMessage) {
				//console.log(data);
				console.log(("Error: " + data.errorMessage).red);
				return;
			}
			if (data.length === 0) {
				console.log(("Managed data server not found").red);
				return;
			}
			if (data.length > 1) {
				console.log(("Error: more than one managed data server for the given condition: " + filter).red);
				return;
			}
			var db = data[0];

			if(cmd.server_name){
				db.name = cmd.server_name;
			}

			if( cmd.password) {
				db.password = cmd.password;
				delete db.salt;
			}
			if( cmd.user_name){
				db.user_name = cmd.user_name;
			}

			if ( cmd.url ){
				db.url = cmd.url;
			}

			if( cmd.catalog_name ){
			 	db.catalog_name = cmd.catalog_name;
			}
			if( cmd.comments ){
			 	db.comments = cmd.comments;
			}
			if( cmd.active ){
			 	db.is_active = cmd.active;
			}
			var startTime = new Date();

			client.put(db['@metadata'].href, {
				data: db,
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
				printObject.printHeader('Managed data server was updated, including the following objects:');
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
	   if (cmd.ident) {
			filter = "equal(ident:" + cmd.ident + ")";
		} else if(cmd.server_name) {
	   		filter = "equal(name:'"+cmd.server_name +"')";
	   }
		else {
			console.log('Missing parameter: please specify managed_data_servers --server_name or  --ident '.red);
			return;
		}

		client.get(loginInfo.url + "/admin:managed_data_servers?sysfilter=" + filter, {
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
				console.log(("Managed data server not found").red);
				return;
			}
			if (data.length > 1) {
				console.log(("Error: more than one managed_data_server for the given condition: " + filter).red);
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
				printObject.printHeader('Managed Data Server connection was deleted, including the following objects:');
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
		var filter = "";


		if (cmd.ident) {
			filter = "?sysfilter=equal(ident:" + cmd.ident + ")";
		}

		var toStdout = false;
		if ( ! cmd.file) {
			toStdout = true;
		}

		client.get(loginInfo.url + "/admin:managed_data_servers" + filter, {
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
				console.log(("Managed Server not found").red);
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

		context.getContext(cmd, function() {
			var fileContent = JSON.parse(fs.readFileSync(cmd.file));
			if(Array.isArray(fileContent) && fileContent.length > 0){
				for(var i = 0; i < fileContent.length ; i++ ){
					fileContent[i].account_ident = context.account.ident;
					delete fileContent[i].ident;
					delete fileContent[i].ts;
					delete fileContent[i].project_ident;
					delete fileContent[i].salt;
					fileContent[i]["@metadata"] = { action: "MERGE_INSERT", key:["name","account_ident"] };
				}
			}
			var startTime = new Date();
			client.post(loginInfo.url + "/admin:managed_data_servers", {
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
				printObject.printHeader('Managed Data server was imported, including:');
				if(data.statusCode == 200 ){
					console.log("Request took: " + (endTime - startTime) + "ms");
					return;
				}
				var newDataSource = _.find(data.txsummary, function(p) {
					return p['@metadata'].resource === 'admin:managed_data_servers';
				});
				if ( ! newDataSource) {
					console.log('ERROR: unable to find imported managed data server'.red);
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
