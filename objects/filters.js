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
	doFilter: function(action, cmd) {
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

		client.get(url + "/admin:named_filters?sysfilter=equal(project_ident:" + projIdent+")&sysorder=(name:asc_uc,name:desc)&pagesize=100", {
			headers: {
				Authorization: "CALiveAPICreator " + apiKey + ":1",
				"Content-Type" : "application/json"
			}
		}, function(data) {
			if (data.errorMessage) {
				console.log(data.errorMessage.red);
				return;
			}
			printObject.printHeader('Named Filter');
			var table = new Table();
			_.each(data, function(p) {
				table.cell("Ident", p.ident);
				table.cell("Name", p.name);
				table.cell("Resource", p.resource_names);
				table.cell("Filter Text", p.filter_text);
				var comments = p.description;
				if ( ! comments) {
					comments = "";
				}
				else if (comments.length > 50){
					comments = comments.substring(0, 47) + "...";
				}
				table.cell("Comments", comments);
				table.newRow();
			});
			table.sort(['Name', 'name']);
			if (data.length === 0) {
				console.log('There are no named filters  defined for this project'.yellow);
			}
			else {
				console.log(table.toString());
			}
			printObject.printHeader("# named filter(s): " + data.length);
		});
	},
	
	create: function(cmd) {
		var client = new Client();
		var loginInfo = login.login(cmd);
		if ( ! loginInfo)
			return;
		if ( ! cmd.name) {
			console.log('Missing parameter: name'.red);
			return;
		}
		if ( ! cmd.sort_text) {
			console.log('Missing parameter: sort_text'.red);
			return;
		}
		var curProj = cmd.project_ident;
		if ( ! curProj) {
			curProj = dotfile.getCurrentProject();
		}
		
		
		context.getContext(cmd, function() {
			//console.log('Current account: ' + JSON.stringify(context.account));
			
			var newSort = {
				name: cmd.name,
				description: cmd.comments,
				resource_names: cmd.resource_names,
				sort_text: cmd.sort_text,
				project_ident: curProj
			};
			newSort["@metadata"] = {action:"MERGE_INSERT", key: "name"};
			var startTime = new Date();
			client.put(loginInfo.url + "/admin:named_filters", {
				data: newSort,
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
				printObject.printHeader('New Named Filter was created');
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
				printObject.printHeader(trailer);
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
			if (cmd.name) {
				filter += "&sysfilter=equal(name:'" + cmd.name + "')";
			} else {
				console.log('Missing parameter: please specify either name or ident'.red);
				return;
			}
		}

		client.get(loginInfo.url + "/admin:named_filters?sysfilter=" + filter, {
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
				console.log(("Error: no such named filter").red);
				return;
			}
			if (data.length > 1) {
				console.log(("Error: more than one named filter for the given condition: " + filter).red);
				return;
			}
			var db = data[0];
			if( cmd.name) {
				db.name = cmd.name;
			}
			if( cmd.comments){
				db.description = cmd.comments;
			}
			if( cmd.resource_names ){
				db.resource_names = cmd.resource_names;
			}
			if ( cmd.filter_text ){
				db.filter_text = cmd.filter_text;
			}
		
			var startTime = new Date();
			//db["@metadata"] = {action:"MERGE_INSERT", key: "name"} ;
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
				printObject.printHeader('Named Filter was updated, including the following objects:');
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
	
	del : function(cmd) {
		var client = new Client();
		var loginInfo = login.login(cmd);
		if ( ! loginInfo) {
			console.log('You are not currently logged into any API Creator server.'.red);
			return;
		}

		var filt = null;
		if (cmd.ident) {
			filt = "equal(ident:'" + cmd.ident + "')";
		}
		else if (cmd.name) {
			filt = "equal(name:'" + cmd.name + "')";
		}
		else {
			console.log('Missing parameter: please specify either name or ident'.red);
			return;
		}
		
		client.get(loginInfo.url + "/admin:named_filters?sysfilter=" + filt, {
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
				console.log(("Error: no such named filter").red);
				return;
			}
			if (data.length > 1) {
				console.log(("Error: more than one named filter for the given condition: " + filter).red);
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
				printObject.printHeader('Named filter was deleted, including the following objects:');
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
		var filter = "";
		var projIdent = cmd.project_ident;
		if ( ! projIdent) {
			projIdent = dotfile.getCurrentProject();
		}
		var sep = "";
		if (cmd.ident) {
			filter += sep + "sysfilter=equal(ident:" + cmd.ident + ")";
			sep = "&";
		} else if (cmd.filtername) {
			filter += sep + "sysfilter=equal(name:'" + cmd.filtername + "')";
			sep = "&";
		} else if (projIdent) {
				filter += sep + "sysfilter=equal(project_ident:" + projIdent + ")";
		}
		var toStdout = false;
		if ( ! cmd.file) {
			toStdout = true;
		}
		
		client.get(loginInfo.url + "/admin:named_filters?" + filter, {
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
				console.log(("No named filter(s) found").red);
				return;
			}
			//do not export passwords
			for(var i = 0; i < data.length ; i++){
				data[i].project_ident = null;
				delete data[i]["ident"];
				delete data[i]["@metadata"];
			}
			if (toStdout) {
				console.log(JSON.stringify(data, null, 2));
			} else {
				var exportFile = fs.openSync(cmd.file, 'w+', 0600);
				fs.writeSync(exportFile, JSON.stringify(data, null, 2));
				console.log(('Named filter has been exported to file: ' + cmd.file).green);
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
					fileContent[i].project_ident = curProj;
					delete fileContent[i].ident;
					delete fileContent[i].ts;
					fileContent[i]["@metadata"] = {action:"MERGE_INSERT", key: ["project_ident","name"]} ;
				} 
			} else {
				fileContent.project_ident = curProj;
				delete fileContent.ident;
				fileContent["@metadata"] = {action:"MERGE_INSERT", key: ["project_ident","name"]} ;
			}
			var startTime = new Date();
			client.put(loginInfo.url + "/admin:named_filters", {
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
				printObject.printHeader('Named Filter was imported, including:');
				if(data.statusCode == 200 ){
					console.log("Request took: " + (endTime - startTime) + "ms");
					return;
				} 
				var newSort = _.find(data.txsummary, function(p) {
					return p['@metadata'].resource === 'admin:named_filters';
				});
				if ( ! newSort) {
					console.log('ERROR: unable to find imported named filter'.red);
					return;
				}
				if (cmd.verbose) {
					_.each(data.txsummary, function(obj) {
						printObject.printObject(obj, obj['@metadata'].entity, 0, obj['@metadata'].verb);
					});
				}
				else {
					printObject.printObject(newSort, newSort['@metadata'].entity, 0, newSort['@metadata'].verb);
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
			})
		});
	  });
	}
};
