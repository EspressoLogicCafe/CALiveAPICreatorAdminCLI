"// Use the new Managed Data Server services to create tables and columns
// Create a new Managed Data Server and a DataSource based on this server instance
// The project URL and prefix are required to make sure that tables end up in the correct package
// this uses the admin api endpoint (/rest/abl/admin/v2/) for all transactions
// var adminService = adminDataService();
// var config = {}; // set all the config settings below
// adminService.configure(config);
// adminService.createTable();
// var payload = { 'name':'colname', 'generic_type': 'string', 'size': 20, 'nullable': true };
// adminService.createColumn(payload);
// other services
// adminService.deleteColumn('colname');
// adminService.deleteTable();
//
out = java.lang.System.out;

function adminDataService() {

    var result = {};
    var configSetup = {
        adminApiKey : '',
        adminUrl : '',
        tableName: '',
        prefix: '',
        project_url: '',
        projectIdent: 0
    };

    result.configure = function configure(myConfig) {
        configSetup.adminApiKey  = myConfig.adminApiKey || 'demo_full';  // supply, or default
        configSetup.adminUrl \t = myConfig.adminUrl \t|| 'http://localhost:8080/APIServer/rest/abl/admin/v2/';
        configSetup.project_url  = myConfig.project_url || 'demo';
        configSetup.prefix \t\t = myConfig.prefix \t\t|| 'main';
        configSetup.tableName \t = myConfig.tableName \t|| 'MyTestTable1';
        configSetup.projectIdent = myConfig.projectIdent|| 0 ;
    };

    result.adminAuthWithURL = function adminAuthWithURL(url, username, password) {
        configSetup.adminUrl = url;
        return result.adminAuth(username,password);

    };

\tresult.adminAuth = function adminAuth(username, password) {
\t    var postJson = {};
\t    var adminkey = null;
\t\tvar url = configSetup.adminUrl + \"/@authentication\";
\t\tvar payload = {
\t\t\t'username':  username ,
\t\t\t'password':  password
\t\t};
\t\tvar errorMsg = null;
        var params = null;
        var settings = {
            headers : {
                'Content-Type' : 'application/json'
            }
        };

        try {
                out.println(\"adminAuth -  payload \" + JSON.stringify(payload,null,2));
                out.println(\"... via Rest URL: \" + url);
                out.println(\"... using settings: \" + JSON.stringify(settings));
                var authAttempt = SysUtility.restPost(url, params, settings, payload);
                out.println(authAttempt);
                postJson = JSON.parse(authAttempt);
                adminkey = postJson.apikey;
        }
        catch (e) {
            errorMsg = e.message;
        }

        var response = {
            errorMessage : errorMsg,
            response: postJson
        };

\t\treturn adminkey;\t\t
\t};
\t
\tresult.getProjectIdent = function getProjectIdent(project_url) {
\t\tvar ident = configSetup.projectIdent;
\t\tif(ident === 0 ) {
\t\t\tvar url = configSetup.adminUrl + \"/admin:projects?sysfilter=equal(url_name:'\" + project_url + \"')\";
\t\t\tvar json = result.adminGet(url);
\t\t\tif(json.hasOwnProperty(\"response\")){
\t\t\t\tident = json.response[0].ident;
\t\t\t\tconfigSetup.projectIdent = ident;
\t\t\t}
\t\t}
\t\treturn ident;
\t};
\t
\t//uses the config setup
\tresult.createNewTable = function createNewTable() {
\t    out.println(\"CREATE NEW TABLE :\"+configSetup.prefix +\":\"+ configSetup.tableName);
\t\treturn result.createTable(configSetup.tableName, configSetup.project_url, configSetup.prefix);
\t};
\t
\tresult.createTable = function createTable(tablename,project_url,prefix) {
\t\tvar projectIdent = result.getProjectIdent(project_url);
\t\tvar url = configSetup.adminUrl + '/@tables/' + prefix + '?projectId='+projectIdent;
\t\tvar payload = {
\t\t\t'entity':  tablename
\t\t};
\t\treturn result.adminPost(url, payload);
\t};
\t/// payload { 'name':'colname', 'generic_type': 'string', 'size': 20, 'nullable': true }
\tresult.createNewColumn = function createNewColumn(columnPayload) {
\t     out.println(\"CREATE NEW COLUMN :\"+configSetup.prefix +\":\"+ configSetup.tableName);
\t\treturn result.createColumn(configSetup.tableName, configSetup.project_url, configSetup.prefix, columnPayload);
\t};
\t
\tresult.createColumn = function createColumn(tablename, project_url, prefix, columnPayload) {
\t\tvar projectIdent = result.getProjectIdent(project_url);
\t\tvar response = \"\";
\t\tvar url = configSetup.adminUrl + '/@columns/' + prefix + \":\"+ tablename +'?projectId='+projectIdent;
\t\tif(Array.isArray(columnPayload) && columnPayload.length > 0 ){
\t\t\tfor(var row in columnPayload) {
\t\t\t\tresponse += result.adminPost(url , row);
\t\t\t\tresponse += \"\
\";
\t\t\t}
\t\t} else {
\t\t\tresponse = result.adminPost(url , columnPayload);
\t\t}
\t\treturn response;
\t};

\tresult.deleteTable = function deleteTable() {
\t\treturn result.deleteExistingTable(configSetup.tableName,configSetup.project_url,configSetup.prefix);
\t};
\t
\tresult.deleteExistingTable = function deleteExistingTable(tablename,project_url,prefix) {
\t\tvar projectIdent = result.getProjectIdent(project_url);
\t\tvar url = configSetup.adminUrl + '/@tables/' + prefix + ':' + tablename+ '?projectId='+projectIdent;
\t\treturn result.adminDelete(url);
\t};
\t
\tresult.deleteColumn = function deleteColumn(columnName) {
\t\treturn result.deleteExistingColumn(configSetup.tableName,configSetup.project_url,configSetup.prefix,columnName);
\t};
\t
\tresult.deleteExistingColumn = function deleteExistingColumn(tablename,project_url,prefix,columnName) {
\t\tvar projectIdent = result.getProjectIdent(project_url);
\t\tvar url = configSetup.adminUrl + '/@columns/' + prefix + ':' + tablename + '/'+ columnName + '?projectId='+projectIdent;
\t\treturn result.adminDelete(url);
\t};
\t
    result.adminPost = function adminPost(url, payload) {

        var roles = [];
        var postJson = {};
        var errorMsg = null;
        var params = null;
        var settings = {
            headers : {
                'Authorization' : 'CALiveAPICreator ' + configSetup.adminApiKey + ':1',
                'Content-Type' : 'application/json'
            }
        };

        try {
                out.println(\"adminPost -  payload \" + JSON.stringify(payload,null,2));
                out.println(\"... via Rest URL: \" + url);
                out.println(\"... using settings: \" + JSON.stringify(settings));
                var postAttempt = SysUtility.restPost(url, params, settings, payload);
                out.println(postAttempt);
                postJson = JSON.parse(postAttempt);

        }
        catch (e) {
            errorMsg = e.message;
        }

        var response = {
            errorMessage : errorMsg,
            response: postJson
        };
        return response;
    };

\t result.adminGet = function adminPost(url) {

        out.println(\"adminPost called...\");

        var roles = [];
        var getResponse = {};
        var errorMsg = null;
        var params = null;
        var settings = {
            headers : {
                'Authorization' : 'CALiveAPICreator ' + configSetup.adminApiKey + ':1'
            }
        };

        try {
                out.println(\"adminGet - \");
                out.println(\"... via Rest URL: \" + url);
                out.println(\"... using settings: \" + JSON.stringify(settings));
                var getAttempt = SysUtility.restGet(url, params, settings);
                out.println(getAttempt);
                getResponse = JSON.parse(getAttempt);

        }
        catch (e) {
            errorMsg = e.message;
        }

        var response = {
            errorMessage : errorMsg,
            response: getResponse
        };
        return response;
    };

    result.adminDelete = function adminDelete(url) {

        var roles = [];
        var deleteJson = {};
        var errorMsg = null;
        var params = null;
        var settings = {
            headers : {
                'Authorization' : 'CALiveAPICreator ' + configSetup.adminApiKey + ':1',
                'Content-Type' : 'application/json'
            }
        };

        try {
                out.println(\"adminDelete \");
                out.println(\"... via Rest URL: \" + url);
                out.println(\"... using settings: \" + JSON.stringify(settings));
                var deleteAttempt = SysUtility.restDelete(url, params, settings);
                out.println(deleteAttempt);
                deleteJson = JSON.parse(deleteAttempt);

        }
        catch (e) {
            errorMsg = e.message;
        }



        var response = {
            errorMessage : errorMsg,
            response: deleteJson
        };
        return response;
    };

    return result;
}
"
