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
		else {
			console.log('You must specify an action: list, create, delete, import, or export');
			//program.help();
		}
	},
	
	list: function(cmd) {
		var client = new Client();
		var loginInfo = login.login(cmd);
		if ( ! loginInfo)
			return;
		var url = loginInfo.url;
		var apiKey = loginInfo.apiKey;

		client.get(url + "/logic_libraries?pagesize=100&sysorder=(name:asc_uc,name:desc)", {
			headers: {
				Authorization: "CALiveAPICreator " + apiKey + ":1"
			}
		}, function(data) {
			if (data.errorMessage) {
				console.log(data.errorMessage.red);
				return;
			}
			printObject.printHeader('All Libraries');
			var table = new Table();
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
			});
			table.sort(['Name']);
			console.log(table.toString());
			printObject.printHeader("# libraries: " + data.length);
		});
	},
	
	delete: function(cmd) {
		var client = new Client();
		var loginInfo = login.login(cmd);
		if ( ! loginInfo)
			return;
		var filt = null;
		if (cmd.ident) {
			filt = "equal(ident:" + cmd.ident + ")";
		} else {
			console.log('Missing parameter: please specify library ident'.red);
			return;
		}
		
		client.get(loginInfo.url + "/logic_libraries?sysfilter=" + filt, {
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
				console.log(("Error: no such library").red);
				return;
			}
			if (data.length > 1) {
				console.log(("Error: more than one libraries for the given condition: " + filter).red);
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

		if ( ! cmd.libname) {
			console.log('Missing parameter: libname'.red);
			return;
		}
		if ( ! cmd.short_name) {
			console.log('Missing parameter: short_name'.red);
			return;
		}
		if ( ! cmd.libtype) {
			console.log('You did not specify a library type (javascript or java)'.red);
			return;
		}
		var ver = cmd.ver;
		if( ! cmd.ver ) {
			ver = "1.0";
		}
		if (( cmd.libtype !== 'java') && ( cmd.libtype !== 'javascript')) {
			console.log('You did not specify a library type of [javascript | java])'.red);
			return;
		}
		context.getContext(cmd, function() {
			
			var newLibrary = {
				name: cmd.libname,
				group_name: cmd.short_name ,
				lib_name: cmd.short_name ,
				version: ver  ,
				description:  cmd.comments ,
				doc_url: cmd.docurl || null,
				ref_url: cmd.refurl || null,
				code: "",
				system_only: false,
				logic_type:  cmd.libtype ,
				account_ident: context.account.ident
			};
			if( ! cmd.file){
			   cmd.file = '/dev/stdin';
			}
			var fileContent = fs.readFileSync(cmd.file);
			var data = fileContent.toString('base64');
			//base64 endcode this first
			newLibrary.code  = { type: "base64", length: data.length , value: data};
			var startTime = new Date();
			newLibrary["@metadata"] = {action:"MERGE_INSERT", key: "name"} ;
			client.put(loginInfo.url + "/logic_libraries", {
				data: newLibrary,
				headers: {
					Authorization: "CALiveAPICreator " + loginInfo.apiKey + ":1"
				}
			}, function(data) {
				var endTime = new Date();
				if (data.errorMessage) {
					console.log(data.errorMessage.red);
					return;
				}
				printObject.printHeader('Library was created, including:');
				var newLib = _.find(data.txsummary, function(p) {
					return p['@metadata'].resource === 'admin:logic_libraries';
				});
				if ( ! newLib) {
					console.log('CREATE PROJECT ERROR: unable to find newly created library'.red);
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
				var projIdent = cmd.project_ident;
				if ( ! projIdent) {
					projIdent = dotfile.getCurrentProject();
				}
				if(cmd.linkProject && projIdent !== null){
					var linkproject = { 
						//@metadata: {action: 'INSERT'}, 
						logic_library_ident: data.txsummary[0].ident , 
						project_ident: projIdent 
					};
					linkproject["@metadata"] = {action:"MERGE_INSERT"} ;
					client.put(loginInfo.url + "/admin:project_libraries", {
						data: linkproject,
						headers: { Authorization: "CALiveAPICreator " + loginInfo.apiKey + ":1"}
						}, function(data) {
						if (data.errorMessage) {
							console.log(("LinkProject Error: " + data.errorMessage).red);
							return;
						}
						if (data.length === 0) {
							console.log(("Error: no such project for library to link").red);
							return;
						}
						printObject.printHeader(trailer);
				  });	
				}
				
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
		
		context.getContext(cmd, function() {
		
			var fileContent = JSON.parse(fs.readFileSync(cmd.file));
			fileContent[0].account_ident = context.account.ident;
			fileContent[0].ident = null;
			var account_ident = context.account.ident;
			fileContent[0]["@metadata"] = {action:"MERGE_INSERT", key: "name"} ;
			var startTime = new Date();
			client.put(loginInfo.url + "/logic_libraries", {
				data: fileContent,
				headers: {Authorization: "CALiveAPICreator " + loginInfo.apiKey + ":1" }
				}, function(data) {
				var endTime = new Date();
				if (data.errorMessage) {
					console.log(data.errorMessage.red);
					return;
				}
				printObject.printHeader('Logic Library was created, including:');
				
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
			
				var trailer = "Request took: " + (endTime - startTime) + "ms";
				trailer += " - # objects touched: ";
				if (data.txsummary.length === 0) {
					console.log('No data returned'.yellow);
				}
				else {
					trailer += data.txsummary.length;
				}
				printObject.printHeader(trailer);
				var projIdent = cmd.project_ident;
				if ( ! projIdent) {
					projIdent = dotfile.getCurrentProject();
				}
				if(cmd.linkProject){
					var linkproject = { 
						//@metadata: {action: 'INSERT'}, 
						logic_library_ident: data.txsummary[0].ident , 
						project_ident: projIdent
					};
					linkproject["@metadata"] = {action:"MERGE_INSERT"} ;
					client.post(loginInfo.url + "/admin:project_libraries", {
						data: linkproject,
						headers: { Authorization: "CALiveAPICreator " + loginInfo.apiKey + ":1"}
						}, function(data) {
						if (data.errorMessage) {
							console.log(("Error: " + data.errorMessage).red);
							return;
						}
						if (data.length === 0) {
							console.log(("Error: no such project for library to link").red);
							return;
						}
						printObject.printHeader(trailer);
				  });	
				}
			
			})
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
		
		filter = "sysfilter=greater(ident: 1999 )";
		
		if (cmd.ident) {
			filter += "&sysfilter=equal(ident:" + cmd.ident + ")";
		} else if (cmd.short_name) {
			filter += "&sysfilter=equal(short_name:'" + cmd.short_name + "')";
		} else if (cmd.libname) {
			filter += "&sysfilter=equal(name:'" + cmd.libname + "')";
		} 
		
		var toStdout = false;
		if ( ! cmd.file) {
			toStdout = true;
		}

		client.get(loginInfo.url + "/logic_libraries?" + filter, {
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
				console.log(("Error: no such library found").red);
				return;
			}
			delete data[0].ident;
			data[0].account_ident = null;
			delete data[0]['@metadata'].links;
			data[0]['@metadata'].checksum = 'override';
			
			if (toStdout) {
				console.log(JSON.stringify(data, null, 2));
				var libcode = data[0].code;
				//console.log("libcode "+new Buffer(libcode.value.toString(), 'base64').toString('ascii'));
			} else {
				var exportFile = fs.openSync(cmd.file, 'w+', 0600);
				fs.writeSync(exportFile, JSON.stringify(data, null, 2));
				console.log(('Logic Library has been exported to file: ' + cmd.file).green);
			}
			
		});	
			
	}
}