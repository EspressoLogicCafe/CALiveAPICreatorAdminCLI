var Client = require('node-rest-client').Client;
var _ = require('underscore');

module.exports = {
	getSchema: function() {
		var loginInfo = login.login(cmd);
		if ( ! loginInfo)
			return;
		var url = loginInfo.url;
		var apiKey = loginInfo.apiKey;

		client.get(url + "/@tables/*", {
			headers: {
				Authorization: "CALiveAPICreator " + apiKey + ":1"
			}
		}, function(data) {
			if (data.errorMessage) {
				console.log(data.errorMessage.red);
				return;
			}
			exports.allTables = data;
		});
	}
};
