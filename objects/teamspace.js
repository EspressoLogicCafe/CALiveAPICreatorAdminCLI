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
		else if (action === 'exportRepos') {
			module.exports.exportRepos(cmd);
		}
		else if (action === 'import') {
			module.exports.import(cmd);
		}
		else {
			console.log('You must specify an action: list or exportRepos');
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


		client.get(url + "/admin:accounts?pagesize=100&&sysorder=(name:asc_uc,name:desc)", {
			headers: {
				Authorization: "CALiveAPICreator " + apiKey + ":1",
				"Content-Type": "application/json"
			}
		}, function (data) {
			if (data.errorMessage) {
				console.log(data.errorMessage.red);
				return;
			}
			printObject.printHeader('TeamSpace(s)');
			var table = new Table();
			var type = "";
			_.each(data, function (p) {
				table.cell("Ident", p.ident);
				table.cell("Name", p.name);
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
				table.newRow();
			});
			table.sort(['Name']);
			console.log(table.toString());
			printObject.printHeader("# teamspace(s): " + data.length);
		});
		if (cmd.verbose) {
			client.get(url + "/projects" + "?pagesize=100&sysorder=(ident)", {
				headers: {
					Authorization: "CALiveAPICreator " + apiKey + ":1",
					"Content-Type": "application/json"
				}
			}, function (projects) {
				if (projects.errorMessage) {
					console.log(projects.errorMessage.red);
					return;
				}
				console.log("export directory=~/temp");
				_.each(projects, function (p) {
					console.log("#lacadmin api export --url_name " + p.url_name + " --format zip --file PROJECT_"+p.url_name +".zip");
					console.log("#lacadmin api extract --file PROJECT_" + p.url_name + ".zip --directory ${directory}  --synchronize true" );
					console.log("#lacadmin api import --file PROJECT_" + p.url_name + ".zip --namecollsion replace_existing" );
				});
			});
		}

	},
	exportRepos: function (cmd) {
		var client = new Client();
		//console.log(api.list(cmd));
		var loginInfo = login.login(cmd);
		if (!loginInfo)
			return;
		var url = loginInfo.url;
		var apiKey = loginInfo.apiKey;
		var filter = "";
		var dir = "";
		if (cmd.directory) {
			dir = cmd.directory;
		}
		var format = cmd.format || "zip";
		var passwordStyle = cmd.passwordstyle || "skip";
		var authTokenStyle = cmd.authTokenstyle || "skip_auto";
		var apiOptionsStyle = cmd.apioptionsstyle || "emit_all";
		var libraryStyle = cmd.librarystyle || "emit_all";
		var filename = cmd.file || "ALL_REPOS." + format;

		function exportAPIPromisified(cmd) {
			return new Promise(function (resolve, reject) {
				api.exportToFile(cmd, function (err, res) {
					if (err) {
						reject(err);
					}
					else {
						resolve(res);
					}
				});
			});
		}

		client.get(url + "/projects" + "?pagesize=100&sysorder=(ident)", {
			headers: {
				Authorization: "CALiveAPICreator " + apiKey + ":1",
				"Content-Type": "application/json"
			}
		}, function (projects) {
			if (projects.errorMessage) {
				console.log(projects.errorMessage.red);
				return;
			}
			var listOfUrls = "";
			var sep = "";
			_.each(projects, function (p) {
				cmd.ident = p.ident;
				listOfUrls += sep + p.url_name;
				sep = ",";
			});
			// setup the defaults for export
			cmd.format = format;
			cmd.directory = dir;
			cmd.url_name = listOfUrls;
			cmd.file = filename;
			cmd.passwordstyle = passwordStyle;
			cmd.authTokenstyle = authTokenStyle;
			cmd.apioptionsstyle = apiOptionsStyle;
			cmd.librarystyle = libraryStyle;

			exportAPIPromisified(cmd);
		});
		//printObject.printTrailer("# projects exported: " + projects.length);
	},
	export: function (cmd) {
		var client = new Client();

		var loginInfo = login.login(cmd);
		if (!loginInfo)
			return;
		var url = loginInfo.url;
		var apiKey = loginInfo.apiKey;

		var filter = "";
		if (cmd.teamspace_name) {
			filter += "&sysfilter=equal(name:'" + cmd.teamspace_name + "')";
		}
		var toStdout = false;
		if (!cmd.file) {
			toStdout = true;
		}

		client.get(loginInfo.url + "/admin:accounts?pagesize=1000" + filter, {
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
				console.log(("TeamSpace not found " + filter).red);
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
				console.log(('TeamSpace have been exported to file: ' + cmd.file).green);
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
		client.put(loginInfo.url + "/admin:accounts", {
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
			printObject.printHeader('TeamSpace(s) created, including:');
			if (data.statusCode == 200) {
				console.log("Request took: " + (endTime - startTime) + "ms");
				return;
			}

			var newAPIVersion = _.find(data.txsummary, function (p) {
				return p['@metadata'].resource === 'admin:accounts';
			});
			if (!newAPIVersion) {
				console.log('ERROR: unable to find imported teamspace'.red);
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
	}
};
