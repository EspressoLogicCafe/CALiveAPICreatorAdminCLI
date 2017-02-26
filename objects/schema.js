var Client = require('node-rest-client').Client;
var colors = require('colors');
var _ = require('underscore');
var Table = require('easy-table');
var fs = require('fs');
//var context = require('./context.js');
var login = require('../util/login.js');
var printObject = require('../util/printObject.js');
var dotfile = require('../util/dotfile.js');

module.exports = {
	doSchema: function(action, cmd) {
		if (action === 'create') {
			module.exports.create(cmd);
		}
		else {
			console.log('You must specify an action: create');
			//program.help();
		}
	},
	
	create: function (cmd) {
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
		if (projIdent) {
			filter = "?projectId=" + projIdent;
		} else {
			console.log('Missing parameter: please specify project settings (use: lacadmin project use --url_name [urlname]) project_ident '.red);
			return;
		}
		if(cmd.ignoredbcolumntype){
			filter += "&ignoredbcolumntype="+cmd.ignoredbcolumntype;
		}
		if(cmd.ignoreprimarykeyname){
			filter += "&ignoreprimarykeyname="+cmd.ignoreprimarykeyname;
		}
		if(cmd.ignoreconstraintname){
			filter += "&ignoreconstraintname="+cmd.ignoreconstraintname;
		}
		if(cmd.skiprelationships){
			filter += "&skiprelationships="+cmd.skiprelationships;
		}
		if(cmd.skiptablecreation){
			filter += "&skiptablecreation="+cmd.skiptablecreation;
		}
		var prefix = "";
		if (cmd.prefix) {
			prefix = "/" + cmd.prefix ;
		} else {
			console.log('Missing parameter: prefix (must be marked as schema editable) '.red);
			return;	
		}
		if ( ! cmd.file) {
			cmd.file = '/dev/stdin';
		}
		
		var fileContent = JSON.parse(fs.readFileSync(cmd.file));
			
		client.post(url + "/@schema"+ prefix + filter, {
			data: fileContent,
			headers: {
				Authorization: "CALiveAPICreator " + loginInfo.apiKey + ":1",
				"Content-Type" : "application/json"
			}
		}, function(data) {
			console.log(data );
			if (data.errorMessage) {
				console.log(("Error: " + data.errorMessage).red);
				return;
			}
			if (data.length === 0) {
				console.log(("Error: no such prefix (or is not editable)").red);
				return;
			}
			console.log(('Schema has been created' ).green);
		});
	}
};
