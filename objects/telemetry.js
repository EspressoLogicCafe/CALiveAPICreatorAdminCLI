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
	doTelemetry: function (action, cmd) {
		if (action === 'list') {
			module.exports.list(cmd);
		} else if (action === 'update') {
			module.exports.update(cmd);
		} else {
			console.log('You must specify an action: list or update');
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

		client.get(url + "/admin:server_properties?sysfilter=like(prop_name:'telemetry%')&pagesize=100&&sysorder=(prop_name:asc_uc,prop_name:desc)", {
			headers: {
				Authorization: "CALiveAPICreator " + apiKey + ":1",
				"Content-Type": "application/json"
			}
		}, function (raw) {
			if (raw.errorMessage) {
				console.log(raw.errorMessage.red);
				return;
			}
			//Flatten the data object
			var table = new Table();
			var verboseDisplay = "";
			var data = [];
			var row = {};
			_.each(raw, function (r) {
				row[r.prop_name] = r.prop_value;
			});
			data.push(row);

			printObject.printHeader('Telemetry');
			_.each(data, function (p) {

				table.cell("ChargeBack", p.telemetry_chargeback_id);
				table.cell("DomainName", p.telemetry_domain_name);
				table.cell("PLA Enabled", p.telemetry_pla_enabled);
				table.cell("Send Telemetry", p.telemetry_send_enabled);
				table.cell("Site ID", p.telemetry_site_id);
				table.cell("Proxy URL", p.telemetry_proxy_url);
				table.cell("Proxy Port", p.telemetry_proxy_port);
				table.cell("Proxy UserName", p.telemetry_proxy_username);
				table.cell("Proxy PW", "<hidden>");
				table.newRow();
				if (cmd.verbose) {
					verboseDisplay += "\n";
					verboseDisplay += "lacadmin telemetry update "
						+ " --chargebackID " + (p.telemetry_chargeback_id || 'id')
						+ " --domainName '" + (p.telemetry_domain_name || 'name')
						+ "' --plaEnabled " + (p.telemetry_pla_enabled || false)
						+ " --sendEnabled " + (p.telemetry_send_enabled || false)
						+ " --siteID " + (p.telemetry_site_id || 12345)
						+ " --proxyURL " + (p.telemetry_proxy_url || 'http://localhost')
						+ " --proxyPort " + (p.telemetry_proxy_port || 9999)
						+ " --proxyUsername '" + (p.telemetry_proxy_username || 'usernmae')
						+ "' --proxyPassword '<password>'"
					"'\n";

				} else {
					console.log("  use the --verbose flag to see a detail update string.");
				}
			});

			console.log(table.toString());
			printObject.printHeader("# telemetry: " + data.length);
			if (cmd.verbose) {
				console.log(verboseDisplay);
			}
		});

	},
	update: function (cmd) {
		var client = new Client();

		var loginInfo = login.login(cmd);
		if (!loginInfo)
			return;
		var url = loginInfo.url;
		var apiKey = loginInfo.apiKey;

		function update(title, propvalue, propname, datatype, json) {
			if (propvalue) {
				var found = false;
				switch (datatype) {
					default:
						break;
					case "string":
						break;
					case "number":
						if (isNaN(propvalue)) {
							console.log(("Property " + title + " must be a number " + propvalue).red);
							return;
						}
						break;
					case "boolean":
						if (String(propvalue) !== 'true' && String(propvalue) !== 'false') {
							console.log(("Property " + title + " must be true or false " + propvalue).red);
							return;
						}
						break;
				}
				console.log(title + "Set prop_value = " + propvalue + " for prop_name = " + propname);
				for (var i in json) {
					if (json[i].prop_name === propname) {
						found = true;
						delete json[i].ts;
						json[i].prop_value = propvalue;
						json[i]["@metadata"] = {action: "MERGE_INSERT", key: "prop_name"};
					}
				}
				if (!found) {
					var row = {
						"prop_name": propname,
						"prop_value": propvalue,
						"@metadata": {action: "MERGE_INSERT", key: "prop_name"}
					};
					json.push(row);
				}
			} else {
				console.log(("property name " + title + " property value not set").yellow);
				return;
			}
		};

		var filter = null;


		var toStdout = false;
		if (!cmd.file) {
			toStdout = true;
		}
		client.get(loginInfo.url + "/admin:server_properties?sysfilter=like(prop_name:'telemetry%')&pagesize=100", {
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
				console.log(("Telemetry properties not found").red);
				//return;
			}

			update("--chargebackID", cmd.chargebackID, "telemetry_chargeback_id", "string", data);
			update("--domainName (CDmain Name)", cmd.domainName, "telemetry_domain_name", "string", data);
			update("--plaEnabled (PLA Enabled)", cmd.plaEnabled, "telemetry_pla_enabled", "boolean", data);
			update("--sendEnabled (Send Telemetry)", cmd.sendEnabled, "telemetry_send_enabled", "boolean", data);
			update("--siteID (Site ID)", cmd.siteID, "telemetry_site_id", "string", data);
			update("--proxyURL (Proxy UR)L", cmd.proxyURL, "telemetry_proxy_url", "string", data);
			update("--proxyPort (Proxy Port)", cmd.proxyPort, "telemetry_proxy_port", "number", data);
			update("--proxyUsername (Proxy Username)", cmd.proxyUsername, "telemetry_proxy_username", "string", data);
			update("--proxyPassword (Proxy Password plaintext)", cmd.proxyPassword, "telemetry_proxy_plain_password", "string", data);
			//console.log(data);

			client.put(loginInfo.url + "/admin:server_properties", {
				data: data,
				headers: {
					Authorization: "CALiveAPICreator " + loginInfo.apiKey + ":1",
					"Content-Type": "application/json"
				}
			}, function (data) {
				if (data.errorMessage) {
					console.log(data.errorMessage.red);
					return;
				}
				printObject.printHeader('Telemetry(s) values updated:');
				if (data.statusCode == 200) {
					//console.log("Request took: " + (endTime - startTime) + "ms");
					console.log("Changes to Telemetery require a server restart");
					return;
				}
			});


		});
	}
};
