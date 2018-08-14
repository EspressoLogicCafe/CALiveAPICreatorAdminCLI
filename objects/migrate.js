var Client = require('node-rest-client').Client;
var colors = require('colors');
var _ = require('underscore');
var Table = require('easy-table');
var fs = require('fs');
var context = require('./context.js');
var login = require('../util/login.js');
var printObject = require('../util/printObject.js');
var dotfile = require('../util/dotfile.js');
var api = require("./api.js");

module.exports = {
	doMigrate: function(action, cmd) {
	    if (action === 'list') {
			module.exports.list2(cmd);
		}
		if (action === 'plan') {
			module.exports.plan(cmd);
		}
		else if (action === 'exportRepos') {
			module.exports.exportProjects(cmd);
		}
		else if (action === 'importLib') {
			module.exports.importLib(cmd);
		}
		else if (action === 'importAuth') {
			module.exports.importAuth(cmd);
		}
		else if (action === 'importProject') {
			module.exports.importProject(cmd);
		}
		else {
			console.log('You must specify an action: exportRepos');
		}
	},
	plan: function(cmd) {
		var client = new Client();
		var loginInfo = login.login(cmd);
		if ( ! loginInfo)
			return;
		var url = loginInfo.url;
		var apiKey = loginInfo.apiKey;
		if(!cmd.from) {
			console.log("Missing --from parameter (e.g. 3.1, 3.2, 4.0, 4.1, 5.0".red);
			return;
		}
		console.log('Migration Inventory');
		var table = "";
		var accountCommands = [ "authproviders","gateways", "managed_data_servers","projects"];
		var projectCommands =	[ "logic_libraries", "dbaseschemas", "functions", "handlers", "eventhandlers","named_sorts","named_filters", "resources","topics", "roles", "rules" ];

		for(var i in accountCommands) {
			var endpoint = accountCommands[i];
			client.get(url + "/"+ endpoint+"?pagesize=1000", {
				headers: {
					Authorization: "CALiveAPICreator " + apiKey + ":1",
					"Content-Type" : "application/json"
				}
			}, function(data) {
				if (data.errorMessage) {
					console.log(data.errorMessage.red);
					return;
				}
				//console.log(data);
				if(data.length > 0) {
					var href = data[0]["@metadata"].href;
					console.log(href);
					console.log(data.length);
				}
			});
		}
		console.log(table);
	},
	list: function (cmd) {
		var client = new Client();

		var loginInfo = login.login(cmd);
		if ( ! loginInfo)
			return;
		var url = loginInfo.url;
		var apiKey = loginInfo.apiKey;

		client.get(url + "/projects"+"?pagesize=100", {
			headers: {
				Authorization: "CALiveAPICreator " + apiKey + ":1",
				"Content-Type" : "application/json"
			}
		}, function(data) {
			if (data.errorMessage) {
				console.log(data.errorMessage.red);
				return;
			}
			printObject.printHeader('All projects');
			var table = new Table();
			_.each(data, function(p) {
				table.cell("Ident", p.ident);
				table.cell("Name", p.name);
				table.cell("Enabled", p.is_active);
				table.cell("URL", p.url_name);
				var comments = p.comments;
				if ( ! comments) {
					comments = "";
				}
				else if (comments.length > 50){
					comments = comments.substring(0, 47) + "...";
				}
				comments = comments.replace("\n"," ");
				comments = comments.replace("\n"," ");
				table.cell("Comments", comments);
				table.newRow();
			});
			table.sort(['Name']);
			console.log(table.toString());
			printObject.printTrailer("# projects: " + data.length);
		});
	},
	exportRepos: function(cmd) {
		if (!cmd.directory) {
			console.log(("--directory must exist and is required  " ).red);
			return;
		}

		var path = "lacmigration";
		if(cmd.directory){
			path = cmd.directory;
		} else {
			cmd.directory = path;
		}
		fs.mkdir(path,function(e){
			if(!e || (e && e.code === 'EEXIST')){
				//do something with contents
			} else {
				//debug
				console.log(("--directory does not exist:  "+ cmd.directory ).red);
				return;
			}
		});
		var client = new Client();

		var loginInfo = login.login(cmd);
		if ( ! loginInfo)
			return;
		var url = loginInfo.url;
		console.log("lacadmin login -u admin -p <password> http://localhost:8080 -a migrate");
		console.log("lacadmin use migrate");
		module.exports.exportlibraries(cmd);
		module.exports.exportAuthProviders(cmd);
		module.exports.exportProjects(cmd);
		module.exports.exportMDS(cmd); //NOT IN 2.1
		module.exports.exportGateway(cmd);
		//console.log("lacadmin logout migrate");

	},
	exportlibraries: function(cmd) {
		var client = new Client();
		var loginInfo = login.login(cmd);
		if ( ! loginInfo)
			return;
		var url = loginInfo.url;
		var apiKey = loginInfo.apiKey;
		var dir = "projects";
		if(cmd.directory){
			dir = cmd.directory;
		}
		var filter = "sysfilter=greater(ident:599)&sysfilter=equal(logic_type:'javascript')&sysorder=(name:asc_uc,name:desc)";
		client.get(url + "/logic_libraries?pagesize=100&"+ filter, {
			headers: {
				Authorization: "CALiveAPICreator " + apiKey + ":1",
				"Content-Type" : "application/json"
			}
		}, function(data) {
			if (data.errorMessage) {
				console.log(data.errorMessage.red);
				return;
			}
			//printObject.printHeader('All Libraries');
			var table = new Table();
			_.each(data, function(p) {

				var filter = "sysfilter=equal(ident:" + p.ident + ")";
				var exportFileName = dir + "/LIBRARY_"+p.name+".json";

				client.get(loginInfo.url + "/logic_libraries?" + filter, {
					headers: {
						Authorization: "CALiveAPICreator " + loginInfo.apiKey + ":1",
						"Content-Type" : "application/json"
					}
				}, function(libData) {
					//console.log('get result: ' + JSON.stringify(data, null, 2));
					if (libData.errorMessage) {
						console.log(("Error: " + libData.errorMessage).red);
						return;
					}
					if (libData.length === 0) {
						//console.log(("Error: no such library found").red);
						return;
					}
					console.log("lacadmin libraries export --ident " + p.ident + " --file '" + exportFileName +"'");
				});
			});
		});
	},
	exportAuthProviders: function(cmd) {
		var client = new Client();

		var loginInfo = login.login(cmd);
		if ( ! loginInfo)
			return;
		var url = loginInfo.url;
		var apiKey = loginInfo.apiKey;
		var dir = "projects";
		if(cmd.directory){
			dir = cmd.directory;
		}
		client.get(url + "/authproviders?sysfilter=greater(ident:1000)", {
			headers: {
				Authorization: "CALiveAPICreator " + apiKey + ":1",
				"Content-Type" : "application/json"
			}
		}, function(data) {
			if (data.errorMessage) {
				console.log(data.errorMessage.red);
				return;
			}
			//printObject.printHeader('All authentication providers');
			var table = new Table();
			_.each(data, function(p) {

				var filter = "sysfilter=equal(ident:" + p.ident + ")";
				var exportFileName = dir + "/AUTHPROVIDER_"+p.name+".json";

				client.get(loginInfo.url + "/authproviders?" + filter, {
					headers: {
						Authorization: "CALiveAPICreator " + loginInfo.apiKey + ":1",
						"Content-Type" : "application/json"
					}
				}, function(authData) {
					//console.log('get result: ' + JSON.stringify(data, null, 2));
					if (authData.errorMessage) {
						console.log(("Error: " + authData.errorMessage).red);
						return;
					}
					if (authData.length === 0) {
						//console.log(("Error: no such auth provider").red);
						return;
					}

					console.log("lacadmin authprovider export --ident " + p.ident + " --file '" + exportFileName +"'");

				});
			});
		});
	},
	exportProjects: function(cmd) {
		var client = new Client();
		//console.log(api.list(cmd));
		var loginInfo = login.login(cmd);
		if ( ! loginInfo)
			return;
		var url = loginInfo.url;
		var apiKey = loginInfo.apiKey;
		var filter = "";
		var dir = "";
		if(cmd.directory){
			dir = cmd.directory;
		}
		var format = cmd.format || "zip";
		var passwordStyle = cmd.passwordstyle || "skip";
		var authTokenStyle = cmd.authTokenstyle || "skip_auto";
		var apiOptionsStyle = cmd.apioptionsstyle ||  "emit_all";
		var libraryStyle = cmd.librarystyle || "emit_all";
		var filename = cmd.file || "ALL_REPOS." + format;

		function exportAPIPromisified(cmd){
			return new Promise(function (resolve, reject){
				api.exportToFile(cmd , function (err, res){
					if (err) {
						reject(err);
					}
					 else {
						resolve(res);
					}
				});
			});
		}
		client.get(url + "/projects"+"?pagesize=100&sysorder=(ident)", {
			headers: {
				Authorization: "CALiveAPICreator " + apiKey + ":1",
				"Content-Type" : "application/json"
			}
			}, function(projects) {
					if (projects.errorMessage) {
						console.log(projects.errorMessage.red);
						return;
					}
					var listOfUrls = "";
					var sep = "";
				_.each(projects, function(p) {
					cmd.ident = p.ident;
					listOfUrls += sep + p.url_name;
					sep = ",";
				});
			// setup the defaults for export
			cmd.format = format;
			cmd.directory = dir;
			cmd.url_name += listOfUrls;
			cmd.file =  filename;
			cmd.passwordstyle = passwordStyle;
			cmd.authTokenstyle =   authTokenStyle;
			cmd.apioptionsstyle = apiOptionsStyle;
			cmd.librarystyle = libraryStyle;

			exportAPIPromisified(cmd);
		});
			//printObject.printTrailer("# projects exported: " + projects.length);
	},
	importLib: function(cmd) {
		var path = "lacmigration";
		if(cmd.directory){
			path = cmd.directory;
		} else {
			cmd.directory = path;
		}
		fs.mkdir(path,function(e){
			if(!e || (e && e.code === 'EEXIST')){
				//do something with contents
			} else {
				//debug
				console.log(e);
			}
		});
		cmd.libType = "LIBRARY_";
		cmd.Table = "logic_libraries";
		module.exports.importLibraries(cmd);
	},
	importAuth: function(cmd) {
		var path = "lacmigration";
		if(cmd.directory){
			path = cmd.directory;
		} else {
			cmd.directory = path;
		}
		fs.mkdir(path,function(e){
			if(!e || (e && e.code === 'EEXIST')){
				//do something with contents
			} else {
				//debug
				console.log(e);
			}
		});

		cmd.libType = "AUTHPROVIDER_";
		cmd.Table = "authproviders";
		module.exports.importLibraries(cmd);

	},
	importProject: function(cmd) {
		var path = "lacmigration";
		if(cmd.directory){
			path = cmd.directory;
		} else {
			cmd.directory = path;
		}
		fs.mkdir(path,function(e){
			if(!e || (e && e.code === 'EEXIST')){
				//do something with contents
			} else {
				//debug
				console.log(e);
			}
		});

		cmd.libType = "PROJECT_";
		cmd.Table = "ProjectExport";
		module.exports.importLibraries(cmd);
	},
	exportMDS: function(cmd) {
		var client = new Client();
		var loginInfo = login.login(cmd);
		if ( ! loginInfo)
			return;
		var url = loginInfo.url;
		var apiKey = loginInfo.apiKey;
		var dir = "projects";
		if(cmd.directory){
			dir = cmd.directory;
		}
		client.get(url + "/admin:managed_data_servers?pagesize=100sysorder=(name:asc_uc,name:desc)", {
			headers: {
				Authorization: "CALiveAPICreator " + apiKey + ":1",
				"Content-Type" : "application/json"
			}
		}, function(data) {
			if (data.errorMessage) {
				console.log(data.errorMessage.red);
				return;
			}
			//printObject.printHeader('All Libraries');
			var table = new Table();
			_.each(data, function(p) {
				var filter = "sysfilter=equal(ident:" + p.ident + ")";
				var exportFileName = dir + "/MANAGED_SERVERS.json";

				client.get(loginInfo.url + "/admin:managed_data_servers?" + filter, {
					headers: {
						Authorization: "CALiveAPICreator " + loginInfo.apiKey + ":1",
						"Content-Type" : "application/json"
					}
				}, function(mdsData) {
					//console.log('get result: ' + JSON.stringify(data, null, 2));
					if (mdsData.errorMessage) {
						//console.log(("Error: " + mdsData.errorMessage).red);
						return;
					}
					if (mdsData.length === 0) {
						//console.log(("Error: no such library found").red);
						return;
					}
					console.log("lacadmin managedserver export --file '" + exportFileName +"'");
					return;
				});
			});

		});
	},
	exportGateway: function(cmd) {
		var client = new Client();
		var loginInfo = login.login(cmd);
		if ( ! loginInfo)
			return;
		var url = loginInfo.url;
		var apiKey = loginInfo.apiKey;
		var dir = "projects";
		if(cmd.directory){
			dir = cmd.directory;
		}
		client.get(url + "/admin:gateways?pagesize=100sysorder=(name:asc_uc,name:desc)", {
			headers: {
				Authorization: "CALiveAPICreator " + apiKey + ":1",
				"Content-Type" : "application/json"
			}
		}, function(data) {
			if (data.errorMessage) {
				console.log(data.errorMessage.red);
				return;
			}
			//printObject.printHeader('All Libraries');
			var table = new Table();
			_.each(data, function(p) {
				var filter = "sysfilter=equal(ident:" + p.ident + ")";
				var exportFileName = dir + "/GATEWAYS.json";

				client.get(loginInfo.url + "/admin:gateways?" + filter, {
					headers: {
						Authorization: "CALiveAPICreator " + loginInfo.apiKey + ":1",
						"Content-Type" : "application/json"
					}
				}, function(mdsData) {
					//console.log('get result: ' + JSON.stringify(data, null, 2));
					if (mdsData.errorMessage) {
						console.log(("Error: " + mdsData.errorMessage).red);
						return;
					}
					if (mdsData.length === 0) {
						console.log(("Error: no such library found").red);
						return;
					}
					for(var i = 0; i < mdsData.length ; i++){
						delete mdsData[i].ident;
						data[i].account_ident = null;
						delete mdsData[i]['@metadata'].links;
						delete mdsData[i]['@metadata'];
					}

					//var exportFile = fs.openSync(exportFileName, 'w+', 0600);
					console.log("lacadmin gateway export --file '" + exportFileName +"'");
					return;

				});
			});
		});
	},
	importLibraries: function(cmd) {
		var client = new Client();

		var loginInfo = login.login(cmd);
		if ( ! loginInfo)
			return;
		var url = loginInfo.url;
		var apiKey = loginInfo.apiKey;

		console.log("Import files starting with: "+ cmd.libType +" in directory: "+cmd.directory);
		//need to read each file in directory starting with LibType_
		//POST to server
		function readFilePromisified(filename) {
		   return new Promise(
			function (resolve, reject) {
				fs.readFile(filename, { encoding: 'utf8' },
					(error, data) => {
						if (error) {
							reject(error);
						} else {
							resolve(data);
						}
					});
			});
		};
		function readDirPromisified(path) {
		   return new Promise(
			function (resolve, reject) {
				fs.readdir(path,
					(error, items) => {
						if (error) {
							reject(error);
						} else {
							resolve(items);
						}
					});
			});
		};
		readDirPromisified(cmd.directory)
			.then(items => {
			  for (var i=0; i<items.length; i++) {
        	    if(items[i].startsWith(cmd.libType)) {

        	    	var fileName = cmd.directory + "/" + items[i];
        	    	console.log("FileName: " + fileName);
        	    	var startTime = new Date();

					readFilePromisified(fileName)
					.then(text => {
						//console.log(text);
						var fileContent = JSON.parse(text);
						for(var i = 0 ; i < fileContent.length; i++){
							fileContent[i]["@metadata"] = {action:"MERGE_INSERT", key: "name"} ;
						}
						console.log(loginInfo.url + "/" + cmd.Table);
						console.log(JSON.stringify(fileContent));
						var args = {
							path: { "id": cmd.Table },
							parameters: {},
							headers:{
						  		Authorization: "CALiveAPICreator " + loginInfo.apiKey + ":1",
						  		"Content-Type" : "application/json"
					  		},
							data:fileContent
						};
						client.post(loginInfo.url + "/${id}" , args, function (postData, response) {
						  //console.log(response);
						  //console.log(postData);
						  var endTime = new Date();
						  if (postData.errorMessage) {
							  console.log(postData.errorMessage.red);
							  return;
						  }
						  printObject.printHeader(fileName +' was imported:');
						  if(postData.statusCode < 205 ){
							  console.log("Request took: " + (endTime - startTime) + "ms");
							  return;
						  }
						});
					})
					.catch(error => {
						console.log(error);
					});
				   } //if startsWith
		  		  } //for
				}) //promise files
			.catch(error => {
				console.log(error);
			});
	}
};
