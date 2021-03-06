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
var https = require('https');

module.exports = {
	doGateway: function(action, cmd) {
	    if (action === 'publish') {
			module.exports.publish(cmd);
		}
		else if (action === 'list') {
			module.exports.list(cmd);
		}
		else if (action === 'export') {
			module.exports.export(cmd);
		}
		else if (action === 'import') {
			module.exports.import(cmd);
		}
		else if (action === 'delete') {
			module.exports.delete(cmd);
		}
		else if (action === 'create') {
			module.exports.create(cmd);
		}
		else {
			console.log('You must specify an action: list, create, import, delete, export, or publish');
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
		var verboseDisplay = "";
		client.get(url + "/admin:gateways?pagesize=100&sysorder=(name:asc_uc,name:desc)", {
			headers: {
				Authorization: "CALiveAPICreator " + apiKey + ":1",
				"Content-Type" : "application/json"
			}
		}, function(data) {
			if (data.errorMessage) {
				console.log(data.errorMessage.red);
				return;
			}
			printObject.printHeader('All Gateway Definitions');
			var table = new Table();
			_.each(data, function(p) {
				table.cell("Ident", p.ident);
				table.cell("Name", p.name);
				table.cell("Username", p.default_username);
				table.cell("URL", p.url);
				table.cell("Active", p.is_active);
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
					verboseDisplay +=  "\n";
					verboseDisplay += "lacadmin gateway create --name \"" + p.name +"\"";
					verboseDisplay +=  " --username "+ p.default_username;
					verboseDisplay +=  " --url \""+p.url +"\"";
					if( p.comments ) {
						verboseDisplay +=  " --comments \""+ comments +"\"";
					}
					verboseDisplay +=  "\n";
				}
			});
			table.sort(['Name']);
			console.log(table.toString());
			printObject.printHeader("# gateway: " + data.length);
			if(cmd.verbose) {
				console.log(verboseDisplay);
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
		
		
		var filter = "";
		
		if (cmd.ident) {
			filter = "?sysfilter=equal(ident:" + cmd.ident + ")";
		} 
		
		var toStdout = false;
		if ( ! cmd.file) {
			toStdout = true;
		}
		
		client.get(url + "/admin:gateways" + filter, {
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
				console.log(("Gateway definitions not found").red);
				return;
			}
			for(var i = 0; i < data.length ; i++){
				delete data[i].ident;
				data[i].account_ident = null;
				delete data[i]['@metadata'];
			}
			if (toStdout) {
				console.log(JSON.stringify(data, null, 2));
			} else {
				var exportFile = fs.openSync(cmd.file, 'w+', 0600);
				fs.writeSync(exportFile, JSON.stringify(data, null, 2));
				console.log(('Gateway definitions have been exported to file: ' + cmd.file).green);
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
			if(Array.isArray(fileContent)){
				for(var i = 0 ; i < fileContent.length; i++){
					fileContent[i].account_ident = context.account.ident;
					delete fileContent[i].ident;
					delete fileContent[i].ts;
					fileContent[i]["@metadata"] = {action:"MERGE_INSERT", key: ["account_ident","name"]} ;
				} 
			}
			var startTime = new Date();
			client.put(loginInfo.url + "/admin:gateways", {
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
				printObject.printHeader('Gateway definition was imported:');

				var trailer = "Request took: " + (endTime - startTime) + "ms";
				if(data.statusCode == 200 ){
					
				} else {		
					var newAuth = _.find(data.txsummary, function(p) {
						return p['@metadata'].resource === 'admin:gateway';
					});
					if ( ! newAuth) {
						console.log('ERROR: unable to find imported gateway definition'.red);
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
				
					trailer += " - # objects touched: ";
					if (data.txsummary.length === 0) {
						console.log('No data returned'.yellow);
					}
					else {
						trailer += data.txsummary.length;
					}
				}
				printObject.printTrailer(trailer);
			})
		});
	},
	publish: function(cmd) {
		var client = new Client();
		
		var loginInfo = login.login(cmd);
		if ( ! loginInfo)
			return;
		var url = loginInfo.url;
		var apiKey = loginInfo.apiKey;
		if(! cmd.ident ){
			   console.log("You must pass the ident for a specific gateway you intend to publish".red);
			   return;
		   }
		client.get(url + "/admin:gateways?sysfilter=equal(ident:"+cmd.ident+")", {
			headers: {
				Authorization: "CALiveAPICreator " + apiKey + ":1",
				"Content-Type" : "application/json"
			}
		}, function(data) {
			if (data.errorMessage) {
				console.log(data.errorMessage.red);
				return;
			}
			console.log(data);
		   	var url_name = data.api_url_fragment;
		   	if(cmd.url_name ){
		   		url_name = cmd.url_name;
		   	} 
		   	if(!url_name ){
			   console.log("Gateway definition missing --url_name".red);
			   return;
		   	}
	
		   	var filter = null;
		   	var username = data.default_username
		   	if( cmd.username){
			   username = cmd.username;
		   	} 
		   	if( !username){
			   console.log("Parameter Gateway '--username' missing".red);
			   return;
		   	}
		   	var password = data.password;
		   	if( cmd.password){
			   password = cmd.password;
		   	}  
		   	if( !password){
			   console.log("Parameter Gateway '--password' missing".red);
			   return;
		   	}
		   	var apiGatewayHostname  = data.url;
		   	if( cmd.hostname){
			   apiGatewayHostname = cmd.hostname;
		   	} 
	
			if( !apiGatewayHostname){
			   console.log("Parameter Gateway endpoint '--hostname' missing".red);
			   return;
		   	}
		
		   var apiversion = data.apiversion;
		   if( cmd.apiversion){
		   		apiversion = cmd.apiversion;
		   } 
		    if( !apiversion){
			   console.log("Parameter  API Project verison '--apiversion' missing".red);
			   return;
		   }
		
		   var headers = {};
		   if(cmd.useAuthToken){
			   headers = {	
				   Authorization: "CALiveAPICreator " + apiKey + ":1",
				   "Content-Type" : "application/json"
				}
		   }		
			   var gateway = {
					url: apiGatewayHostname,
					username: username,
					password: password,
					api_url_fragment: url_name,
					api_version: apiversion
			   };
			   console.log(gateway);
			   var startTime = new Date();
			   client.post(loginInfo.url + "/@gateway_publish", {
				   data: gateway,
				   headers: {
					   Authorization: "CALiveAPICreator " + loginInfo.apiKey + ":1",
					   "Content-Type" : "application/json"
				   }
			   }, function(gwdata) {
				   var endTime = new Date();
				   if (gwdata.errorMessage) {
					   console.log("Publish Error "+ gwdata.errorMessage.red);
					   return;
				   }
				   printObject.printHeader('Gateway publish complete:');
				   console.log(data);
				   var trailer = "Request took: " + (endTime - startTime) + "ms";

				   printObject.printHeader(trailer);	
		    });
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
		} else if(cmd.gateway_name) {
			filt = "equal(name:'" + cmd.gateway_name +"')";
        } else {
                console.log('Missing parameter: please specify gateway_name or ident'.red);
                return;
        }
		
		client.get(loginInfo.url + "/admin:gateways?sysfilter=" + filt, {
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
				console.log(("Error: more than one gateways for the given condition: " + filt).red);
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
				printObject.printHeader('Gateway was deleted, including the following objects:');
				
				
				var delLibrary = _.find(data2.txsummary, function(p) {
					return p['@metadata'].resource === 'admin:gateways';
				});
				if ( ! delLibrary) {
					console.log('ERROR: unable to find deleted gateway'.red);
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

		if ( ! cmd.gateway_name) {
			console.log('Missing parameter: --gateway_name'.red);
			return;
		}
		if ( ! cmd.hostname) {
			console.log('Missing parameter: --hostname'.red);
			return;
		}
		if ( ! cmd.project_name) {
			//console.log('Missing parameter: --project_name'.red);
			//return;
		}
		var active = true;
		if(cmd.active) {
			active = cmd.active == 'true';
		}
		
		context.getContext(cmd, function() {
			
			var newGateway = {
				 name: cmd.gateway_name,
   				 default_username: cmd.username,
    			 url: cmd.hostname,
    			 comments: cmd.comments,
    			 is_active: active,
				 account_ident: context.account.ident
			};
			
			var startTime = new Date();
			newGateway["@metadata"] = {action:"MERGE_INSERT", key: ["account_ident","name"]} ;
			client.put(loginInfo.url + "/admin:gateways", {
				data: newGateway,
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
				printObject.printHeader('Gateway definition was created, including:');
				var newgw = _.find(data.txsummary, function(p) {
					return p['@metadata'].resource === 'admin:gateways';
				});
				if ( ! newgw) {
					console.log('Create Gateway ERROR: unable to find newly created gateway'.red);
					return;
				}
				if (cmd.verbose) {
					_.each(data.txsummary, function(obj) {
						printObject.printObject(obj, obj['@metadata'].entity, 0, obj['@metadata'].verb);
					});
				}
				else {
					printObject.printObject(newgw, newgw['@metadata'].entity, 0, newgw['@metadata'].verb);
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
				
			});
		});
    
    }
};
