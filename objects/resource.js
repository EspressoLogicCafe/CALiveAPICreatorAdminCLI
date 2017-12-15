var Client = require('node-rest-client').Client;
var colors = require('colors');
var _ = require('underscore');
var Table = require('easy-table');
//var sync = require('synchronize');
var fs = require('fs');
var context = require('./context.js');
var login = require('../util/login.js');
var printObject = require('../util/printObject.js');
var dotfile = require('../util/dotfile.js');

module.exports = {
	doResource: function(action, cmd) {
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
		else if (action === 'export') {
			module.exports.export(cmd);
		}
		else if (action === 'import') {
			module.exports.import(cmd);
		}
		else {
			console.log('You must specify an action: list, create, export, update or delete');
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

		// This gets called once we have figured out which API version to use
		function listResources(apiversion_ident) {
			
			client.get(url + "/resources?sysfilter=equal(container_ident:  null, apiversion_ident:" + apiversion_ident +")", {
				headers: {
					Authorization: "CALiveAPICreator " + apiKey + ":1",
					"Content-Type" : "application/json"
				}
			}, function(data) {
				if (data.errorMessage) {
					console.log(data.errorMessage.red);
					return;
				}
				printObject.printHeader('Top-level resources for API Version: '+apiversion_ident);
				var table = new Table();
				var verboseDisplay = "";
				_.each(data, function(p) {
					table.cell("Ident", p.ident);
					table.cell("Name", p.name);
					table.cell("Prefix", p.prefix);
					table.cell("Table", p.table_name);
					var type = "";
					switch(p.resource_type_ident) {
						case 1: type = "normal"; break;
						case 2: type = "free SQL"; break;
						case 3: type = "JavaScript"; break;
						case 4: type = "stored proc"; break;
						case 5: type = "Mongo"; break;
						default: type = "unknown";
					}
					table.cell("Type", type);
					var comments = p.description;
					if (comments) {
						comments = comments.replace(/\n/g, '');
					}
					if ( ! comments) {
						comments = "";
					}
					else if (comments.length > 50){
						comments = comments.substring(0, 47) + "...";
					}
					table.cell("Comments", comments);
					table.newRow();
					if(cmd.verbose) {
						verboseDisplay += "\n";
						verboseDisplay += "lacadmin resource export --file  RESOURCE_"+p.name + ".json\n";
						verboseDisplay += "#lacadmin resource import --file  RESOURCE_"+p.name + ".json\n";
					}
				});
				table.sort(['Name']);
				if (data.length === 0) {
					console.log('There is no resource defined for this API version'.yellow);
				}
				else {
					console.log(table.toString());
				}
				printObject.printHeader("# resources: " + data.length);
				if(cmd.verbose) {
					console.log(verboseDisplay);
				}
			});
		}
		
		module.exports.getApiVersionAndDoSomething(cmd, listResources);		
	},
	create: function(cmd) {
		var client = new Client();
		var loginInfo = login.login(cmd);
		if ( ! loginInfo)
			return;
		if ( ! cmd.resource_name) {
			console.log('Missing parameter: name'.red);
			return;
		}
		if ( ! cmd.prefix) {
			cmd.prefix = "main";
		}
		if ( ! cmd.table_name) {
			console.log('Missing parameter: table_name'.red);
			return;
		}
		var curProj = cmd.project_ident;
		if ( ! curProj) {
			curProj = dotfile.getCurrentProject();
		}
		if ( ! curProj) {
			console.log('There is no current project.'.yellow);
			return;
		}
		if ( ! cmd.type) {
			cmd.type = 1;
		}
		else {
			switch(cmd.type.toLowerCase()) {
				case 'normal': cmd.type = 1; break;
				case 'sql': cmd.type = 2; break;
				case 'javascript': cmd.type = 3; break;
				case 'storedproc': cmd.type = 4; break;
				case 'mongo': cmd.type = 5; break;
				default: console.log(('Unknown resource type: ' + cmd.type).red); return;
			}
		}
		if ( ! cmd.is_collection) {
			cmd.is_collection = 1;
		}
		else {
			cmd.is_collection = (cmd.is_collection === 'true') ? 1 : 0;
		}

		module.exports.getApiVersionAndDoSomething(cmd, function(apiversion_ident) {
			var newResource = {
				name: cmd.resource_name,
				table_name: cmd.table_name,
				prefix: cmd.prefix,
				description: cmd.description,
				resource_type_ident: cmd.type,
				is_collection: cmd.is_collection,
				container_ident: cmd.container_ident,
				apiversion_ident: apiversion_ident,
				sibling_rank: 1
			};
			
			var startTime = new Date();
			client.post(loginInfo.url + "/resources", {
				data: newResource,
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
				
//				console.log(data.txsummary[0]['@metadata']);
				var newResource = _.find(data.txsummary, function(r) {
					return r['@metadata'].resource === 'admin:resources' && r['@metadata'].verb === 'INSERT';
				});
				if ( ! newResource) throw 'Unable to find newly inserted resource in tx summary';
				
				function addAttribute(alias, colName, callback) {
					var newAtt = {
						name: alias,
						column_name: colName,
						is_defined_key_part: false,
						resource_ident: newResource.ident
					};
					client.post(loginInfo.url + "/resourceattributes", {
						data: newAtt,
						headers: {
							Authorization: "CALiveAPICreator " + loginInfo.apiKey + ":1",
							"Content-Type" : "application/json"
						}
					}, function(data2) {
						if (data2.errorMessage) {
							console.log(data2.errorMessage.red);
							if (callback) {
								callback(data2, null);
							}
							return;
						}
						if (callback) {
							callback(null, data2.txsummary[0]);
						}
					});
				}
				
				// This gets called when we're done, possibly with extra objects to show
				function showSummary(extra) {
					printObject.printHeader('Resource was created');
					_.each(data.txsummary, function(obj) {
						printObject.printObject(obj, obj['@metadata'].entity, 0, obj['@metadata'].verb);
					});
					if (extra) {
						_.each(extra, function(obj) {
							printObject.printObject(obj, obj['@metadata'].entity, 0, obj['@metadata'].verb);
						});
					}
					var trailer = "Request took: " + (endTime - startTime) + "ms";
					trailer += " - # objects touched: ";
					var numObjects = data.txsummary.length;
					if (extra) {
						numObjects += extra.length;
					}
					if (data.txsummary.length == 0) {
						console.log('No data returned'.yellow);
					}
					else {
						trailer += numObjects;
					}
					printObject.printHeader(trailer);
				}
				
				// If there are attributes, we have to synchronize to wait for them to be created
				if (cmd.attributes) {
					//console.log('Creating attributes...');
					var atts = null;
					try {
						//console.log('Attributes: ' + cmd.attributes);
						atts = eval('(' + cmd.attributes + ')');
					}
					catch(e) {
						console.log(('Error parsing attributes: ' + e).red);
					}
					
					var newAtts = [];
					//sync.fiber(function(){
						for (var colName in atts) {
							//var newAtt = sync.await(addAttribute(atts[colName], colName, sync.defer()));
							//console.log('Attribute created');
							newAtts.push(newAtt);
						}
						showSummary(newAtts);
					//});
				}
				else {
					showSummary();
				}
			});
		});		
	},
	update: function(cmd) {
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
		var filter = "";
		if( cmd.resource_name != null && cmd.apiversion != null) {
			filter = "sysfilter=equal(container_ident: null,name:" + cmd.resource_name  + ",version: " + cmd.apiversion + ")";
		} else {
		 if ( ! cmd.ident) {
			 console.log('Missing parameter: ident'.red);
			 return;
		 }
		 filter = "sysfilter=equal(container_ident: null,ident:" + cmd.ident +")";
		}
		// This gets called to get the resource before we do an update
		client.get(url + "/resources", {
			headers: {
				Authorization: "CALiveAPICreator " + apiKey + ":1",
				"Content-Type" : "application/json"
			}
			}, function(data) {
				if (data.errorMessage) {
					console.log(data.errorMessage.red);
					return;
			}
			
			if (data.length === 0) {
				console.log('Resource not found for ident :'+cmd.ident.yellow);
				return;
			}
			var resource = data[0];
			resource.prop1 = cmd.prop1 || resource.prop1;
			resource.prop2 = cmd.prop2 || resource.prop2;
			resource.prop3 = cmd.prop3 || resource.prop3;
			resource.prop4 = cmd.prop4 || resource.prop4;
			resource.prefix = cmd.prefix || resource.prefix;
			resource.table_name = cmd.table_name || resource.table_name;
			client.put(url + "/resources", {
				data: resource,
				headers: {
					Authorization: "CALiveAPICreator " + apiKey + ":1",
					"Content-Type" : "application/json"
				}
			}, function(res) {
				if (res.errorMessage) {
					console.log(res);
					return;
			    }
			   if (res.length === 0) {
				   console.log('Update Resource not found for ident :'+cmd.ident.yellow);
				   return;
			   }
			   console.log(JSON.stringify(res,null,2));
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
		
		if ( ! cmd.resource_name) {
			console.log('Missing parameter: please specify a name'.red);
			return;
		}

		client.get(loginInfo.url + "/resources?sysfilter=equal(container_ident: null, name:'" + cmd.resource_name + "')", {
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
				console.log(("Resource(s) not found").red);
				return;
			}
			if (data.length > 1) {
				console.log(("Error: more than one resource with the given name: " + cmd.resource_name).red);
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
				printObject.printHeader('Resource was deleted, including the following objects:');
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
	
	// Given an apiversion parameter, retrieve the API version, then call callback
	getApiVersionAndDoSomething: function(cmd, callback) {
		var client = new Client();
		
		var loginInfo = login.login(cmd);
		if ( ! loginInfo)
			return;
		var url = loginInfo.url;
		var apiKey = loginInfo.apiKey;

		var curProj = cmd.project_ident;
		if ( ! curProj) {
			curProj = dotfile.getCurrentProject();
		}
		if ( ! curProj) {
			console.log('There is no current project.'.yellow);
			return;
		}

		// Now figure out which API version to use
		if (cmd.apiversion) {
			client.get(url + "/apiversions?sysfilter=equal(project_ident:" + curProj + " , name:'" + cmd.apiversion + "')", {
				headers: {
					Authorization: "CALiveAPICreator " + apiKey + ":1",
					"Content-Type" : "application/json"
				}
			}, function(data) {
				if (data.errorMessage) {
					console.log(data.errorMessage.red);
					return;
				}
				if (data.length === 0) {
					console.log('No such API version: ' + cmd.apiversion);
					return;
				}
				if (data.length > 1) {
					console.log('More than one API version with name: ' + cmd.apiversion);
					return;
				}
				callback(data[0].ident);
			});

		}
		else {
			client.get(url + "/apiversions?sysfilter=equal(project_ident:" + curProj +")", {
				headers: {
					Authorization: "CALiveAPICreator " + apiKey + ":1",
					"Content-Type" : "application/json"
				}
			}, function(data) {
				if (data.errorMessage) {
					console.log(data.errorMessage.red);
					return;
				}
				if (data.length === 0) {
					console.log('No API version has been defined in this project.'.yellow);
					return;
				}
				if (data.length > 1) {
					console.log('There are ' + data.length + ' API versions defined in this project. Please specify one.');
					var table = new Table();
					_.each(data, function(a) {
						table.cell("Name", a.name);
						table.newRow();
					});
					console.log(table.toString());
					return;
				}
				callback(data[0].ident);
			});
		}		
	},
	export: function(cmd) {
		var client = new Client();
		var loginInfo = login.login(cmd);
		if ( ! loginInfo)
			return;
			
		var url = loginInfo.url;
		var apiKey = loginInfo.apiKey;
		var apiversion = 'v1';
		if(cmd.apiversion){
			apiversion = cmd.apiversion;
		}
		var projIdent = cmd.project_ident;
		var rootIdent = cmd.ident;
		if ( !cmd.ident) {
			console.log("You must specifiy a specific specfic resource using --ident (use lacadmin resource list)".red);
			return;
		}
		if ( ! projIdent) {
			projIdent = dotfile.getCurrentProject();
			if ( ! projIdent) {
				console.log('There is no current project.'.yellow);
				return;
			}
		}
		var sysfilter = 'equal_or(ident:' + rootIdent + ', root_ident:' + rootIdent+ ')';
		var sysorder = 'sysorder=(root_ident:null_first, prefix:asc_uc, table_name:asc_uc)';
		client.get(url + "/AllResources?sysfilter="+sysfilter+"&pagesize=1"+sysorder, {
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
				console.log(("Resource not found").red);
				return;
			}
			 var toStdout = false;
			 if ( ! cmd.file) {
				 toStdout = true;
			 }
		 
			 for(var i = 0; i < data.length ; i++){
				   delete data[i].project_ident;
				   delete data[i]['@metadata'];
				   delete data[i].apiversion_ident;
				   for(var j = 0; j < data[i].Attributes.length; j++){
				   		delete data[i].Attributes[j]['@metadata'];
				   }
			 }
			 if (toStdout) {
				 console.log(JSON.stringify(data, null, 2));
			 
			 } else {
				 var exportFile = fs.openSync(cmd.file, 'w+', 0600);
				 fs.writeSync(exportFile, JSON.stringify(data, null, 2));
				 console.log(('Resources have been exported to file: ' + cmd.file).green);
			 }
		 });	
	},
	import: function(cmd) {
		var client = new Client();
	
		var loginInfo = login.login(cmd);
		if ( ! loginInfo)
			return;
		var url = loginInfo.url;
		var apiversion = "v1";
		if(cmd.apiversion){
			apiversion = cmd.apiversion;
		}
		var apiKey = loginInfo.apiKey;
		var projIdent = cmd.project_ident;
		if ( ! projIdent) {
			projIdent = dotfile.getCurrentProject();
			if ( ! projIdent) {
				console.log('There is no current project.'.yellow);
				return;
			}
		}
		client.get(url + "/admin:apiversions?sysfilter=equal(project_ident:" + projIdent +")&sysfilter=equal(name:'" + apiversion +"')&pagesize=1", {
			headers: {
				Authorization: "CALiveAPICreator " + loginInfo.apiKey + ":1",
				"Content-Type" : "application/json"
			}
		}, function(versionident) {
			//console.log('get result: ' + JSON.stringify(data, null, 2));
			if (versionident.errorMessage) {
				console.log(("Error: " + versionident.errorMessage).red);
				return;
			}
			
			if (versionident.length === 0) {
				console.log(("API version not found for resources").red);
				return;
			}
			console.log("Version "+ JSON.stringify(versionident[0].name,null,2));
			var apiversion_ident = versionident[0].ident;
			if ( ! cmd.file) {
				cmd.file = '/dev/stdin';
			}
		context.getContext(cmd, function() {
			var fileContent = JSON.parse(fs.readFileSync(cmd.file));
			var root;
			var resourceCnt = 0;
			var parent_ident = null;
			if(Array.isArray(fileContent)){
				for(var i = 0 ; i < fileContent.length; i++){
					delete fileContent[i]["@metadata"];
					delete fileContent[i].ts;
					fileContent[i].apiversion_ident = apiversion_ident;
					//fileContent[i].container_ident = null;// this is set for each child level
					if(fileContent[i].root_ident == null) {
						root = fileContent[i];
						//root["@metadata"] = {action:"MERGE_INSERT", key: ["apiversion_ident","name"]} ;
						resourceCnt += 1;
						parent_ident = root.ident;
					}
				} 
			}	
			delete root.entity_name;

			if(resourceCnt > 1){
				console.log("You can only import a single resource - use project import for multiple resources".red);
				return;
			}
			//console.log(root);
			
			module.exports.importResourceLevel(cmd, root , null, null , null ,fileContent);
			printObject.printHeader('Import Resource ' + root.name + ':');
			});
		});
	},
    importResourceLevel: function(cmd, res, newRootIdent, newResIdent, containerIdent, originalResource) {
    //console.log(res);
    	var client = new Client();
		var loginInfo = login.login(cmd);
		if ( ! loginInfo) {
			return;
		}
			var url = loginInfo.url;
		   	var originalIdent = res.ident;
		   	delete res['@metadata'];
		   	delete res.ident;
		   	res.root_ident = newRootIdent;
		   	res.container_ident = newResIdent;
		   	delete res.entity_name;
		   	_.each(res.Attributes, function (a) {
			   delete a.ident;
			   delete a['@metadata'];
			   delete a.resource_ident;
		   	});    
		   	//console.log("newRootIdent: "+newRootIdent);
		   	//console.log("originalIdent: " + originalIdent);
		   	//console.log("containerIdent: "+containerIdent);
			client.post(loginInfo.url + "/AllResources", {
			   data: res,
			   headers: {
				   Authorization: "CALiveAPICreator " + loginInfo.apiKey + ":1",
				   "Content-Type" : "application/json" 
				   }
			   }, function(data) {
			   
				  if (data.errorMessage) {
					  console.log(data.errorMessage.red);
					  return;
				  }
				 var newRes = _.find(data.txsummary, function (b) {
					 return b['@metadata'].resource === 'AllResources';
				 });
				 if ( ! newRes) {
					 throw "Unable to find newly created resource";
				 }
			  	newResIdent =newRes.ident;
				 // If this is the top resource
				 if ( ! newRootIdent) {
					 newRootIdent = newRes.ident;
				 }
				 var children = _.filter(originalResource, function (r) {
					 return r.container_ident === originalIdent;
				 });
				 _.each(children, function (c) {
					 module.exports.importResourceLevel(cmd, c, newRootIdent ,newRes.ident,  originalIdent, originalResource);
				 });
			});
	   }
};
