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
	doLibrary: function(action, cmd) {
		if (action === 'list') {
			module.exports.list(cmd);
		}
		else if (action === 'create') {
			module.exports.create(cmd);
		}
		else if (action === 'delete') {
			module.exports.delete(cmd);
		}
		else if (action === 'import') {
			module.exports.import(cmd);
		}
		else if (action === 'export') {
			module.exports.export(cmd);
		}
		else if (action === 'exportJavascript') {
			module.exports.exportJavascript(cmd);
		}
		else if (action === 'importJavascript') {
			module.exports.importJavascript(cmd);
		}
		else {
			console.log('You must specify an action: list, create, delete, import, exportJavascript,or export');
			//program.help();
		}
	},

	list: function(cmd) {
        var client = new Client();
        var loginInfo = login.login(cmd);
        if (!loginInfo)
            return;
        var url = loginInfo.url;
        var apiKey = loginInfo.apiKey;
        var projIdent = cmd.project_ident;
        var filter = "";
        if (!projIdent) {
            projIdent = dotfile.getCurrentProject();
        }
        if (projIdent) {
        	filter = "&sysfilter=equal(project_ident:" + projIdent + ")";
    	}
		client.get(url + "/logic_libraries?pagesize=100&sysorder=(name:asc_uc,name:desc)"+filter, {
			headers: {
				Authorization: "CALiveAPICreator " + apiKey + ":1",
				"Content-Type" : "application/json"
			}
		}, function(data) {
			if (data.errorMessage) {
				console.log(data.errorMessage.red);
				return;
			}
			printObject.printHeader('All Libraries');
			var table = new Table();
			var verboseDisplay = "";
			_.each(data, function(p) {
				table.cell("Ident", p.ident);
				table.cell("Name", p.name);
				table.cell("Version", p.version);
				table.cell("Short Name", p.lib_name);
				//table.cell("UserLib",(p.system_only == true));
				table.cell("Type", p.logic_type);
				var comments = p.description;
				if ( ! comments) {
					comments = "";
				}
				else if (comments.length > 50){
					comments = comments.substring(0, 47) + "...";
				}
				table.cell("Comments", comments);
				table.newRow();
				if(cmd.verbose && p.ident > 511) {
					verboseDisplay += "\n";
					verboseDisplay += "lacadmin libraries export --name '"+p.name+"' --file  'LIBRARY_"+p.name + ".json'\n";
					verboseDisplay += "#lacadmin libraries import --file  'LIBRARY_"+p.name + ".json'\n";
				}
			});
			table.sort(['Name']);
			console.log(table.toString());
			printObject.printHeader("# libraries: " + data.length);
			if(cmd.verbose) {
				console.log(verboseDisplay);
			}
		});
	},

	delete: function(cmd) {
		var client = new Client();
		var loginInfo = login.login(cmd);
		if ( ! loginInfo)
			return;
        var projIdent = cmd.project_ident;
        if ( ! projIdent) {
            projIdent = dotfile.getCurrentProject();
        }
        if(!projIdent) {
        	console.log("No current project selected".red);
        	return;
		}
		var filt = null;
		if (cmd.library_name) {
			filt = "equal(name:'" + cmd.library_name + "'";
		} else if (cmd.ident) {
			filt = "equal(ident:" + cmd.ident;
		}
		if(filt === null) {
			console.log('Missing parameter: please specify library --name or --ident'.red);
			return;
		}
		filt += ",project_ident:"+ projIdent +")";
		client.get(loginInfo.url + "/logic_libraries?sysfilter=" + filt, {
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
				console.log(("Library not found").red);
				return;
			}
			if (data.length > 1) {
				console.log(("Error: more than one libraries for the given condition: " + filt).red);
				return;
			}
			var library = data[0];
			var startTime = new Date();
			client['delete'](library['@metadata'].href + "?checksum=" + library['@metadata'].checksum, {
				headers: {
					Authorization: "CALiveAPICreator " + loginInfo.apiKey + ":1"
				}
			}, function(data2) {
				var endTime = new Date();
				if (data2.errorMessage) {
					console.log(data2.errorMessage.red);
					return;
				}
				printObject.printHeader('Library was deleted, including the following objects:');


				var delLibrary = _.find(data2.txsummary, function(p) {
					return p['@metadata'].resource === 'admin:logic_libraries';
				});
				if ( ! delLibrary) {
					console.log('ERROR: unable to find deleted library'.red);
					return;
				}
				if (cmd.verbose) {
					_.each(data2.txsummary, function(obj) {
						printObject.printObject(obj, obj['@metadata'].entity, 0, obj['@metadata'].verb);
					});
				}
				else {
					printObject.printObject(delLibrary, delLibrary['@metadata'].entity, 0, delLibrary['@metadata'].verb);
					console.log(('and ' + (data2.txsummary.length - 1) + ' other objects').grey);
				}

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
	create: function(cmd) {
		var client = new Client();
		var loginInfo = login.login(cmd);
		if ( ! loginInfo)
			return;

		if ( ! cmd.library_name) {
			console.log('Missing parameter: library_name'.red);
			return;
		}
		if ( ! cmd.short_name) {
			console.log('Missing parameter: short_name'.red);
			return;
		}

		var ver = cmd.ver;
		if( ! cmd.ver ) {
			ver = "1.0";
		}

		var projIdent = cmd.project_ident;
		if ( ! projIdent) {
			projIdent = dotfile.getCurrentProject();
		}
		context.getContext(cmd, function() {

			var newLibrary = {
				name: cmd.library_name,
				group_name: cmd.short_name ,
				lib_name: cmd.short_name ,
				version: ver  ,
				description:  cmd.comments || null,
				doc_url: cmd.docurl || null,
				ref_url: cmd.refurl || null,
				code: "",
				system_only: false,
				logic_type:  "javascript" ,
				project_ident: projIdent
			};
			if( ! cmd.file){
			   cmd.file = '/dev/stdin';
			}
			var fileContent = fs.readFileSync(cmd.file);
			var data = fileContent.toString('base64');//hex
			newLibrary.code  = "b64:" + data;//"0x"+data; //
			var startTime = new Date();
			newLibrary["@metadata"] = {action:"MERGE_INSERT", key: ["name","project_ident"]} ;
			client.put(loginInfo.url + "/admin:logic_libraries", {
				data: newLibrary,
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
				if(data.statusCode == 200 && data.txsummary.length == 0){
					console.log("Merge completed - no changes detected");
				} else {
					printObject.printHeader('Library was created, including:');
					var newLib = _.find(data.txsummary, function(p) {
						return p['@metadata'].resource === 'admin:logic_libraries';
					});
					if ( ! newLib) {
						console.log('Library Create error: unable to find newly created library'.red);
						return;
					}
					if (cmd.verbose) {
						_.each(data.txsummary, function(obj) {
							printObject.printObject(obj, obj['@metadata'].entity, 0, obj['@metadata'].verb);
						});
					}
					else {
						printObject.printObject(newLib, newLib['@metadata'].entity, 0, newLib['@metadata'].verb);
						console.log(('and ' + (data.txsummary.length - 1) + ' other objects').grey);
					}
					var trailer = "Request took: " + (endTime - startTime) + "ms";
					trailer += " - # objects touched: ";
					if (data.txsummary.length == 0) {
						console.log('No data returned'.yellow);
					}
					else {
						trailer += data.txsummary.length;
					}
				printObject.printHeader(trailer);
		       }

				//console.log("project ident "+projIdent );
				//console.log("logic_library_ident:" +data.txsummary[0].ident);
				//console.log("LinkProject "+ cmd.linkProject);
				//console.log("data.txsummary.length ="+data.txsummary.length);
				if(cmd.linkProject && projIdent && data.txsummary.length > 0){
					var linkproject = {
						//@metadata: {action: 'INSERT'},
						logic_library_ident: data.txsummary[0].ident ,
						project_ident: projIdent
					};
					linkproject["@metadata"] = {action:"MERGE_INSERT"} ;
					client.put(loginInfo.url + "/admin:project_libraries", {
						data: linkproject,
						headers: {
							Authorization: "CALiveAPICreator " + loginInfo.apiKey + ":1",
							"Content-Type" : "application/json"
							}
						}, function(data) {
						if (data.errorMessage) {
							console.log(("LinkProject Error: " + data.errorMessage).red);
							return;
						}
						if (data.length === 0) {
							console.log(("Error: no such project or library to link").red);
							return;
						}
				  });
				}
			});
		});
	},
	importJavascript: function(cmd) {
		var client = new Client();
		var loginInfo = login.login(cmd);
		if ( ! loginInfo)
			return;
		var projIdent = cmd.project_ident;
		if ( ! projIdent) {
			projIdent = dotfile.getCurrentProject();
		}
		if(!projIdent) {
			console.log("No current project selected".red);
			return;
		}
		var filt = null;
		if (cmd.library_name) {
			filt = "equal(name:'" + cmd.library_name + "'";
		} else if (cmd.ident) {
			filt = "equal(ident:" + cmd.ident;
		}
		if(!cmd.file) {
			console.log('Missing parameter: please specify JavaScript file using --file'.red);
			return;
		}
		if(filt === null) {
			console.log('Missing parameter: please specify library --name or --ident'.red);
			return;
		}
		filt += ",project_ident:"+ projIdent +")";
		client.get(loginInfo.url + "/logic_libraries?sysfilter=" + filt, {
			headers: {
				Authorization: "CALiveAPICreator " + loginInfo.apiKey + ":1",
				"Content-Type" : "application/json"
			}
		}, function(data) {
			console.log('get result: ' + JSON.stringify(data, null, 2));
			if (data.errorMessage) {
				console.log(("Error: " + data.errorMessage).red);
				return;
			}
			if (data.length === 0) {
				console.log(("Library not found").red);
				return;
			}
			if (data.length > 1) {
				console.log(("Error: more than one libraries for the given condition: " + filt).red);
				return;
			}
			var library = data[0];
			var content = fs.readFileSync(cmd.file,'utf-8');

			var fileContent = content;
			var libcodehex = fileContent.toString('base64');//hex
			library.code = "b64:" + libcodehex;
			var metadata = library["@metadata"];
			metadata.action ="MERGE_INSERT";
			//console.log(metadata);
			library["@metadata"] = metadata;
			//console.log(library);
			var startTime = new Date();
			client.put(loginInfo.url + "/logic_libraries", {
				data: library,
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
				printObject.printHeader('Library was updated, including the following objects:');


				var putlib = _.find(data2.txsummary, function(p) {
					return p['@metadata'].resource === 'admin:logic_libraries';
				});
				if ( ! putlib) {
					console.log('ERROR: unable to find updated library'.red);
					return;
				}
				if (cmd.verbose) {
					_.each(data2.txsummary, function(obj) {
						printObject.printObject(obj, obj['@metadata'].entity, 0, obj['@metadata'].verb);
					});
				}
				else {
					printObject.printObject(putlib, putlib['@metadata'].entity, 0, putlib['@metadata'].verb);
					console.log(('and ' + (data2.txsummary.length - 1) + ' other objects').grey);
				}

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
		}
		console.log("project ident "+projIdent );
		if (cmd.linkProject) {
			console.log("LinkProject "+ cmd.linkProject);
		}
		context.getContext(cmd, function() {
			var content = fs.readFileSync(cmd.file,'utf-8');
			//console.log(content);
			var fileContent = JSON.parse(content);
			var account_ident = context.account.ident;
			for(var i = 0 ; i < fileContent.length ; i++ ){
				delete fileContent[i].ident;
				fileContent[i].logic_type = "javascript";
				fileContent[i].project_ident = projIdent;
				delete fileContent[i].ts;
				delete fileContent[i].account_ident;
				fileContent[i]["@metadata"] = {action:"MERGE_INSERT", key: ["name","project_ident"]} ;
			}
			var startTime = new Date();
			client.put(loginInfo.url + "/logic_libraries", {
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
				printObject.printHeader('Logic Library was created, including:');
				if(data.statusCode == 200 ){
					console.log("Request took: " + (endTime - startTime) + "ms");
				}
				var newLib = _.find(data.txsummary, function(p) {
					return p['@metadata'].resource === 'admin:logic_libraries';
				});
				if ( ! newLib) {
					console.log('ERROR: unable to find imported logic library'.red);
					return;
				}
				if (cmd.verbose) {
					_.each(data.txsummary, function(obj) {
						printObject.printObject(obj, obj['@metadata'].entity, 0, obj['@metadata'].verb);
					});
				}
				else {
					printObject.printObject(newLib, newLib['@metadata'].entity, 0, newLib['@metadata'].verb);
					console.log(('and ' + (data.txsummary.length - 1) + ' other objects').grey);
				}
				console.log("logic_library_ident:" +data.txsummary[0].ident);

				var trailer = "Request took: " + (endTime - startTime) + "ms";
				trailer += " - # objects touched: ";
				if (data.txsummary.length === 0) {
					console.log('No data returned'.yellow);
				}
				else {
					trailer += data.txsummary.length;
				}
				printObject.printHeader(trailer);

				if(cmd.linkProject){
					console.log("Link Project to "+projIdent);
					var linkproject = {
						//@metadata: {action: 'INSERT'},
						logic_library_ident: data.txsummary[0].ident ,
						project_ident: projIdent
					};
					linkproject["@metadata"] = {action:"INSERT"} ;
					client.post(loginInfo.url + "/admin:project_libraries", {
						data: linkproject,
						headers: {
							Authorization: "CALiveAPICreator " + loginInfo.apiKey + ":1",
							"Content-Type" : "application/json"
						}
						}, function(data) {
						if (data.errorMessage) {
							console.log(("Link error: " + data.errorMessage).red);
							return;
						}
						if (data.length === 0) {
							console.log(("Link error: no such project ident or library to link").red);
							return;
						}
						printObject.printHeader(trailer);
				  });
				}
			})
		});
	},
	exportJavascript: function(cmd) {
		var client = new Client();
		var loginInfo = login.login(cmd);
		if ( ! loginInfo)
			return;

		var url = loginInfo.url;
		var apiKey = loginInfo.apiKey;

		var filter = null;

		filter = "sysfilter=greater(ident:999)&sysfilter=equal(logic_type:'javascript')";

		if (!cmd.ident) {
			console.log("Missing parameter --ident - use lacadmin libraries list");
			return;
		}

		var toStdout = false;
		if ( ! cmd.file) {
			toStdout = true;
		}
		filter = "/" + cmd.ident + "/code?" + filter;
		var dataUrl = loginInfo.url;
		dataUrl = dataUrl.replace("rest","data");
		//console.log(dataUrl);
		client.get(dataUrl + "/admin:logic_libraries" + filter, {
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
				console.log(("Error: no libraries found using filter "+filter).red);
				return;
			}
			var fileAsString = new Buffer(data).toString('utf8');
			//console.log( "javascript code :" + fileAsString);

			if (toStdout) {
				console.log(JSON.stringify(fileAsString, null, 2));
			} else {
				var exportFile = fs.openSync(cmd.file, 'w+', 0600);
				fs.writeSync(exportFile, fileAsString);
				console.log(('Logic Library as JSON has been exported to file: ' + cmd.file).green);
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

		var filter = null;

		filter = "&sysfilter=greater(ident:999)&sysfilter=equal(logic_type:'javascript')";

		if (cmd.ident) {
			filter += "&sysfilter=equal(ident:" + cmd.ident + ")";
		} else if (cmd.short_name) {
			filter += "&sysfilter=equal(short_name:'" + cmd.short_name + "')";
		} else if (cmd.library_name) {
			filter += "&sysfilter=equal(name:'" + cmd.library_name + "')";
		}

		var toStdout = false;
		if ( ! cmd.file) {
			toStdout = true;
		}
		client.get(loginInfo.url + "/admin:logic_libraries?nometa=true" + filter, {
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
				console.log(("Error: no libraries found using filter "+filter).red);
				return;
			}
			var select_ident = null;
			for(var i = 0; i < data.length ; i++){
				select_ident = data[i].ident;
				delete data[i].ident;
				delete data[i].account_ident;
				data[i].project_ident = null;
			}

			if (toStdout) {
				//console.log(JSON.stringify(data, null, 2));
				if(cmd.ident) {
					select_ident = cmd.ident;
				}
				if (select_ident) {
				   filter = "/" + select_ident + "/code";
				   var dataUrl = loginInfo.url;
				   dataUrl = dataUrl.replace("rest","data");
				   client.get(dataUrl + "/admin:logic_libraries" + filter, {
				   headers: {
					  Authorization: "CALiveAPICreator " + loginInfo.apiKey + ":1",
					  "Content-Type" : "application/json"
				   }
					  }, function(code) {
						  if (code.errorMessage) {
								  console.log(("Error: " + code.errorMessage).red);
								  return;
							  }
							  if (code.length === 0) {
								  console.log(("Library {JS} code not found").red);
								  return;
							  }
							var filename = data[0].name + ".js";
							var fileAsString = new Buffer(code).toString('utf8');
							//console.log(filename + ":" + fileAsString);
							var exportFile = fs.openSync(filename, 'w+', 0600);
							fs.writeSync(exportFile, JSON.stringify(fileAsString, null, 2));
							console.log(('Logic Library as text has been exported to file: ' + filename ).green);
				   });
				}

			} else {
				var exportFile = fs.openSync(cmd.file, 'w+', 0600);
				fs.writeSync(exportFile, JSON.stringify(data, null, 2));
				console.log(('Logic Library as JSON has been exported to file: ' + cmd.file).green);
			}

		});

	}
}
