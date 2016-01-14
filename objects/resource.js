var Client = require('node-rest-client').Client;
var colors = require('colors');
var _ = require('underscore');
var Table = require('easy-table');
var sync = require('synchronize');

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
					Authorization: "CALiveAPICreator " + apiKey + ":1"
				}
			}, function(data) {
				if (data.errorMessage) {
					console.log(data.errorMessage.red);
					return;
				}
				printObject.printHeader('Top-level resources');
				var table = new Table();
				_.each(data, function(p) {
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
				});
				table.sort(['Name']);
				if (data.length === 0) {
					console.log('There is no resource defined for this API version'.yellow);
				}
				else {
					console.log(table.toString());
				}
				printObject.printHeader("# resources: " + data.length);
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
					Authorization: "CALiveAPICreator " + loginInfo.apiKey + ":1"
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
							Authorization: "CALiveAPICreator " + loginInfo.apiKey + ":1"
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
					sync.fiber(function(){
						for (var colName in atts) {
							var newAtt = sync.await(addAttribute(atts[colName], colName, sync.defer()));
							//console.log('Attribute created');
							newAtts.push(newAtt);
						}
						showSummary(newAtts);
					});
				}
				else {
					showSummary();
				}
			});
		});		
	},
	
	update: function(cmd) {
		console.log('Sorry, this function is not yet implemented'.yellow);
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
				Authorization: "CALiveAPICreator " + loginInfo.apiKey + ":1"
			}
		}, function(data) {
			//console.log('get result: ' + JSON.stringify(data, null, 2));
			if (data.errorMessage) {
				console.log(("Error: " + data.errorMessage).red);
				return;
			}
			if (data.length === 0) {
				console.log(("Error: no such resource").red);
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
					Authorization: "CALiveAPICreator " + loginInfo.apiKey + ":1"
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
					Authorization: "CALiveAPICreator " + apiKey + ":1"
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
					Authorization: "CALiveAPICreator " + apiKey + ":1"
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
		
		
		var projIdent = cmd.project_ident;
		if ( ! projIdent) {
			projIdent = dotfile.getCurrentProject();
			if ( ! projIdent) {
				console.log('There is no current project.'.yellow);
				return;
			}
		}
		//to do - this is not right - need specific version
		client.get(url + "/AllResources?sysfilter=equal(apiversion_ident:" + projIdent +")&pagesize=100", {
			headers: {
				Authorization: "CALiveAPICreator " + loginInfo.apiKey + ":1"
			}
		}, function(data) {
			//console.log('get result: ' + JSON.stringify(data, null, 2));
			if (data.errorMessage) {
				console.log(("Error: " + data.errorMessage).red);
				return;
			}
			var toStdout = false;
			if ( ! cmd.file) {
				toStdout = true;
			}
			if (data.length === 0) {
				console.log(("Error: no such project").red);
				return;
			}
			for(var i = 0; i < data.length ; i++){
			      delete data[i].ident;
			      data[i].project_ident = null;
			      data[i]['@metadata'].checksum = "override";
			      delete data[i]['@metadata'].links;
			}
			if (toStdout) {
				console.log(JSON.stringify(data, null, 2));
				
			} else {
				var exportFile = fs.openSync(cmd.file, 'w', 0600);
				fs.writeSync(exportFile, JSON.stringify(data, null, 2));
				console.log(('Rules have been exported to file: ' + cmd.file).green);
			}
		});	
	},
	import: function(cmd) {
		console.log("Sorry not implemented");
	}
};
