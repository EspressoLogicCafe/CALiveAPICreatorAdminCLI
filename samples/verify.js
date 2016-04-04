var apicreator = require('caliveapicreator');

console.log(" ");
console.log("Node SDK - verify that banking transfer of funds is found, with proper computed values");

var api = apicreator.connect('http://localhost:8080/APIServer/rest/default/banking/v1', 'demo','Password1');
var customerObject = api.endpoint('main:CUSTOMER');
customerObject.get('sysfilter=equal(CustNum: 1)').then(function (data) {
   // console.log(data);
 	var CheckingAcctBal = data[0].CheckingAcctBal;
 	var SavingsAcctBal = data[0].SavingsAcctBal;
 	var TotalBalance = data[0].TotalBalance;
	var data = { "FromAcct": 100, "FromCustNum": 1, "ToAcct": 200, "ToCustNum": 1,"TransferAmt": 5 };
	var transfer = api.endpoint('main:TRANSFER_FUNDS');
	var thePromise = transfer.post(data, {rulessummary: true});
	thePromise.then(function (txSummary) {
		console.log("Transfer of $5 Completed from Checking to Savings" );
	
		customerObject.get('sysfilter=equal(CustNum: 1)').then(function (data2) {
			console.log(".response returned, checking computed values... ");
			console.log("Start CheckingAcctBal="+CheckingAcctBal);  
			console.log("End CheckingAcctBal="+data2[0].CheckingAcctBal);  
			console.log("Total TotalBalance="+TotalBalance);  
			console.log("========================");
			console.log("Start SavingsAcctBal="+SavingsAcctBal);  
			console.log("End SavingsAcctBal="+data2[0].SavingsAcctBal);  
			console.log("Total TotalBalance="+data2[0].TotalBalance);  
			console.log("========================");
			if ( data2[0].CheckingAcctBal == (CheckingAcctBal - 5) &&  data2[0].SavingsAcctBal == (SavingsAcctBal + 5)) {
				console.log("....Success: values are correct - ");
			} else {
				console.log("** Expected values not found, Transfer of Funds...");
				console.log(JSON.stringify(data2,null,2));
			}
			console.log("End of Verify ...");
		});
	});
});