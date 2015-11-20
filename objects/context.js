var Client = require('node-rest-client').Client;

var login = require('../util/login.js');

module.exports = {
	getContext: function (cmd, cb) {
		var client = new Client();
		
		var loginInfo = login.login(cmd);
		if ( ! loginInfo) { return; }

		client.get(loginInfo.url + "/accounts", {
			headers: {
				Authorization: "CALiveAPICreator " + loginInfo.apiKey + ":1"
			}
		}, function(data) {
			if (data.errorMessage) {
				console.log(data.errorMessage.red);
				return;
			}
			if (data.length === 0) {
				console.log("Error: unable to find an account".red);
			}
			else if (data.length > 1) {
				console.log("Error: more than one account was found -- are you logging as sa?".red);
			}
			module.exports.account = data[0];
			
			if (cb) {
				cb();
			}
		});
	}
};

