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
	doToken: function (action, cmd) {
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
			module.export.del(cmd);
		}
		else {
			console.log('You must specify an action: list, import, or  export');
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

		var projIdent = cmd.project_ident;
		if (!projIdent) {
			projIdent = dotfile.getCurrentProject();
			var currentProjectUrl = dotfile.getCurrentProjectUrl();
			if (!projIdent) {
				console.log('There is no current project.'.yellow);
				return;
			}
		}


		var table = new Table();
		client.get(url + "/apikeys?pagesize=1000&sysfilter=equal(project_url_name:'" + currentProjectUrl + "')", {
			headers: {
				Authorization: "CALiveAPICreator " + apiKey + ":1",
				"Content-Type": "application/json"
			}
		}, function (data) {
			if (data.errorMessage) {
				console.log(data.errorMessage.red);
				return;
			}
			printObject.printHeader('Auth Tokens');

			_.each(data, function (p) {
				table.cell("Ident", p.ident);
				table.cell("Name", p.name);
				table.cell("Account URL", p.account_url_name);
				table.cell("Project URL", p.project_url_name);
				table.cell("APKey", p.apikey);
				table.cell("Active", p.is_active);
				table.cell("Data", p.data || "");
				//table.cell("Logging", p.logging);
				table.cell("Roles", p.roles);
				table.cell("Expiration", p.expiration);
				var comments = p.description;
				if (!comments) {
					comments = "";
				}
				else if (comments.length > 50) {
					comments = comments.substring(0, 47) + "...";
				}

				var displayRoles = "";
				var sep = "";
				//calling roles here does not hold the roles
				//console.log(Array.isArray(roles));

				//table.cell("Description", comments);
				table.newRow();
			});
			table.sort(['Name', 'name']);
			if (data.length === 0) {
				console.log('There are no auth tokens defined for this project'.yellow);
			}
			else {
				console.log(table.toString());
			}

			printObject.printHeader("# auth tokens: " + data.length);
		});

	},
	export: function (cmd) {
		var client = new Client();

		var loginInfo = login.login(cmd);
		if (!loginInfo)
			return;
		var url = loginInfo.url;
		var apiKey = loginInfo.apiKey;
		var projIdent = cmd.project_ident;
		var currentProjectUrl = dotfile.getCurrentProjectUrl();
		if (!projIdent) {
			projIdent = dotfile.getCurrentProject();
			if (!projIdent) {
				console.log('There is no current project.'.yellow);
				return;
			}
		}

		var filter = null;
		if (projIdent) {
			filter = "sysfilter=equal(project_url_name:'" + currentProjectUrl + "')";
		} else {
			console.log('Missing parameter: please specify project settings (use list) project_ident '.red);
			return;
		}


		var toStdout = false;
		if (!cmd.file) {
			toStdout = true;
		}

		client.get(loginInfo.url + "/apikeys?pagesize=1000&" + filter + "&sysfilter=equal(is_created_by_auth_service:false)", {
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
				console.log(("Token not found").red);
				return;
			}
			for (var idx = 0; idx < data.length; idx++) {
				delete data[idx].ident;
				delete data[idx]['@metadata']
			}

			if (toStdout) {
				console.log(JSON.stringify(data, null, 2));
			}
			else {
				var exportFile = fs.openSync(cmd.file, 'w+', 0600);
				fs.writeSync(exportFile, JSON.stringify(data, null, 2));
				console.log(('Auth Tokens have been exported to file: ' + cmd.file).green);
			}
		});
	},
	del: function (cmd) {
		var client = new Client();
		var loginInfo = login.login(cmd);
		if (!loginInfo) {
			console.log('You are not currently logged into a CA Live API Creator server.'.red);
			return;
		}
		var projIdent = cmd.project_ident;
		if (!projIdent) {
			projIdent = dotfile.getCurrentProject();
			if (!projIdent) {
				console.log('There is no current project.'.yellow);
				return;
			}
		}
		var filt = "equal(project_ident:" + projIdent;
		if (cmd.ident) {
			filt += ",ident:" + cmd.ident + ")";
		} else {
			console.log('Missing parameter: please specify ident'.red);
			return;
		}

		client.get(loginInfo.url + "/admin:apikeys?sysfilter=" + filt, {
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
				console.log(("Apikey not found").red);
				return;
			}
			if (data.length > 1) {
				console.log(("Error: more than one apikey for the given condition: " + filter).red);
				return;
			}
			var db = data[0];
			var startTime = new Date();
			client['delete'](db['@metadata'].href + "?checksum=" + db['@metadata'].checksum, {
				headers: {
					Authorization: "CALiveAPICreator " + loginInfo.apiKey + ":1",
					"Content-Type": "application/json"
				}
			}, function (data2) {
				var endTime = new Date();
				if (data2.errorMessage) {
					console.log(data2.errorMessage.red);
					return;
				}
				printObject.printHeader('APIKey was deleted, including the following objects:');
				_.each(data2.txsummary, function (obj) {
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
	import: function (cmd) {
		var client = new Client();
		var loginInfo = login.login(cmd);
		if (!loginInfo) {
			return;
		}

		var projIdent = cmd.project_ident;
		if (!projIdent) {
			projIdent = dotfile.getCurrentProject();
			if (!projIdent) {
				console.log('There is no current project.'.yellow);
				return;
			}
		}
		if (!cmd.file) {
			cmd.file = '/dev/stdin';
		}

		var fileContent = JSON.parse(fs.readFileSync(cmd.file));
		if (Array.isArray(fileContent) && fileContent.length > 0) {
			for (var i = 0; i < fileContent.length; i++) {
				fileContent[i].project_ident = projIdent;
				delete fileContent[i].ts;
				fileContent[i]["@metadata"] = {action: "MERGE_INSERT", key: ["name", "project_ident"]};
			}
		} else {
			fileContent.project_ident = projIdent;
			delete fileContent.ts;
			fileContent["@metadata"] = {action: "MERGE_INSERT", key: ["project_ident", "name"]};
		}

		var startTime = new Date();
		client.put(loginInfo.url + "/apikeys", {
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
			printObject.printHeader('Authentication Token(s) created, including:');
			if (data.statusCode == 200) {
				console.log("Request took: " + (endTime - startTime) + "ms");
				return;
			}
			var newTokens = _.find(data.txsummary, function (p) {
				return p['@metadata'].resource === 'apikeys';
			});
			if (!newTokens) {
				console.log('ERROR: unable to find imported auth tokens'.red);
				return;
			}
			if (cmd.verbose) {
				_.each(data.txsummary, function (obj) {
					printObject.printObject(obj, obj['@metadata'].entity, 0, obj['@metadata'].verb);
				});
			}
			else {
				printObject.printObject(newTokens, newTokens['@metadata'].entity, 0, newTokens['@metadata'].verb);
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
	}
};
