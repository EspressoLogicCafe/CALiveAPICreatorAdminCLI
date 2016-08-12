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
	doMigrate: function(action, cmd) {
	    if (action === 'list') {
			module.exports.list(cmd);
		}
		else if (action === 'exportRepos') {
			module.exports.export(cmd);
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
			console.log('You must specify an action: list, importProject, importAuth, importLib,  or exportRepos');
		}
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
	
	export: function(cmd) {
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
		module.exports.exportlibraries(cmd);
		module.exports.exportAuthProviders(cmd);
		module.exports.list(cmd);
		module.exports.exportProjects(cmd);
	
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
		client.get(url + "/logic_libraries?pagesize=100&sysfilter=greater(ident:999)&sysorder=(name:asc_uc,name:desc)", {
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
						console.log(("Error: no such library found").red);
						return;
					}
					for(var i = 0; i < libData.length ; i++){
						delete libData[i].ident;
						data[i].account_ident = null;
						delete libData[i]['@metadata'].links;
						delete libData[i]['@metadata'];
					}
			
					//var exportFile = fs.openSync(exportFileName, 'w+', 0600);
					fs.writeFile(exportFileName, JSON.stringify(libData, null, 2), function(err) {
  					  if(err) {
      					  return console.log(err);
   					   }
				    	console.log(('Logic Library has been exported to file: ' + exportFileName).green);
					}); 
					if(p.logic_type === 'javascript'){
					
						//lets convert the p.code hex to base64 to real pname.js
						//fs.writeFile(p.name +".js", p.code) {}
					}	
				});	
			});
			table.sort(['Name']);
			console.log(table.toString());
			printObject.printHeader("# libraries: " + data.length);
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
						console.log(("Error: no such project").red);
						return;
					}
					for(var i = 0; i < authData.length ; i++){
						delete authData[i].ident;
						data[i].account_ident = null;
						delete authData[i]['@metadata'];
					}
				
					fs.writeFile(exportFileName, JSON.stringify(authData, null, 2), function(err) {
  					  if(err) {
      					  return console.log(err);
   					   }
   					     console.log(('Auth Provider has been exported to file: ' + exportFileName).green);
					}); 
				});
			});
			table.sort(['Name']);
			console.log(table.toString());
			printObject.printHeader("# authentication providers: " + data.length);
		});
	},
	exportProjects: function(cmd) {
		var client = new Client();
		
		var loginInfo = login.login(cmd);
		if ( ! loginInfo)
			return;
		var url = loginInfo.url;
		var apiKey = loginInfo.apiKey;
		var filter = "";
		var dir = "projects";
		if(cmd.directory){
			dir = cmd.directory;
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
				_.each(projects, function(p) {
				
				var projIdent = p.ident;
				var url_name = p.url_name;
				filter = "equal(ident:" + projIdent + ")";
				var exportFileName = dir + "/PROJECT_" + url_name + ".json";
		
				client.get(loginInfo.url + "/ProjectExport?sysfilter=" + filter, {
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
						console.log(("Error: no such project").red);
						return;
					}
					//var exportFile = fs.openSync(exportFileName, 'w+', 0600);
					fs.writeFile(exportFileName, JSON.stringify(data, null, 2), function(err) {
  					  if(err) {
      					  return console.log(err);
   					   }
				    	console.log(('Project ident ['+projIdent+'] with url_name ['+ url_name +'] has been exported to file: ' + exportFileName).green);
		
					}); 
					//fs.writeSync(exportFile, JSON.stringify(data, null, 2));
				}); 
			});
			printObject.printTrailer("# projects exported: " + projects.length);
		});// end get list of projects
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
