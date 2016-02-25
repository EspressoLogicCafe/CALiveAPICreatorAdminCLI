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
		if (action === 'publishReadSwagger') {
			module.exports.publishReadSwagger(cmd);
		}
		else if (action === 'publish') {
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
			console.log('You must specify an action: list, create, import, export, publishReadSwagger, or publish');
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

		client.get(url + "/admin:gateway?pagesize=100&sysorder=(name:asc_uc,name:desc)", {
			headers: {
				Authorization: "CALiveAPICreator " + apiKey + ":1"
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
	
	publishReadSwagger: function(cmd) {
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
		}
		var password = "";
		if( cmd.password){
			password = cmd.password;
		}
		var apiGatewayHostname  = "";
		if( cmd.hostname){
			apiGatewayHostname = cmd.hostname;
		}
		var ver = "1.0";
		if(cmd.version){
			ver = cmd.version;
		}
		var port = 8443;
		if(cmd.port){
			port = cmd.port;
		}
		var toStdout = false;
		if ( ! cmd.file) {
			toStdout = true;
		}
		console.log("GET Swagger "+swaggerURL+"/@docs");
		var headers = {};
		if(cmd.useAuthToken){
		 	headers = {	Authorization: "CALiveAPICreator " + apiKey + ":1" };
		}
		//var fileContent = fs.readFileSync(cmd.file);
		client.get(swaggerURL + "/@docs", {
			headers: headers
		}, function(data) {
			//console.log('get result: ' + JSON.stringify(data, null, 2));
			if (data.errorMessage) {
				console.log(("Swagger Error: " + data.errorMessage).red);
				return;
			}
			if (data.length === 0) {
				console.log(("Error: no swagger @doc found for login. Try --useAuthToken").red);
				return;
			}
			if(cmd.file){
				var exportFile = fs.openSync(cmd.file, 'w+', 0600);
				fs.writeSync(exportFile, JSON.stringify(data, null, 2));
				console.log(('Swagger has been exported to file: ' + cmd.file).green);
			}
			//now publish to gateway.
			process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
			var gateway = "https://"+apiGatewayHostname+":"+port+"/lacman/1.0/publish";
			var auth = username+":"+password; 
			console.log("Connecting to; "+gateway);
			
			var options = {
			  hostname: apiGatewayHostname,
			  headers: {'content-type': 'application/json;charset=UTF-8'},
			  port: port,
			  path: '/lacman/1.0/publish',
			  auth: auth,
			  method: 'PUT',
			  rejectUnauthorized: false,
  			  agent: false,
  			  headers: {
				  'Content-Type': 'application/json',
				  'Content-Length': (JSON.stringify(data).length)
			  }
			};
			console.log("Swagger doc data length "+(JSON.stringify(data).length));
			 var req = https.request(options, (res) => {
			  console.log('statusCode: ', res.statusCode);
			  console.log('headers: ', res.headers);
			  	  
			  res.on('data', function (chunk) {
         		console.log('Response: ' + chunk);
      		  });
			  res.on('end', function(d) {
    			//res.send(data)
  			  });
			});
			req.write(JSON.stringify(data));		
			req.on('error', (e) => {
			  console.error(e);
			});
			
  			req.end();
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
			filter = "sysfilter=equal(ident:" + cmd.ident + ")";
		} else if (cmd.name) {
			filter = "sysfilter=equal(name:'" + cmd.name + "')";
		} 
		
		var toStdout = false;
		if ( ! cmd.file) {
			toStdout = true;
		}
		
		client.get(loginInfo.url + "/admin:gateway?" + filter, {
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
					fileContent[i]["@metadata"] = {action:"MERGE_INSERT", key: ["account_ident","name"]} ;
				} 
			}
			var startTime = new Date();
			client.put(loginInfo.url + "/admin:gateway", {
				data: fileContent,
				headers: {Authorization: "CALiveAPICreator " + loginInfo.apiKey + ":1" }
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
			console.log("Parameter '--username' missing".red);
			return;
		}
		var password = "";
		if( cmd.password){
			password = cmd.password;
		}  else {
			console.log("Parameter '--password' missing".red);
			return;
		}
		var apiGatewayHostname  = "";
		if( cmd.hostname){
			apiGatewayHostname = cmd.hostname;
		} else {
			console.log("Parameter '--hostname' missing".red);
			return;
		}
		
		if( !cmd.file){
			console.log("Parameter '--file' missing".red);
			return;
		}
		var ver = "1.0";
		if(cmd.version){
			ver = cmd.version;
		}
		var port = 8443;
		if(cmd.port){
			port = cmd.port;
		}
		var toStdout = false;
		if ( ! cmd.file) {
			toStdout = true;
		}
		
		var headers = {};
		if(cmd.useAuthToken){
		 	headers = {	Authorization: "CALiveAPICreator " + apiKey + ":1" };
		}
		//var ;
		
			if(cmd.file){
				data = fs.readFileSync(cmd.file);
				console.log(('Swagger has been exported to file: ' + cmd.file).green);
			}
			//now publish to gateway.
			process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
			var gateway = "https://"+apiGatewayHostname+":"+port+"/lacman/1.0/publish";
			var auth = username+":"+password; 
			console.log("Connecting to; "+gateway);
			
			var options = {
			  hostname: apiGatewayHostname,
			  headers: {'content-type': 'application/json;charset=UTF-8'},
			  port: port,
			  path: '/lacman/1.0/publish',
			  auth: auth,
			  method: 'PUT',
			  rejectUnauthorized: false,
  			  agent: false,
  			  headers: {
				  'Content-Type': 'application/json',
				  'Content-Length': data.length
			  }
			};
			console.log("Swagger doc data length " + data.length);
			 var req = https.request(options, (res) => {
			  console.log('statusCode: ', res.statusCode);
			  console.log('headers: ', res.headers);
			  	  
			  res.on('data', function (chunk) {
         		console.log('Response: ' + chunk);
      		  });
			  res.on('end', function(d) {
    			//res.send(data)
  			  });
			});
			req.write(data);		
			req.on('error', (e) => {
			  console.error(e);
			});
			
  			req.end();	
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
			client.put(loginInfo.url + "/admin:gateway", {
				data: newGateway,
				headers: {
					Authorization: "CALiveAPICreator " + loginInfo.apiKey + ":1"
				}
			}, function(data) {
				var endTime = new Date();
				if (data.errorMessage) {
					console.log(data.errorMessage.red);
					return;
				}
				printObject.printHeader('Gateway definition was created, including:');
				var newgw = _.find(data.txsummary, function(p) {
					return p['@metadata'].resource === 'admin:gateway';
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
