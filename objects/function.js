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
	doFunction: function(action, cmd) {
		if (action === 'list') {
			module.exports.list(cmd);
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
			console.log('You must specify an action: list, import, or  export');
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
		//var idx = url.indexOf("/abl");
		//var functionURL = url.substring(0,idx) +"/default/"+urlname+"/v1";
	var filter = "/AllFunctions?sysfilter=equal(project_ident:"+projIdent+")";
	client.get(url + filter, {
			headers: {
				Authorization: "CALiveAPICreator " + apiKey + ":1",
				"Content-Type" : "application/json"
			}
		},function(data) {
				if (data.errorMessage) {
					console.log(data.errorMessage.red);
					return;
				}
				printObject.printHeader('Functions: ');
				var table = new Table();
				_.each(data, function(p) {
				 var parameters = "(";
				 var parmsep = "";
				_.each(p.parameters, function(arg) {
					parameters += parmsep + arg.type_name + " "+ arg.name;
					parmsep = ",";
				 });
				 parameters += ")";
				 var sep = "";
				 //need a resource to return both functions and parameters
					table.cell("Ident", p.ident);
					table.cell("Name", p.name);
					table.cell("Parameters",parameters);
					table.cell("Is Active", p.is_active);
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
				
				table.sort(['Name', 'name']);
				if (data.length === 0) {
					console.log('There are no functions defined for this API project'.yellow);
				}
				else {
					console.log(table.toString());
				}
				printObject.printHeader("# functions: " + data.length);
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
			filt = "equal(ident:" + cmd.ident + ")";
		}
		else {
			console.log('Missing parameter: please specify either name or ident'.red);
			return;
		}
		
		client.get(loginInfo.url + "/admin:functions?sysfilter=" + filt, {
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
				console.log(("Function not found").red);
				return;
			}
			if (data.length > 1) {
				console.log(("Error: more than one function found for the given condition: " + filter).red);
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
				printObject.printHeader('Function was deleted, including the following objects:');
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
		
		var toStdout = false;
		if ( ! cmd.file) {
			toStdout = true;
		}
		var projIdent = cmd.project_ident;
		if ( ! projIdent) {
			projIdent = dotfile.getCurrentProject();
			if ( ! projIdent) {
				console.log('There is no current project.'.yellow);
				return;
			}
		}
		var filt = "";
		if (cmd.ident) {
			filt = "&sysfilter=equal(ident:" + cmd.ident + ")";
		}
		var output = [];
		var filter = "/AllFunctions?sysfilter=equal(project_ident:"+projIdent+")" + filt;
		client.get(url + filter, {
				headers: {
					Authorization: "CALiveAPICreator " + apiKey + ":1",
					"Content-Type" : "application/json"
				}
			},function(data) {
				//console.log('get result: ' + JSON.stringify(data, null, 2));
				if (data.errorMessage) {
					console.log(("Error: " + data.errorMessage).red);
					return;
				}
				if (data.length === 0) {
					console.log(("Function found").red);
					return;
				}
				for(var i = 0; i < data.length ; i++){
					delete data[i]["ident"];
					delete data[i]["@metadata"];
					if(Array.isArray(data[i]["parameters"]) && data[i]["parameters"].length > 0) {
					//console.log( JSON.stringify(data[i]["parameters"]));
					   for(var j = 0; j < data[i]["parameters"].length ; j++){
					  		//console.log( j +" : " + JSON.stringify(data[i]["parameters"]));
						   delete data[i].parameters[j]["@metadata"];
						   delete data[i].parameters[j]["type_name"];
						   delete data[i].parameters[j]["ident"];
						   delete data[i].parameters[j]["function_ident"];
					   }
					}
					output.push(data[i]);
					//console.log(JSON.stringify(data[i],null,2));
				}
				if (toStdout) {
					console.log(JSON.stringify(output, null, 2));
				} else {
					var filename = cmd.file;
					var exportFile = fs.openSync(filename, 'w+', 0600);
					fs.writeSync(exportFile, JSON.stringify(output, null, 2));
					console.log(('Functions have been exported to file: ' + filename).green);
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
		var projIdent = cmd.project_ident;
		if ( ! projIdent) {
			projIdent = dotfile.getCurrentProject();
			if ( ! projIdent) {
				console.log('There is no current project.'.yellow);
				return;
			}
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
			//fix up the parent/child relationships
			//create each parent admin:functions
			// for each parameter link admin:function ident to admin:function_parameters function_ident
			if(Array.isArray(fileContent)){
				for(var i = 0 ; i < fileContent.length; i++){
					fileContent[i].project_ident = curProj;
					delete fileContent[i].ident;
					if(Array.isArray(fileContent[i]["parameters"]) && fileContent[i]["parameters"].length > 0) {
					//console.log( JSON.stringify(data[i]["parameters"]));
					   for(var j = 0; j < fileContent[i]["parameters"].length ; j++){
					   		delete fileContent[i].parameters[j]["ident"];
						   	delete fileContent[i].parameters[j]["function_ident"];
					   }
					}
				} 
			} else {
				fileContent[i].project_ident = curProj;
					delete fileContent[i].ident;
					if(Array.isArray(fileContent[i]["parameters"]) && fileContent[i]["parameters"].length > 0) {
					//console.log( JSON.stringify(data[i]["parameters"]));
					   for(var j = 0; j < fileContent[i]["parameters"].length ; j++){
					   		delete fileContent[i].parameters[j]["ident"];
						   	delete fileContent[i].parameters[j]["function_ident"];
					   }
					}
			}
			var startTime = new Date();
			client.post(loginInfo.url + "/AllFunctions", {
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
				printObject.printHeader('Functions imported, including:');
				var trailer = "Request took: " + (endTime - startTime) + "ms";
				if(data.statusCode == 200){
					console.log(trailer);
				} else { 
					var newSort = _.find(data.txsummary, function(p) {
						return p['@metadata'].resource === 'AllFunctions';
					});
					if ( ! newSort) {
						console.log('ERROR: unable to find imported functions'.red);
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
					trailer += " - # objects touched: ";
					if (data.txsummary.length === 0) {
						console.log('No data returned'.yellow);
					}
					else {
						trailer += data.txsummary.length;
					}
				}
				printObject.printHeader(trailer);
			})
		});
	  });
	}
};
