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
	doAuthProvider: function(action, cmd) {
		if (action === 'list') {
			module.exports.list(cmd);
		}
		else if (action === 'create') {
			module.exports.create(cmd);
		}
		else if (action === 'delete') {
			module.exports.delete(cmd);
		}
		else if (action === 'linkProject') {
			module.exports.linkProject(cmd);
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
	linkProject: function(cmd){
	
		var client = new Client();
		
		var loginInfo = login.login(cmd);
		if ( ! loginInfo)
			return;
		var url = loginInfo.url;
		var apiKey = loginInfo.apiKey;
		
		context.getContext(cmd, function() {
		var filter = null;
		if ( cmd.ident) {
		   filter = 'sysfilter=equal(ident:'+cmd.ident+')';
		} else if(cmd.name){
			filter = "sysfilter=equal(name:'"+cmd.name+"')";
		} else {
			console.log('Missing parameter: ident or name'.red);
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
		
			//var filter = 'sysfilter=equal(ident:'+cmd.ident+')';
			client.get(url + "/authproviders?"+filter, {
				headers: {Authorization: "CALiveAPICreator " + apiKey + ":1"}
			}, function(data_auth) {
				if (data_auth.errorMessage ) {
					console.log(data_auth.errorMessage.red);
					return;
				} else if (data_auth.length === 0){
					console.log("Ident or name not found for auth provider" .red);
					return;
				}
				
				client.get(url + '/AllProjects/'+projIdent, {
					headers: {Authorization: "CALiveAPICreator " + apiKey + ":1"}
				}, function(data) {
					if (data.errorMessage ) {
						console.log(data.errorMessage.red);
						return;
					} else if (data.length === 0){
						console.log("Ident not found".red);
						return;
					}
					
					auth = data[0];
					var startTime = new Date();
					//auth.ident = data[0].ident;
					auth.authprovider_ident = data_auth[0].ident;
					client.put(url + '/AllProjects/'+projIdent, {
						data: auth,
						headers: { Authorization: "CALiveAPICreator " + loginInfo.apiKey + ":1" }
					}, function(data2) {
						var endTime = new Date();
						if (data2.errorMessage) {
							console.log(data2.errorMessage.red);
							return;
						}
						printObject.printHeader('Auth Provider was updated, including the following objects:');
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
					printObject.printHeader("Link authentication provider to current project ");
				});
			});
	  });
	},
	list: function(cmd) {
		var client = new Client();
		
		var loginInfo = login.login(cmd);
		if ( ! loginInfo)
			return;
		var url = loginInfo.url;
		var apiKey = loginInfo.apiKey;

		client.get(url + "/authproviders", {
			headers: {
				Authorization: "CALiveAPICreator " + apiKey + ":1"
			}
		}, function(data) {
			if (data.errorMessage) {
				console.log(data.errorMessage.red);
				return;
			}
			printObject.printHeader('All authentication providers');
			var table = new Table();
			_.each(data, function(p) {
				table.cell("Ident", p.ident);
				table.cell("Name", p.name);
				table.cell("createFunction", p.bootstrap_config_value);
				table.cell("ParamMap", p.param_map);
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
			table.sort(['Name']);
			console.log(table.toString());
			printObject.printHeader("# authentication providers: " + data.length);
		});
	},
	create: function(cmd) {
		var client = new Client();
		
		var loginInfo = login.login(cmd);
		if ( ! loginInfo)
			return;
		var url = loginInfo.url;
		var apiKey = loginInfo.apiKey;
		
		if ( ! cmd.name) {
			console.log('Missing parameter: name'.red);
			return;
		}
		
		if ( ! cmd.createFunction) {
			console.log('Missing parameter: createFunction'.red);
			return;
		}
		if ( ! cmd.paramMap) {
			console.log('Missing parameter: paramMap'.red);
			return;
		}
		if ( ! cmd.comments) {
			console.log('Missing parameter: comments'.red);
			return;
		}
		
		context.getContext(cmd, function() {
			//console.log('Current account: ' + JSON.stringify(context.account));
			
			var authProvider = {
				name: cmd.name,
				bootstrap_config_value: cmd.createFunction,
				param_map: cmd.paramMap,
				auth_type_ident:2,
				class_name:"com.kahuna.server.auth.JavaScriptAuthProvider",
				class_location:"",
				account_ident: context.account.ident,
				comments: cmd.comments
			};
			
			
			var startTime = new Date();
			client.post(loginInfo.url + "/authproviders", {
				data: authProvider,
				headers: {
					Authorization: "CALiveAPICreator " + loginInfo.apiKey + ":1"
				}
			}, function(data) {
				var endTime = new Date();
				if (data.errorMessage) {
					console.log(data.errorMessage.red);
					return;
				}
				printObject.printHeader('Auth Provider was created, including:');
				var newAuth = _.find(data.txsummary, function(p) {
					return p['@metadata'].resource === 'admin:authproviders';
				});
				if ( ! newAuth) {
					console.log('ERROR: unable to find newly created auth provider'.red);
					return;
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
			});
		});
	},
	delete: function(cmd) {
	console.log("delete");
		var client = new Client();
		
		var loginInfo = login.login(cmd);
		if ( ! loginInfo)
			return;
		var url = loginInfo.url;
		var apiKey = loginInfo.apiKey;
		
		if ( ! cmd.ident) {
			console.log('Missing parameter: ident'.red);
			return;
		}
		var filt = null;
		if (cmd.ident) {
			filt = "equal(ident:'" + cmd.ident + "')";
		}
		else {
			console.log('Missing parameter: please specify auth provider ident '.red);
			return;
		}
		
		client.get(loginInfo.url + "/authproviders?sysfilter=" + filt, {
			headers: {
				Authorization: "CALiveAPICreator " + loginInfo.apiKey + ":1"
			}
		}, function(data) {
			if (data.errorMessage) {
				console.log(("Error: " + data.errorMessage).red);
				return;
			}
			if (data.length === 0) {
				console.log(("Error: no such auth provider").red);
				return;
			}
			if (data.length > 1) {
				console.log(("Error: more than one auth provider for the given ident: " + filter).red);
				return;
			}
			var provider = data[0];
			var startTime = new Date();
			client['delete'](provider['@metadata'].href + "?checksum=" + provider['@metadata'].checksum, {
				headers: {
					Authorization: "CALiveAPICreator " + loginInfo.apiKey + ":1"
				}
			}, function(data2) {
				var endTime = new Date();
				if (data2.errorMessage) {
					console.log(data2.errorMessage.red);
					return;
				}
				printObject.printHeader('Auth Provider was deleted: '+data2.txsummary);
				
				
				var delProj = _.find(data2.txsummary, function(p) {
					return p['@metadata'].resource === 'admin:authproviders';
				});
				if ( ! delProj) {
					console.log('ERROR: unable to find deleted project'.red);
					return;
				}
				if (cmd.verbose) {
					_.each(data2.txsummary, function(obj) {
						printObject.printObject(obj, obj['@metadata'].entity, 0, obj['@metadata'].verb);
					});
				}
				else {
					printObject.printObject(delProj, delProj['@metadata'].entity, 0, delProj['@metadata'].verb);
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
	export: function(cmd) {
		var client = new Client();
		
		var loginInfo = login.login(cmd);
		if ( ! loginInfo)
			return;
		var url = loginInfo.url;
		var apiKey = loginInfo.apiKey;
		
		
		var filter = null;
		if (cmd.ident) {
			filter = "equal(ident:" + cmd.ident + ")";
		} else if (cmd.name) {
			filter = "equal(name:'" + cmd.name + "')";
		} else {
			console.log('Missing parameter: please specify auth provider (use list) ident or name '.red);
			return;
		}
		var toStdout = false;
		if ( ! cmd.file) {
			toStdout = true;
		}
		
		client.get(loginInfo.url + "/authproviders?sysfilter=" + filter, {
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
				console.log(("Error: no such project").red);
				return;
			}
			delete data[0].ident;
			data[0].account_ident = null;
			delete data[0]['@metadata'].links;
			if (toStdout) {
				console.log(JSON.stringify(data, null, 2));
			} else {
				var exportFile = fs.openSync(cmd.file, 'w+', 0600);
				fs.writeSync(exportFile, JSON.stringify(data, null, 2));
				console.log(('Auth Provider has been exported to file: ' + cmd.file).green);
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
			fileContent[0].account_ident = context.account.ident;
			fileContent[0].ident = null;
			var startTime = new Date();
			client.post(loginInfo.url + "/authproviders", {
				data: fileContent,
				headers: {Authorization: "CALiveAPICreator " + loginInfo.apiKey + ":1" }
				}, function(data) {
				var endTime = new Date();
				if (data.errorMessage) {
					console.log(data.errorMessage.red);
					return;
				}
				printObject.printHeader('Auth Provider was created, including:');
				
				var newAuth = _.find(data.txsummary, function(p) {
					return p['@metadata'].resource === 'admin:authproviders';
				});
				if ( ! newAuth) {
					console.log('ERROR: unable to find imported auth provider'.red);
					return;
				}
				if (cmd.verbose) {
					_.each(data.txsummary, function(obj) {
						printObject.printObject(obj, obj['@metadata'].entity, 0, obj['@metadata'].verb);
					});
				}
				else {
					printObject.printObject(newAuth, newAuth['@metadata'].entity, 0, newAuth['@metadata'].verb);
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
	}
};
