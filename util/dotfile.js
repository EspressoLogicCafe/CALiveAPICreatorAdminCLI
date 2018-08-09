var osenv = require('osenv');
var fs = require('fs');
var querystring = require("querystring");
var _ = require('underscore');

module.exports = {
	
	// Get the name of the dot directory.
	getDotDirectory: function(createIfNotExists) {
		var dotDirName = osenv.home() + "/.liveapicreator";
		if ( ! fs.existsSync(dotDirName)) {
			if (createIfNotExists) {
				fs.mkdirSync(dotDirName, 0700);
				fs.mkdirSync(dotDirName + "/admin", 0700);
				return dotDirName;
			}
			else {
				return null;
			}
		}
		dotDirName += "/admin";
		if ( ! fs.existsSync(dotDirName)) {
			if (createIfNotExists) {
				fs.mkdirSync(dotDirName, 0700);
			}
			else {
				return null;
			}
		}
		return dotDirName;
	},
	
	// Write the given data to the dot file with the given URL
	writeToDotFile: function(name, data) {
		var dotDirName = this.getDotDirectory(true);
		return new Promise(function(resolve,reject) {
					var dotFileName = dotDirName + "/" + querystring.escape(name) + "--" + data.userName;
					var dotFile = fs.openSync(dotFileName, 'w', 0600);
					var numOfBytes = fs.writeSync(dotFile, JSON.stringify(data, null, 2));
					if(numOfBytes>0){
						resolve(numOfBytes);
					}else{
						reject("Data could'nt be written to the dot file :"+dotFileName);
					}
		} );
	},
	
	deleteDotFile: function(url, userName) {
		var dotDirName = this.getDotDirectory(true);
		if ( ! dotDirName) {
			return null;
		}
		var allFiles = fs.readdirSync(dotDirName);
		_.each(allFiles, function(f) {
			if (f === 'currentServer.txt') {
				return;
			}
			var fileContent = JSON.parse(fs.readFileSync(dotDirName + "/" + f));
			if (fileContent.url === url && fileContent.userName === userName) {
				//console.log('Deleting login file: ' + f);
				fs.unlinkSync(dotDirName + "/" + f);
			}
		});
	},
	
	// Delete the dot file for the given alias.
	// Return true if successful, false otherwise
	deleteDotFileForAlias: function(alias) {
		var dotFile = this.getDotFileForAlias(alias);
		if ( ! dotFile) {
			return false;
		}
		try { fs.unlinkSync(dotFile); } catch(e) {}
		return true;
	},
	
	getDotFileForAlias: function(alias) {
		var dotDirName = this.getDotDirectory(false);
		if ( ! dotDirName) {
			return null;
		}
		var allFiles = fs.readdirSync(dotDirName);
		var dotFile = _.find(allFiles, function(f) {
			if (f === 'currentServer.txt') {
				return false;
			}
			var fileContent = JSON.parse(fs.readFileSync(dotDirName + "/" + f));
			return fileContent.alias === alias;
		});
		if ( ! dotFile) {
			return null;
		}
		return dotDirName + "/" + dotFile;
	},
	
	getLoginForAlias: function(alias) {
		var dotFileName = this.getDotFileForAlias(alias);
		if ( ! fs.existsSync(dotFileName)) {
			return null;
		}
		var keyObject = JSON.parse(fs.readFileSync(dotFileName));
		var expiration = Date.parse(keyObject.loginInfo.expiration);
		if (expiration > new Date()) {
			return keyObject;
		}
		console.log('The API key for this server has expired - you need to log in again'.yellow);
		this.deleteDotFileForAlias(alias);
		return null;
	},
	
	// Get the API key for the given URL, if available and current
	getApiKey: function(url, userName) {
		//console.log('Getting API key for user: ' + userName);
		var dotDirName = this.getDotDirectory();
		var dotFileName = dotDirName + "/" + querystring.escape(url) + "--" + userName;
		if ( ! fs.existsSync(dotFileName)) {
			return null;
		}
		var keyObject = JSON.parse(fs.readFileSync(dotFileName));
		var expiration = Date.parse(keyObject.loginInfo.expiration);
		if (expiration > new Date()) {
			return keyObject.loginInfo.apikey;
		}
		console.log('The API key for this server has expired - you need to log in again'.yellow);
		this.deleteDotFile(url, userName);
		return null;
	},
	
	// Write the given URL to ~/.calivecreatoradmin/currentServer.txt
	setCurrentServer: function(url, login) {
		var dotDirName = this.getDotDirectory();
		var dotFileName = dotDirName + "/currentServer.txt";
		var dotFile = fs.openSync(dotFileName, 'w', 0600);
		var record = {
			url: url,
			userName: login.userName
		};
		fs.writeSync(dotFile, JSON.stringify(record));
	},
	
	// If there is a ~/currentServer.txt, return its content, otherwise null
	getCurrentServer: function() {
		var dotDirName = this.getDotDirectory();
		var dotFileName = dotDirName + "/currentServer.txt";
		if ( ! fs.existsSync(dotDirName)) {
			return null;
		}
		var objStr = fs.readFileSync(dotFileName);
		return JSON.parse(objStr);
	},
	
	unsetCurrentServer: function() {
		var dotDirName = this.getDotDirectory();
		var dotFileName = dotDirName + "/currentServer.txt";
		if (dotDirName) {
			if ( ! fs.existsSync(dotFileName)) {
				 //console.log("not logged into a server");
				 return null;
			}
			fs.unlinkSync(dotFileName,function(err){
				if(err) {console.log("not logged into a server")};
			});
		}
	},
	
	setCurrentProject: function(projectIdent, projName,url) {
		var dotDirName = this.getDotDirectory();
		if ( ! fs.existsSync(dotDirName)) {
			return null;
		}
		var dotFileName = dotDirName + "/currentServer.txt";
		if ( ! fs.existsSync(dotFileName)) {
			return null;
		}
		var record = JSON.parse(fs.readFileSync(dotFileName));
		record.currentProject = projectIdent;
		record.currentProjectName = projName;
		record.currentProjectUrl = url;
		var dotFile = fs.openSync(dotFileName, 'w', 0600);
		fs.writeSync(dotFile, JSON.stringify(record));
		if (projectIdent) {
			console.log(('Current project is now: ' + projName + " (" + projectIdent + ")").green);
		}
	},
	
	// Get the ident of the current project, if any
	getCurrentProject: function() {
		var dotDirName = this.getDotDirectory();
		if ( ! fs.existsSync(dotDirName)) {
			return null;
		}
		var dotFileName = dotDirName + "/currentServer.txt";
		if ( ! fs.existsSync(dotFileName)) {
			return null;
		}
		var record = JSON.parse(fs.readFileSync(dotFileName));
		return record.currentProject;
	},
	
	// Get the ident of the current project, if any
	getCurrentProjectName: function() {
		var dotDirName = this.getDotDirectory();
		if ( ! fs.existsSync(dotDirName)) {
			return null;
		}
		var dotFileName = dotDirName + "/currentServer.txt";
		if ( ! fs.existsSync(dotFileName)) {
			return null;
		}
		var record = JSON.parse(fs.readFileSync(dotFileName));
		return record.currentProjectName;
	},
	// Get the ident of the current project, if any
	getCurrentProjectUrl: function() {
		var dotDirName = this.getDotDirectory();
		if ( ! fs.existsSync(dotDirName)) {
			return null;
		}
		var dotFileName = dotDirName + "/currentServer.txt";
		if ( ! fs.existsSync(dotFileName)) {
			return null;
		}
		var record = JSON.parse(fs.readFileSync(dotFileName));
		return record.currentProjectUrl;
	}
};