var Client = require('node-rest-client').Client;
var colors = require('colors');
var _ = require('underscore');
var fs = require('fs');
var request = require('request');
var CLITable = require('cli-table');
var Table = require('easy-table');
//var FormData = require('form-data');
//var http = require('http');
var context = require('./context.js');
var login = require('../util/login.js');
var printObject = require('../util/printObject.js');
var dotfile = require('../util/dotfile.js');
//ZIP Support for 4.1
var AdmZip = require('adm-zip');
var filesToSkip = ["__MACOSX",".DS_Store",".git",".gitignore",".idea"];


module.exports = {
	doProject: function(action, cmd) {
		if (action === 'list') {
			module.exports.list(cmd);
		}
		else if (action === 'create') {
			module.exports.create(cmd);
		}
		else if (action === 'update') {
			module.exports.update(cmd);
		}
		else if (action === 'delete') {
			module.exports.del(cmd);
		}
		else if (action === 'use') {
			module.exports.use(cmd);
		}
		else if (action === 'import') {
			module.exports.import(cmd);
		}
		else if (action === 'export') {
			module.exports.exportToFile(cmd);
		}
		else if (action === 'extract') {
			module.exports.extract(cmd);
		}
		else {
			console.log('You must specify an action: list, create, update, delete, use, import, export or extract');
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
			var verboseDisplay = "";
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
				if(cmd.verbose) {
					 verboseDisplay += "\n";
					 verboseDisplay += "lacadmin project export --url_name "+p.url_name+"  --file PROJECT_"+p.url_name + ".json --format json\n";
                     verboseDisplay += "#lacadmin project export --url_name "+p.url_name+"  --file PROJECT_"+p.url_name + ".zip --format zip\n";
                     verboseDisplay += "#lacadmin project extract --file PROJECT_"+p.url_name + ".zip --directory /temp/ --synchronize true\n";
                     verboseDisplay += "#lacadmin project import --file PROJECT_"+p.url_name + ".json\n";
                     verboseDisplay += "#lacadmin project import --file PROJECT_"+p.url_name + ".zip\n";
                     //verboseDisplay += "#lacadmin project import --directory /temp/ \n";
				 }
			});
			table.sort(['Name']);
			console.log(table.toString());
			printObject.printTrailer("# projects: " + data.length);
			if(cmd.verbose) {
				console.log(verboseDisplay);
			}
		});
	},
	
	create: function(cmd) {
		var client = new Client();
		var loginInfo = login.login(cmd);
		if ( ! loginInfo)
			return;
		if ( ! cmd.project_name) {
			console.log('Missing parameter: project_name'.red);
			return;
		}
		if ( ! cmd.url_name) {
			console.log('Missing parameter: url_name'.red);
			return;
		}
		if ( ! cmd.authprovider) {
			console.log('You did not specify an authentication provider -- you will not be able to log into this project until you do so.'.yellow);
		}
		context.getContext(cmd, function() {
			//console.log('Current account: ' + JSON.stringify(context.account));
			
			var newProject = {
				name: cmd.project_name,
				url_name: cmd.url_name,
				is_active: true,
				authprovider_ident: cmd.authprovider || 1000,
				account_ident: context.account.ident,
				comments: cmd.comments
			};
			
			if (cmd.status) {
				if (cmd.status !== 'A' && cmd.status !== 'I') {
					console.log('Project status must be either A (for active) or I (for inactive). Default is A if unspecified.'.red);
					return;
				}
				newProject.status = cmd.status;
			}

			var startTime = new Date();
			client.post(loginInfo.url + "/projects", {
				data: newProject,
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
				printObject.printHeader('Project was created, including:');
				var newProj = _.find(data.txsummary, function(p) {
					return p['@metadata'].resource === 'admin:projects';
				});
				if ( ! newProj) {
					console.log('ERROR: unable to find newly created project'.red);
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
				if (data.txsummary.length == 0) {
					console.log('No data returned'.yellow);
				}
				else {
					trailer += data.txsummary.length;
				}
				printObject.printTrailer(trailer);
				
				dotfile.setCurrentProject(newProj.ident, cmd.project_name, data.url_name);
			});
		});
	},
	
	update: function(cmd) {
		var client = new Client();
		var loginInfo = login.login(cmd);
		if ( ! loginInfo)
			return;

		var apiKey = loginInfo.apiKey;
		if ( ! apiKey){
			console.log(("Error: Login apiKey is missing or empty").red);
			return;
		}
			
		var filter = null;
		var projIdent = cmd.project_ident;
		
		if (cmd.ident) {
			filter = "?sysfilter=equal(ident:" + cmd.ident + ")";
		} else if ( ! projIdent) {
				projIdent = dotfile.getCurrentProject();
				if ( ! projIdent) {
					console.log('There is no current project.'.yellow);
					return;
				}
				filter = "/" + projIdent;
		}
		if( ! filter) {
			console.log('Missing parameter: please specify either ident or use a specific project'.red);
			return;
		}
		client.get(loginInfo.url + "/AllProjects" + filter, {
			headers: {
				Authorization: "CALiveAPICreator " + apiKey + ":1",
				"Content-Type" : "application/json"
			}
		}, function(data) {
			//console.log('get result: ' + JSON.stringify(data, null, 2));
			if (data.errorMessage) {
				console.log(("Project Update Error: " + data.errorMessage).red);
				return;
			}
			
			if (data.length === 0) {
				console.log(("Project not found").red);
				return;
			}
			if (data.length > 1) {
				console.log(("Project Update Error: more than one project for the given condition: " + filter).red);
				return;
			}
			var project = data[0];
			if (cmd.project_name) {
				project.name = cmd.project_name;
			}
			if (cmd.url_name) {
				project.url_name = cmd.url_name;
			}
			if (cmd.url) {
				project.url = cmd.url;
			}
			if (cmd.comments) {
				project.comments = cmd.comments;
			}
			if (cmd.authprovider) {
				project.authprovider_ident = cmd.authprovider;
			}
			if (cmd.status) {
				if (cmd.status !== 'A' && cmd.status !== 'I') {
					console.log('Project status must be either A (for active) or I (for inactive). Default is A if unspecified.'.red);
					return;
				}
				project.is_active = cmd.status == "A";
			}
			//{"@metadata" : {"action":"MERGE_INSERT", "key":"ident"}
			var startTime = new Date();
			client.put(project['@metadata'].href, {
				data: project,
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
				printObject.printHeader('Project was updated, including the following objects:');
				_.each(data.txsummary, function(obj) {
					printObject.printObject(obj, obj['@metadata'].entity, 0, obj['@metadata'].verb);
				});
				var trailer = "Request took: " + (endTime - startTime) + "ms";
				trailer += " - # objects touched: ";
				if (data.txsummary.length == 0) {
					console.log('No data returned'.yellow);
				}
				else {
					trailer += data.txsummary.length;
				}
				printObject.printTrailer(trailer);
			});
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
		if (cmd.url_name) {
			filt = "equal(url_name:'" + cmd.url_name + "')";
		}
		else if (cmd.project_name) {
			filt = "equal(name:'" + cmd.project_name + "')";
		}
		else {
			console.log('Missing parameter: please specify either project_name or url_name'.red);
			return;
		}
		client.get(loginInfo.url + "/projects?sysfilter=" + filt, {
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
				console.log(("Project "+ cmd.project_name +"  does not exist").yellow);
				return;
			}
			if (data.length > 1) {
				console.log(("Error: more than one project for the given condition: " + filter).red);
				return;
			}
			var project = data[0];
			var startTime = new Date();
			client['delete'](project['@metadata'].href + "?checksum=" + project['@metadata'].checksum, {
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
				printObject.printHeader('Project was deleted, including the following objects:');
				
				
				var delProj = _.find(data2.txsummary, function(p) {
					return p['@metadata'].resource === 'admin:projects';
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
	use: function(cmd) {
		var client = new Client();
		var loginInfo = login.login(cmd);
		if ( ! loginInfo)
			return;

		var filter = null;
		if (cmd.url_name) {
			filter = "equal(url_name:'" + cmd.url_name + "')";
		}
		else if (cmd.project_name) {
			filter = "equal(name:'" + cmd.project_name + "')";
		}
		else {
			console.log('Missing parameter: please specify either project_name or url_name'.red);
			return;
		}
		
		client.get(loginInfo.url + "/projects?sysfilter=" + filter, {
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
				console.log(("Project not found").red);
				return;
			}
			if (data.length > 1) {
				console.log(("Error: more than one project for the given condition: " + filter).red);
				return;
			}
			var project = data[0];
			dotfile.setCurrentProject(project.ident, project.name, project.url_name);
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
		//add support for export format from JSON to ZIP (default:json)
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
			
			if (toStdout) {
				console.log(JSON.stringify(data, null, 2));
			}
			else {
				var exportFile = fs.openSync(cmd.file, 'w+', 0600);
				fs.writeSync(exportFile, JSON.stringify(data, null, 2));
				console.log(('Project has been exported to file: ' + cmd.file).green);
			}
		});
	},
	import: function(cmd) {
		console.log("import called");
		if(cmd.directory) {
			module.exports.importFromDir(cmd);
			return;
		} else {

			var isZIPFile = false;
			if(cmd.format && cmd.format.toLowerCase() == "zip") {
				isZIPFile = true;
			} else {
				if(cmd.file) {
					isZIPFile = cmd.file.endsWith(".zip");
				}
			}
			if(isZIPFile) {
				module.exports.importFromZIPFile(cmd);
			} else {
				module.exports.importFromJSONFile(cmd);
			}
			return;
		}
		//console.log("import requires either --file (type zip or json) or --directory".red);
	},
	importFromDir: function(cmd) {
	//we will read from a source directory and build the zip file to send to LAC
		console.log("import called on directory " +cmd.directory);
		
		var client = new Client();
		var loginInfo = login.login(cmd);
		if ( ! loginInfo) {
			return;
		}
		var path = cmd.directory;
		var filesToRead = [];
		var dirToRead = [];
		var slash = cmd.directory.endsWith("/")?"":"/";
		var startPath = cmd.directory + slash;
		var stats = fs.lstatSync(startPath);
		var zip = null;
		if (stats.isDirectory()){
			zip = module.exports.readFromDirectory(dirToRead, filesToRead, startPath , "/");
		}
		////modules.export.addDirToZip(dirToRead,zip);
		//modules.export.addFileToZip(filesToRead,zip);
		if (zip) {
			var willSendthis = zip.toBuffer();
			fs.writeFileSync("/Users/banty01/test.zip", willSendthis);
		//zip.writeZip(/*target file name*/"/Users/banty01/test.zip");
			console.log("zip file written to /Users/banty01/test.zip");
		}
	},
	readFromDirectory: function(dirToRead, filesToRead, fullpath, path){
		console.log("readDirectory fullPath:" +fullpath + " ,path:" + path);
		var zip = new AdmZip();
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
		readDirPromisified(fullpath) 
			.then(items => {
			  for (var i = 0; i < items.length; i++) {
			 	 //console.log(">>items "+ items[i]);
			    //skip over . files
        	    if(!items[i].startsWith(".") && !items[i].startsWith("/.")) {
        	    	var filename = fullpath + "/" + items[i];
					//console.log(">>filename " + filename);
				   if(!items[i].startsWith(".") && !items[i].startsWith("/.")){
					  var stats = fs.lstatSync(filename);
					  if (!stats.isDirectory()){
						  console.log("{f} "+ items[i]);
						  readFilePromisified(filename)
							.then(text => {
							  //console.log(text);
							  var fileContent = text;
							  if(filename.endsWith(".json")) {
								 // fileContent = JSON.parse(text);
							  }
								var obj = {
									 shortPath: items[i], 
									 fullPath: filename,
									 content: fileContent
								 };
								filesToRead.push(obj);
								zip.addFile(filename, new Buffer(fileContent));
							  }) //promise files
						.catch(error => {
							console.log(error);
						});
					  } else {
						  console.log("{d} "+ items[i] + "/");
						  dirToRead.push(items[i] + "/");
						  zip.addLocalFolder(filename + "/", items[i] + "/");
						  module.exports.readFromDirectory(zip, dirToRead, filesToRead, filename + "/", items[i] + "/");
					  }
				   }
				} //if startsWith
		  	   } //for
			}) //promise files
			.catch(error => {
				console.log(error);
			});
			return zip;
	},
	readDirectoryOrig: function(dirToRead, filesToRead, fullpath, path){
		console.log("readDirectory fullPath:" +fullpath + " ,path:" + path);
		if(!fullpath && !path) {
			return;
		}
		fs.readdir(fullpath , function(err, items) {
			for (var i=0; items && i < items.length; i++) {
			var filename = fullpath + items[i];
				//console.log("read " + items[i]);
				if(!items[i].startsWith(".")){
				   var stats = fs.lstatSync(filename);
				   if (!stats.isDirectory()){
				   		var obj = {
					   		shortPath: items[i] ,
					   		fullPath: filename
					   	};
					   filesToRead.push(obj);
					   console.log("{f} "+ path + items[i]);
				   } else {
				   		console.log("{d} "+ path +items[i] + "/");
				   		dirToRead.push( path +items[i] + "/");
					   	module.exports.readDirectory(filename + "/", path + items[i] + "/");
				   }
				}
			}
		});
	},
	importFromZIPFile: function(cmd) {
		console.log("Project @import using file " + cmd.file);
		var client = new Client();
		var loginInfo = login.login(cmd);
		if (!loginInfo) {
			return;
		}

		if (!cmd.file) {
			console.log("ZIP file name is required".red);
			return;
		}
		var endPoint = "/@import";
		var url = loginInfo.url;

		var args ="";
		var collision = "rename_new"; //original behavior
		var errorhandling = "standard";
		if(cmd.namecollision) {
			collision = cmd.namecollision.toLowerCase();
			if(collision !== 'rename_new' && collision !== 'replace_existing' && collision !== 'fail'
					&& collision !== 'disable_and_rename_existing') {
				console.log("invalid namecollision value "+ collision);
				return;
			}
		}
		if(cmd.errorhandling) {
			errorhandling = cmd.errorhandling.toLowerCase();
			if(errorhandling !== 'standard' && errorhandling !== 'fail_on_warning' && errorhandling !== 'best_efforts') {
				console.log("invalid errorhandling value "+ collision);
				return;
			}
		}
		args = "?namecollision="+collision+"&errorhandling="+errorhandling;
		console.log(url + endPoint + args);

		var fileName = cmd.file;
		var readStream = fs.createReadStream(fileName);
		readStream.on('data', function (chunk) {
			console.log("reading chunk .. "+ chunk.length);
		})

		var uploadOptions = {
			name: 'foo.zip',
			file: readStream
		};
		request.post({
			url: url + endPoint + args,
			headers:  {
				"Authorization" : "CALiveAPICreator " + loginInfo.apiKey + ":1",
				"Content-Type" : 'multipart/form-data'
			},
			formData: uploadOptions,},
			function(err, resp, body) {
				if (err) {
					console.log('Error ', err);
				} else {
					console.log('@import successful', body);
				}
			});
	},
	importFromJSONFile: function(cmd) {
		console.log("Project @import using file " + cmd.file);
		var client = new Client();
		var loginInfo = login.login(cmd);
		if ( ! loginInfo) {
			return;
		}

		if ( ! cmd.file) {
			cmd.file = '/dev/stdin';
		}
		var endPoint = "/@import"; //4.1 style
		var isZIPFile = false;
		if(cmd.file) {
			isZIPFile = cmd.file.endsWith(".zip");
		}
		var args ="";
		var collision = "rename_new"; //original behavior
		var errorhandling = "standard";
		if(cmd.namecollision) {
			collision = cmd.namecollision.toLowerCase();
			if(collision !== 'rename_new' && collision !== 'replace_existing' && collision !== 'fail'
				&& collision !== 'disable_and_rename_existing') {
				console.log("invalid namecollision value "+ collision);
				return;
			}
		}
		if(cmd.errorhandling) {
			errorhandling = cmd.errorhandling.toLowerCase();
			if(errorhandling !== 'standard' && errorhandling !== 'fail_on_warning' && errorhandling !== 'best_efforts') {
				console.log("invalid errorhandling value "+ collision);
				return;
			}
		}
		args = "?namecollision="+collision+"&errorhandling="+errorhandling;
		var fileContent = fs.readFileSync(cmd.file);
		var contentType = "application/json";
		if(!isZIPFile) {
			fileContent = JSON.parse(fileContent);
			if(fileContent.length > 0) {
				endPoint = "/ProjectExport"; // 4.0 and earlier style
				args = ""; //not hondred
			}
		}

		if (cmd.project_name) {
			fileContent[0].name = cmd.project_name;
		}
		if (cmd.url_name) {
			fileContent[0].url_name = cmd.url_name;
		}

		console.log("endPoint: "+loginInfo.url + endPoint + args);
		var startTime = new Date();
		client.post(loginInfo.url + endPoint +args , {
			data: fileContent,
			headers: {
				Authorization: "CALiveAPICreator " + loginInfo.apiKey + ":1",
				"Content-Type" : contentType
			}
		}, function(data) {
		
			var endTime = new Date();
			if (data.errorMessage) {
				console.log(data.errorMessage.red);
				return;
			}
			printObject.printHeader('Project was created, including:');
			if(data.statusCode == 200 ){
				console.log("Request took: " + (endTime - startTime) + "ms");
				return;
			} 	

			console.log("project import completed using edpoint: "+endPoint);
			var trailer = "Request took: " + (endTime - startTime) + "ms";
			trailer += " - # objects touched: ";
			if (data.length === 0) {
				console.log('No data returned'.yellow);
			}
			else {
				trailer += " : "+ JSON.stringify(data ,null ,2);
			}
			
			//set the imported project to be the current selected project
			//dotfile.setCurrentProject(newProj.ident, newProj.name, newProj.url_name);
			printObject.printHeader(trailer);
			//console.log("You are now using project ident: "+newProj.ident +" name: "+ newProj.name);
		});
	},
	extract: function(cmd) {
		if (!cmd.file) {
			console.log(("--file must exist type must be zip, and is required" ).red);
			return;
		}
		if (!cmd.directory) {
			console.log(("--directory to explode zip file must exist and is required  " ).red);
			return;
		}
		//synchronize files with file system
		var path = "~/tmp/";
		if(cmd.directory){
			path = cmd.directory;
		} 
		var synchronize = false;
		if (cmd.synchronize) {
            synchronize = cmd.synchronize;
        }
		//var fileContent = fs.readFileSync(cmd.file);//JSON.parse(fs.readFileSync(cmd.file)
		console.log("extract zip file "+cmd.file +" to directory "+path + " synchronize: "+ synchronize);
		//does this target directory exist - if not - we can skip this next part.
		var filesToDelete = [];
		var foundFiles = [];
		var filename;
        var zip = new AdmZip(cmd.file);
		if (fs.existsSync(path) && synchronize) {
		   var zipEntries = zip.getEntries();
		   zipEntries.forEach(function(zipEntry) {
			 // get a list of files from the zip file
			  if (zipEntry.isDirectory) {
				   console.log("{d} "+ zipEntry.entryName);
				   //does this directory NOT exist in target - then ok
				   //get a list of all files in this directory
				   fs.readdir(path +"/" + zipEntry.entryName, function(err, items) {
						for (var i=0; items && i < items.length; i++) {
							filename = path +"/" + zipEntry.entryName + items[i];
							var stats = fs.lstatSync(filename);
							if (!stats.isDirectory()){
								console.log("....Found files on disk {f} "+ filename);
								foundFiles.push(filename);
								var found = false;
								var name;
								zipEntries.forEach(function(entry) {
								   if (!entry.isDirectory) {
									   name = path +"/" + entry.entryName;
									   //console.log(">>>compare "+filename + " = " + name );
									   if(filename == name) {
										   found = true;
										} 
								   }
								});
								if(!found) {
									filesToDelete.push(filename);
									console.log("delete file {f} " + filename);
									fs.unlink(filename,function(err){
        								if(err) {
        									console.log("ERROR :" + err);
        								} else {
        									console.log('file deleted successfully');
        								}
  									 });  
								}
							}
						}
					});
			     }
			 });
		}
	    //write the ZIP contents to a known location
		zip.extractAllTo(cmd.directory, true);
	    console.log("extract completed to directory "+ path);
	},
	exportToFile: function(cmd) {
	//Take an existing ZIP file and explode into a directory using ZIP utility
		var client = new Client();
		var loginInfo = login.login(cmd);
		if ( ! loginInfo)
			return;
		var exportEndpoint = "@export";
		var filter = null;
		var projIdent = cmd.ident;
		filter = "";
		if(cmd.url_name) {
			filter = "?urlfragment="+cmd.url_name;
		} else if ( ! projIdent) {
			projIdent = dotfile.getCurrentProject();
			 if(! projIdent){
				console.log('No current project ident found - use $lacadmin project list'.red);
				return;
			 }
            filter = "?projectId=" + projIdent;
		} else {
			console.log('Missing parameter: please specify project --url_name or --ident'.red);
			return;
		}
		//we could have a switch for JSON or ZIP
		var contentType = "application/json";
		var format = "json";
		if(cmd.format) {
			format = cmd.format.toLowerCase();
		}
		if(format !== 'zip' && format !== 'json') {
			console.log('Valid format must be either zip or json'.red);
			return;
		}

		var passwordStyle = cmd.passwordstyle || "skip";
		var authTokenStyle = cmd.authTokenstyle || "skip_auto";
		var apiOptionsStyle = cmd.apioptionsstyle ||  "emit_all";
		var libraryStyle = cmd.librarystyle || "emit_all";
		filter += "&responseformat=" + format
			+ "&passwordstyle=" + passwordStyle
			+ "&authtokenstyle="  + authTokenStyle
			+ "&apioptionsstyle=" + apiOptionsStyle
			+ "&librarystyle=" + libraryStyle;

		console.log(contentType);
		var toStdout = false;
		var filename;
		if ( ! cmd.file) {
			toStdout = true;
		} else {
			if(!cmd.file.endsWith(".zip") && !cmd.file.endsWith(".json")) {
				console.log('File Name extension must end with .zip or .json'.red);
				return;
			}
		}
		if(format == 'zip' || (cmd.file && cmd.file.endsWith(".zip")) ){
			contentType = 'application/zip';
		}
		console.log(loginInfo.url + "/" + exportEndpoint + filter);
		client.get(loginInfo.url + "/" + exportEndpoint + filter, {
			headers: {
				Authorization: "CALiveAPICreator " + loginInfo.apiKey + ":1",
				"Content-Type" : contentType,
				"accept": "*/*"
			}
		}, function(data) {
			//console.log('get result: ' +data);
			if (data.errorMessage) {
				console.log(("Error: " + data.errorMessage).red);
				return;
			}
			if (data.length === 0) {
				console.log(("Error: no such project to export").red);
				return;
			}
			if(format == 'zip') {
			   var buf = new Buffer(data, 'utf8');
			   if (toStdout) {
				   console.log(buf);
			   }
			   else {
				   var exportFile = fs.openSync(cmd.file, 'w+', 0600);
				   fs.writeSync(exportFile, buf);
				   console.log(('Project has been exported to file: ' + cmd.file + ' using format ' + format).green);
			   }
			} else {
				if (toStdout) {
				   console.log(JSON.stringify(data,null,2));
			   }
			   else {
				   var exportFile = fs.openSync(cmd.file, 'w+', 0600);
				   fs.writeSync(exportFile, JSON.stringify(data,null,2));
				   console.log(('Project extract has been exported to file: ' + cmd.file + ' using format ' + format).green);
			   }
			
			}
		});
	},
	importPromiseFromDirectory: function(cmd) {
		var client = new Client();
		
		var loginInfo = login.login(cmd);
		if ( ! loginInfo)
			return;
		var url = loginInfo.url;
		var apiKey = loginInfo.apiKey;
		
		console.log("Import all files starting from directory: "+cmd.directory);
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
			    //skip over . files
        	    if(!items[i].endsWith(".")) {
        	    	var fileName = cmd.directory + "/" + items[i];
        	    	console.log("{d}: " + fileName);
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
