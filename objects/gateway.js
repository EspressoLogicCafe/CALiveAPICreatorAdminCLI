var Client = require('node-rest-client').Client;
var colors = require('colors');
var _ = require('underscore');
var fs = require('fs');
var CLITable = require('cli-table');
var Table = require('easy-table');
var context = require('./context.js');
var login = require('../util/login.js');
var printObject = require('../util/printObject.js');
var dotfile = require('../util/dotfile.js');
var https = require('https');

module.exports = {
	doGateway: function(action, cmd) {
		if (action === 'publish') {
			module.exports.publish(cmd);
		}
		else {
			console.log('You must specify an action: publish');
			//program.help();
		}
	},
	
	publish: function(cmd) {
		var client = new Client();
		
		var loginInfo = login.login(cmd);
		if ( ! loginInfo)
			return;
		var urlname = dotfile.getCurrentProjectUrl();
		if(! urlname ){
			console.log("You must select and use a project. $lacadmin project use --url_name myProjectName".red);
			return;
		}
		var url = loginInfo.url;
		var apiKey = loginInfo.apiKey;
		var idx = url.indexOf("/abl");
		var swaggerURL = url.substring(0,idx) +"/default/"+urlname+"/v1";
	
		var filter = null;
		var username = ""
		if( cmd.username){
			username = cmd.username;
		}
		var password = "";
		if( cmd.password){
			password = cmd.password;
		}
		var apiGatewayHostname  = "";
		if( cmd.hostname){
			apiGatewayHostname = cmd.hostname;
		}
		var version = "1.0";
		if(cmd.version){
			version = cmd.version;
		}
		var port = 8443;
		if(cmd.port){
			port = cmd.port;
		}
		var toStdout = false;
		if ( ! cmd.file) {
			toStdout = true;
		}
		console.log("GET Swagger "+swaggerURL+"/@docs");
		
		client.get(swaggerURL + "/@docs", {
			headers: {
			//	Authorization: "CALiveAPICreator " + apiKey + ":1"
			}
		}, function(data) {
			//console.log('get result: ' + JSON.stringify(data, null, 2));
			if (data.errorMessage) {
				console.log(("Swagger Error: " + data.errorMessage).red);
				return;
			}
			if (data.length === 0) {
				console.log(("Error: no swagger @doc found for login").red);
				return;
			}
			if(cmd.file){
				var exportFile = fs.openSync(cmd.file, 'w+', 0600);
				fs.writeSync(exportFile, JSON.stringify(data, null, 2));
				console.log(('Swagger has been exported to file: ' + cmd.file).green);
			}
			//now publish to gateway.
			process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
			var gateway = "https://"+apiGatewayHostname+":"+port+"/lacman/1.0/publish";
			var auth = username+":"+password; 
			console.log("Connecting to; "+gateway);
			
			var options = {
			  hostname: apiGatewayHostname,
			  port: port,
			  path: '/lacman/1.0/publish',
			  data: data,
			  auth: auth,
			  method: 'PUT',
  			  agent: false
			};

			 var req = https.request(options, (res) => {
			  console.log('statusCode: ', res.statusCode);
			  console.log('headers: ', res.headers);

			  res.on('data', (d) => {
				process.stdout.write(d);
			  });
			});
			req.end();

			req.on('error', (e) => {
			  console.error(e);
			});
			
		});
	}
};
