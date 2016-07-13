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
		else if (action === 'create') {
			module.exports.create(cmd);
		}
		else {
			console.log('You must specify an action: list, create, import, export, or publish');
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
				table.cell("Username", p.username);
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
			});
			table.sort(['Name']);
			console.log(table.toString());
			printObject.printHeader("# gateway: " + data.length);
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
		var urlname = dotfile.getCurrentProjectUrl();
		if(! urlname ){
			console.log("You must select and use a project. $lacadmin project use --url_name myProjectName".red);
			return;
		}
		var url = loginInfo.url;
		var apiKey = loginInfo.apiKey;
		var idx = url.indexOf("/abl");
		var swaggerURL = url.substring(0,idx) +"/default/"+urlname+"/v1";
	
		var filter = null;
		var username = ""
		if( cmd.username){
			username = cmd.username;
		} else {
			console.log("Parameter Gateway '--username' missing".red);
			return;
		}
		var password = "";
		if( cmd.password){
			password = cmd.password;
		}  else {
			console.log("Parameter Gateway '--password' missing".red);
			return;
		}
		var apiGatewayHostname  = "";
		if( cmd.hostname){
			apiGatewayHostname = cmd.hostname;
		} else {
			console.log("Parameter Gateway endpoint '--hostname' missing".red);
			return;
		}
		
		if( !cmd.url_name){
			console.log("Parameter API Project '--url_name' missing".red);
			return;
		}
		
		if( !cmd.apiversion){
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
				 url: cmd.hostname,
   				 username: cmd.username,
   				 password: cmd.password,
    			 api_url_fragment: cmd.url_name,
    			 api_version: cmd.apiversion
			};
			console.log(gateway);
			var startTime = new Date();
			client.post(loginInfo.url + "/@gateway_publish", {
				data: gateway,
				headers: {
					Authorization: "CALiveAPICreator " + loginInfo.apiKey + ":1",
					"Content-Type" : "application/json"
				}
			}, function(data) {
				var endTime = new Date();
				if (data.errorMessage) {
					console.log("Publish Error "+ data.errorMessage.red);
					return;
				}
				printObject.printHeader('Gateway publish complete:');
				console.log(data);
				var trailer = "Request took: " + (endTime - startTime) + "ms";

				printObject.printHeader(trailer);
				
		});
	},
	create: function(cmd) {
	
		var client = new Client();
		var loginInfo = login.login(cmd);
		if ( ! loginInfo)
			return;

		if ( ! cmd.name) {
			console.log('Missing parameter: --name'.red);
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

		
		context.getContext(cmd, function() {
			
			var newGateway = {
				 name: cmd.name,
   				 username: cmd.username,
    			 url: cmd.hostname,
    			 comments: cmd.comments,
    			 is_active: true,
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
