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
	doNPAttr: function(action, cmd) {
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
			console.log('You must specify an action: list, delete, import, or  export');
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
	var filter = "/DbSchemas?sysfilter=equal(project_ident:"+projIdent+")";
	client.get(url + filter, {
			headers: {
				Authorization: "CALiveAPICreator " + apiKey + ":1",
				"Content-Type" : "application/json"
			}
		},function(schema) {
			if (schema.errorMessage) {
					console.log(schema.errorMessage.red);
					return;
				}
			//console.log(schema);
			client.get(url + "/admin:np_attributes?sysfilter=equal(dbaseschema_ident:" + schema[0].ident+")&sysorder=(table_name%2C+attr_name)&pagesize=100", {
				headers: {
					Authorization: "CALiveAPICreator " + apiKey + ":1",
					"Content-Type" : "application/json"
				}
			}, function(data) {
				if (data.errorMessage) {
					console.log(data.errorMessage.red);
					return;
				}
				printObject.printHeader('Non Persistent Attributes Schema Name: '+ schema[0].name );
				var table = new Table();
				var verboseDisplay = "";
				_.each(data, function(p) {
					var datatype = "";
					switch( p.data_type) {
						case 1 : datatype = "Character"; break;
						case 3 : datatype = "Decimal"; break;
						case 4 : datatype = "Integer"; break;
						case 7 : datatype = "Real"; break;
						case 16 : datatype = "Boolean"; break;
						case 12 : datatype = "String"; break;
						case 16 : datatype = "Boolean"; break;
						case 91 : datatype = "Datetime"; break;
						case 92 : datatype = "Timestamp"; break;
						default : datatype = "undefined";
					}
					table.cell("Ident", p.ident);
					table.cell("Table Name", p.table_name);
					table.cell("Attr Name", p.attr_name);
					table.cell("Data Type", datatype);
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
					console.log('There are no non persistent attributes defined for this schema'.yellow);
				}
				else {
					console.log(table.toString());
				}
				printObject.printHeader("# non persistent attrs: " + data.length);
				if(cmd.verbose) {
					verboseDisplay += "\n";
					verboseDisplay += "lacadmin npa export  --file 'NPA.json'\n";
					verboseDisplay += "#lacadmin npa import --file 'NPA.json'\n";
					console.log(verboseDisplay);
				}
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
		if (cmd.ident) {
			filt = "equal(ident:" + cmd.ident + ")";
		}
		else {
			console.log('Missing parameter: please specify either ident'.red);
			return;
		}

		client.get(loginInfo.url + "/admin:np_attributes?sysfilter=" + filt, {
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
				console.log(("Non Persistent Attribute not found").red);
				return;
			}
			if (data.length > 1) {
				console.log(("Error: more than one non persistent attr found for the given condition: " + filter).red);
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
				printObject.printHeader('Non Persistent Attribute was deleted, including the following objects:');
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
		var output = [];
		//ALLNpaAttributes subselect dbaseschema project_ident - no need for loop
		var filter = "/DbSchemas?sysfilter=equal(project_ident:"+projIdent+")";
		client.get(url + filter, {
				headers: {
					Authorization: "CALiveAPICreator " + apiKey + ":1",
					"Content-Type" : "application/json"
				}
			},function(schema) {
			//console.log(JSON.stringify(schema,null,2));

			client.get(loginInfo.url + "/np_attributes?sysfilter=equal(dbaseschema_ident:" + schema[0].ident+")", {
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
					console.log(("No non persistent attributes found").red);
					return;
				}
				//do not export passwords
				for(var i = 0; i < data.length ; i++){
					delete data[i]["ident"];
					delete data[i]["@metadata"];
					data[i].prefix = schema[0].prefix;
					output.push(data[i]);
					//console.log(JSON.stringify(data[i],null,2));
				}
				if (toStdout) {
					console.log(JSON.stringify(output, null, 2));
				} else {
					var filename = cmd.file;
					var exportFile = fs.openSync(filename, 'w+', 0600);
					fs.writeSync(exportFile, JSON.stringify(output, null, 2));
					console.log(('Non Persistent Attrs have been exported to file: ' + filename).green);
				}
			});
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
			if(Array.isArray(fileContent)){
				for(var i = 0 ; i < fileContent.length; i++){
					//fileContent[i].dbaseschema_ident = curProj;
					delete fileContent[i].ident;
					var prefix = fileContent[i].prefix;
					delete fileContent[i].prefix;
					//fileContent[i].dbaseschemas = { "@metadata": {"action": "LOOKUP", "key": ["prefix","active","project_ident"},"prefix": prefix ,"active": true, "project_ident": projIdent};

					//fileContent[i]["@metadata"] = {action:"MERGE_INSERT", key: ["dbaseschema_ident","table_name","attr_name"]} ;
				}
			} else {
				//fileContent.dbaseschema_ident = curProj;
				delete fileContent.ident;
				//fileContent["@metadata"] = {action:"MERGE_INSERT", key:  ["dbaseschema_ident","table_name","attr_name"]} ;
			}
			var startTime = new Date();
			client.post(loginInfo.url + "/admin:np_attributes", {
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
				printObject.printHeader('Non Persistent Attrs imported, including:');
				var trailer = "Request took: " + (endTime - startTime) + "ms";
				if(data.statusCode == 200){
					console.log(trailer);
				} else {
					var newSort = _.find(data.txsummary, function(p) {
						return p['@metadata'].resource === 'admin:np_attributes';
					});
					if ( ! newSort) {
						console.log('ERROR: unable to find imported non persistent attrs'.red);
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
