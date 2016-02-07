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
	doSchema: function(action, cmd) {
		if (action === 'list') {
			module.exports.list(cmd);
		}
		else if (action === 'export') {
			module.exports.export(cmd);
		}
		else if (action === 'reload') {
			module.exports.reload(cmd);
		}
		else {
			console.log('You must specify an action: list or  export');
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

		client.get(url + "/@tables?sysfilter=equal(project_ident:" + projIdent+")&sysorder=(entity:asc_uc,entity:desc)&pagesize=1000", {
			headers: {
				Authorization: "CALiveAPICreator " + apiKey + ":1"
			}
		}, function(data) {
			if (data.errorMessage) {
				console.log(data.errorMessage.red);
				return;
			}
			printObject.printHeader('Tables');
			var table = new Table();
			_.each(data, function(p) {
				table.cell("Prefix", p.prefix);
				table.cell("Name", p.name);
				table.cell("Entity", p.entity);
				table.newRow();
			});
			table.sort(['Name', 'name']);
			if (data.length === 0) {
				console.log('There are no tables defined for this project'.yellow);
			}
			else {
				console.log(table.toString());
			}
			printObject.printHeader("# named sorts: " + data.length);
		});
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
		
		var filter = null;
		if (projIdent) {
			filter = "sysfilter=equal(project_ident:" + projIdent + ")";
		} else {
			console.log('Missing parameter: please specify project settings (use list) project_ident '.red);
			return;
		}
		
		var name = "";
		if (cmd.name) {
			name = "/" + cmd.name ;
		} 
		var toStdout = false;
		if ( ! cmd.file) {
			toStdout = true;
		}
		
		client.get(url + "/@tables?"+ filter, {
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
				console.log(("Error: no such table/name").red);
				return;
			}
			var table = [];
			_.each(data, function(p) {
				//console.log("CREATE TABLE "+p.entity + "(");
				table.push(p.entity);
				//table.cell("Name", p.entity);
				client.get(url + "/@tables/"+p.name, {
					headers: {
						Authorization: "CALiveAPICreator " + loginInfo.apiKey + ":1"
					}
				}, function(details) {
					if (details.errorMessage) {
						console.log(("Error: " + details.errorMessage).red);
						return;
					}
					if (details.length === 0) {
						console.log(("Error: no such columns").red);
						return;
					}
					var keys = [];
					_.each(details.primaryKey.columns, function(k) {
						keys.push(k.dbName, "PKey");
					});
					var det = '-- Phase Create \nCREATE TABLE "'+details.entity + '"( \n';
					var sep = "";
					var datatype,nullable,key;
					//console.log('get result: ' + JSON.stringify(details, null, 2));
						_.each(details.columns, function(c) {
							key = "";
							if(c.dbName in keys){
								key = " PRIMARY KEY";
							}
							if ( c.type == 'VARCHAR' || c.type == 'CHAR'){
								datatype = c.type +"("+c.size +")";
							} else if ( c.type == 'DECIMAL'){
								datatype = c.type +"("+c.size +","+ c.scale+")";
							} else if ( c.type == 'BIGINT'){
								datatype = c.type;
							} else {
								datatype = c.type;
							}
							nullable = c.nullable?"NULL ":"NOT NULL ";
							det += sep += '"' +c.dbName +'" ' + datatype + ' '  + nullable + key +  '\n';
							//table.cell("columns", c.name +" " + c.type + c.size );
							//table.newRow();
							sep = ",";

						});
						det += ") \n/ \n";
						var constr = "";
						_.each(details.parents, function(fk) {
						 //Add foreign keys
						 constr += '\n';
						  constr += '-- Phase Constrain\n';
						  constr += 'ALTER TABLE "'+details.entity+'" \n';
						  constr += '  ADD CONSTRAINT "'+fk.name +'" \n';
						  constr += '  FOREIGN KEY (';
						  	var sep = "";
							for(var idx = 0 ; idx < fk.child_columns.length ; idx ++){
								constr += sep + '"' + fk.child_columns[idx] +'"';
								sep = ",";
							}
							constr += ') \n';
							var parent = fk.parent_table;
							var idx = parent.indexOf(":");
						  constr += '  REFERENCES "'+parent.substring(idx + 1) +'" (';
							  var sep = "";
								for(var idx = 0 ; idx < fk.parent_columns.length ; idx ++){
									constr += sep + '"' + fk.parent_columns[idx] +'"';
									sep = ",";
								}
								constr += ') \n';
						  constr += '  ON DELETE CASCADE ON UPDATE RESTRICT \n';
						  constr += '/\n';
						
						});
					console.log(det);
					console.log(constr);
				});
					
			});
			if (toStdout) {
				console.log(JSON.stringify(table.toString(), null, 2));
			} else {
				var exportFile = fs.openSync(cmd.file, 'w+', 0600);
				fs.writeSync(exportFile, JSON.stringify(data, null, 2));
				console.log(('Tables has been exported to file: ' + cmd.file).green);
			}
		});
	},
	reload: function (cmd) {
		console.log("Reload not yet implemented");
		//get list of each schema (dbschema) and post it back - this should force a reload
	}
};
