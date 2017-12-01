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
	doApplication: function(action, cmd) {
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
			console.log('You must specify an action: list, delete, import, or export');
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

		client.get(url + "/applications"+"?pagesize=100", {
			headers: {
				Authorization: "CALiveAPICreator " + apiKey + ":1",
				"Content-Type" : "application/json"
			}
		}, function(data) {
			if (data.errorMessage) {
				console.log(data.errorMessage.red);
				return;
			}
			printObject.printHeader('All Data Explorer Applications');
			var table = new Table();
			var verboseDisplay = "";
			_.each(data, function(p) {
				table.cell("Ident", p.ident);
				table.cell("Name", p.name);
				table.cell("ProjectIdent", p.project_ident);
				table.cell("SkinIdent", p.skin_ident);
				var comments = p.description;
				if ( ! comments) {
					comments = "";
				}
				else if (comments.length > 50){
					comments = comments.substring(0, 47) + "...";
				}
				comments = comments.replace("\n"," ");
				comments = comments.replace("\n"," ");
				table.cell("Description", comments);
				table.newRow();
				if(cmd.verbose) {
					 verboseDisplay += "\n";
					 verboseDisplay += "lacadmin application export --application_name "+p.name+"  --file 'APPLICATION_"+p.name + ".json'\n";
					 verboseDisplay += "#lacadmin application import --file 'APPLICATION_"+p.name + ".json'\n";
				 }
			});
			table.sort(['Name']);
			console.log(table.toString());
			printObject.printTrailer("# applications: " + data.length);
			if(cmd.verbose) {
				console.log(verboseDisplay);
			}
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
		if (cmd.application_name) {
			filt = "equal(name:'" + cmd.application_name + "')";
		}
		else if (cmd.ident) {
			filt = "equal(ident:" + cmd.ident + ")";
		}
		else {
			console.log('Missing parameter: please specify either ident or application_name'.red);
			return;
		}
		
		client.get(loginInfo.url + "/applications?sysfilter=" + filt, {
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
				console.log(("Application "+ cmd.ident +"  does not exist").yellow);
				return;
			}
			if (data.length > 1) {
				console.log(("Error: more than one application for the given condition: " + filter).red);
				return;
			}
			var app = data[0];
			var startTime = new Date();
			client['delete'](app['@metadata'].href + "?checksum=" + app['@metadata'].checksum, {
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
				printObject.printHeader('Application was deleted, including the following objects:');

				var delProj = _.find(data2.txsummary, function(p) {
					return p['@metadata'].resource === 'admin:applications';
				});
				if ( ! delProj) {
					console.log('ERROR: unable to find deleted applications'.red);
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

		var filter = null;
		var projIdent = cmd.ident;
		filter = "equal(ident:" + projIdent + ")";
		if (cmd.url_name) {
			filter = "equal(url_name:'" + cmd.url_name + "')";
		} else if (cmd.project_name) {
			filter = "equal(name:'" + cmd.project_name + "')";
		} else if ( ! projIdent) {
			projIdent = dotfile.getCurrentProject();
			 if(! projIdent){
				console.log('No current project selected'.red);
				return;
			 }
			 filter = "equal(ident:" + projIdent + ")";
		} else {
			console.log('Missing parameter: please specify either project_name or url_name'.red);
			return;
		}
		
		var toStdout = false;
		if ( ! cmd.file) {
			toStdout = true;
		}
		
		client.get(loginInfo.url + "/ProjectExport?sysfilter=" + filter, {
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
				console.log(("Error: no such project").red);
				return;
			}
			var output = [];
			var apps = data[0].Applications;
			for(var i = 0; i < apps.length ; i++){
					delete apps[i]["ident"];
					delete apps[i]["ts"];
					delete apps[i]["project_ident"];
					delete apps[i]["@metadata"];
					if(Array.isArray(apps[i]["ApplicationTableSettings"]) && apps[i]["ApplicationTableSettings"].length > 0) {
					//console.log( JSON.stringify(data[i]["parameters"]));
					   for(var j = 0; j < apps[i]["ApplicationTableSettings"].length ; j++){
					  		//console.log( j +" : " + JSON.stringify(data[i]["parameters"]));
						   delete apps[i]["ApplicationTableSettings"][j]["@metadata"];
						   delete apps[i]["ApplicationTableSettings"][j]["ts"];
						   delete apps[i]["ApplicationTableSettings"][j]["ident"];
						   delete apps[i]["ApplicationTableSettings"][j]["app_ident"];
					   }
					}
					if(Array.isArray(apps[i]["ApplicationSkins"]) && apps[i]["ApplicationSkins"].length > 0) {
					//console.log( JSON.stringify(data[i]["parameters"]));
					   for(var j = 0; j < apps[i]["ApplicationSkins"].length ; j++){
					  		//console.log( j +" : " + JSON.stringify(data[i]["parameters"]));
						   delete apps[i]["ApplicationSkins"][j]["@metadata"];
						   delete apps[i]["ApplicationSkins"][j]["ts"];
						   delete apps[i]["ApplicationSkins"][j]["ident"];
						   delete apps[i]["ApplicationSkins"][j]["app_ident"];
					   }
					}
					output.push(apps[i]);
				}
			if (toStdout) {
				console.log(JSON.stringify(output, null, 2));
			}
			else {
				var exportFile = fs.openSync(cmd.file, 'w+', 0600);
				fs.writeSync(exportFile, JSON.stringify(output, null, 2));
				console.log(('Applications has been exported to file: ' + cmd.file).green);
			}
		});
	},
	
	import: function(cmd) {
		var client = new Client();
		var loginInfo = login.login(cmd);
		if ( ! loginInfo) {
			return;
		}

		if ( ! cmd.file) {
			cmd.file = '/dev/stdin';
		}
		var projIdent = cmd.ident || dotfile.getCurrentProject();;
		if(! projIdent){
		   console.log('No current project selected'.red);
		   return;
		}
		var fileContent = JSON.parse(fs.readFileSync(cmd.file));
		delete fileContent[0].ts;
		delete fileContent[0].ident;
		fileContent[0].project_ident = projIdent;
		var startTime = new Date();
		client.post(loginInfo.url + "/ProjectExport.Applications", {
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
			printObject.printHeader('Application was created, including:');
			if(data.statusCode == 200 ){
				console.log("Request took: " + (endTime - startTime) + "ms");
				return;
			} 	
			var newProj = _.find( data.txsummary, function(p) {
				return p['@metadata'].resource === 'ProjectExport.Applications'
			});
			if ( ! newProj) {
				console.log('ERROR: unable to find imported applications'.red);
				return;
			}
			if (cmd.verbose) {
				_.each(data.txsummary, function(obj) {
					printObject.printObject(obj, obj['@metadata'].entity, 0, obj['@metadata'].verb);
				});
			}
			else {
				printObject.printObject(newProj, newProj['@metadata'].entity, 0, newProj['@metadata'].verb);
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
		});
	}
};
