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
	doTeamSpace: function (action, cmd) {
		if (action === 'list') {
			module.exports.list(cmd);
		}
		else if (action === 'export') {
			module.exports.export(cmd);
		}
		else if (action === 'import') {
			module.exports.import(cmd);
		}
		else if (action === 'delete') {
			module.exports.del(cmd);
		}
		else {
			console.log('You must specify an action: list, import, export, or delete');
			//program.help();
		}
	},
	list: function (cmd) {
		var client = new Client();

		var loginInfo = login.login(cmd);
		if (!loginInfo)
			return;
		var url = loginInfo.url;
		var apiKey = loginInfo.apiKey;


		client.get(url + "/admin:account_users?pagesize=100&&sysorder=(name:asc_uc,name:desc)", {
			headers: {
				Authorization: "CALiveAPICreator " + apiKey + ":1",
				"Content-Type": "application/json"
			}
		}, function (data) {
			if (data.errorMessage) {
				console.log(data.errorMessage.red);
				return;
			}
			printObject.printHeader('TeamSpace Users(s)');
			var table = new Table();
			var type = "";
			_.each(data, function (p) {
				table.cell("Ident", p.ident);
				table.cell("Name", p.name);
				table.cell("Full Name", p.fullname);
				table.cell("Status", p.status);
				table.cell("Roles", p.roles);
				var comments = p.comments;
				if (!comments) {
					comments = "";
				}
				else if (comments.length > 50) {
					//replace \n
					comments = comments.substring(0, 47) + "...";
				}
				comments = comments.replace("\n", " ");
				table.cell("Comments", comments);
				table.cell("AccountIdent", p.account_ident);
				table.newRow();
			});
			table.sort(['Name']);
			console.log(table.toString());
			printObject.printHeader("# teamspace users(s): " + data.length);
		});

	},
	export: function (cmd) {
		var client = new Client();

		var loginInfo = login.login(cmd);
		if (!loginInfo)
			return;
		var url = loginInfo.url;
		var apiKey = loginInfo.apiKey;

		var filter = "";
		if(cmd.ident) {
			filter = "&sysfilter=equal(ident:" + cmd.ident +")";
		} else  if (cmd.teampspace_username) {
			filter += "&sysfilter=equal(name:'" + cmd.teampspace_username + "')";
		}

		var toStdout = false;
		if (!cmd.file) {
			toStdout = true;
		}

		client.get(loginInfo.url + "/admin:account_users?pagesize=1000" + filter, {
			headers: {
				Authorization: "CALiveAPICreator " + loginInfo.apiKey + ":1",
				"Content-Type": "application/json"
			}
		}, function (data) {
			//console.log('get result: ' + JSON.stringify(data, null, 2));
			if (data.errorMessage) {
				console.log(("Error: " + data.errorMessage).red);
				return;
			}
			if (data.length === 0) {
				console.log(("TeamSpace user not found " + filter).red);
				return;
			}
			for (var idx = 0; idx < data.length; idx++) {
				delete data[idx].ident;
				delete data[idx]['@metadata']
				delete data[idx].ts;
			}

			if (toStdout) {
				console.log(JSON.stringify(data, null, 2));
			}
			else {
				var exportFile = fs.openSync(cmd.file, 'w+', 0600);
				fs.writeSync(exportFile, JSON.stringify(data, null, 2));
				console.log(('TeamSpace user(s) have been exported to file: ' + cmd.file).green);
			}
		});
	},

	import: function (cmd) {
		var client = new Client();
		var loginInfo = login.login(cmd);
		if (!loginInfo) {
			return;
		}

		if (!cmd.file) {
			cmd.file = '/dev/stdin';
		}

		var fileContent = JSON.parse(fs.readFileSync(cmd.file));
		if (Array.isArray(fileContent) && fileContent.length > 0) {
			//fileContent[0].project_ident = projIdent;
			fileContent[0]["@metadata"] = {action: "MERGE_INSERT", key: ["account_ident", "name"]};
		} else {
			//fileContent.project_ident = projIdent;
			fileContent["@metadata"] = {action: "MERGE_INSERT", key: ["account_ident", "name"]};
		}

		var startTime = new Date();
		client.put(loginInfo.url + "/admin:account_users", {
			data: fileContent,
			headers: {
				Authorization: "CALiveAPICreator " + loginInfo.apiKey + ":1",
				"Content-Type": "application/json"
			}
		}, function (data) {

			var endTime = new Date();
			if (data.errorMessage) {
				console.log(data.errorMessage.red);
				return;
			}
			printObject.printHeader('TeamSpace user(s) imported, including:');
			if (data.statusCode == 200) {
				console.log("Request took: " + (endTime - startTime) + "ms");
				return;
			}

			var newAPIVersion = _.find(data.txsummary, function (p) {
				return p['@metadata'].resource === 'admin:account_users';
			});
			if (!newAPIVersion) {
				console.log('ERROR: unable to find imported teamspace user'.red);
				return;
			}
			if (cmd.verbose) {
				_.each(data.txsummary, function (obj) {
					printObject.printObject(obj, obj['@metadata'].entity, 0, obj['@metadata'].verb);
				});
			}
			else {
				printObject.printObject(newAPIVersion, newAPIVersion['@metadata'].entity, 0, newAPIVersion['@metadata'].verb);
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
			printObject.printHeader(trailer);
		});
	},
	del : function(cmd) {
		var client = new Client();
		var loginInfo = login.login(cmd);
		if ( ! loginInfo) {
			console.log('You are not currently logged into any API Creator server.'.red);
			return;
		}
		var filt ="equal(";
		if(cmd.ident) {
			filt += "ident:" + cmd.ident +")";
		} else if (cmd.teampspace_username) {
			filt += "name:'" + cmd.teampspace_username + "')";
		} else {
			console.log('Missing parameter: please specify either --teampspace_username or --ident'.red);
			return;
		}

		client.get(loginInfo.url + "/admin:account_users?sysfilter=" + filt, {
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
				console.log(("Error: no such teamspace user using teampspace_username or ident").red);
				return;
			}
			if (data.length > 1) {
				console.log(("Error: more than one teamspace user for the given condition: " + filt).red);
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
				printObject.printHeader('TeamSpace user was deleted, including the following objects:');
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
	}
};
