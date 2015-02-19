//var config = require('../../../server/config/config.js');
//var dbAccess = require( '../../../server/data/dbAccess.js' );
var dbAccess = require( './dbUtils.js' );
var q;
//q={"form": "Hours", 
//		"project.resource": {"$in" : ["projects/52b0a6c2e4b02565de24922d"]},
//		"person.resource": {"$in": ["people/531dc05fe4b0a300af62db98", "people/52ab7005e4b0fd2a8d130016"]},
//		"date": {"$gte":"2014-10-01"}};

/*
q = {
		"form":"Hours",
"project.resource": {"$in":["projects/52b0a6c2e4b02565de24922d"]},
//"task.resource": {"$in": ["tasks/535673593004dbe1ec073b77"]}
"task.resource": "tasks/535673593004dbe1ec073b77",
"date":{"$gte":"2013-10-01","$lte":"2014-11-01"}
};
*/

//var projects = ["projects/52b0a6c2e4b02565de24922d"];
//var projects = ["projects/52b0a6c2e4b02565de24922d", "projects/52ef84e2e4b0509014b1d97a"];

var projects = [
"projects/2a4eb2d55c7b1fa635fd33a0b9148960",
"projects/49f93db4c3c1376dc7d2e4072c7e08e1",
"projects/52aba189e4b0fd2a8d13002e",
"projects/52b06ca5e4b02565de24922b",
"projects/52b06e5fe4b02565de24922c",
"projects/52b0a6c2e4b02565de24922d",
"projects/52c734e7e4b0911cacf4e130",
"projects/52c73aa8e4b0911cacf4e131",
"projects/52e02825e4b004c97d35e7c7",
"projects/52e2bed7e4b0f8e25528e85c",
"projects/52e423b1e4b0f8e25528e861",
"projects/52e42d53e4b0f8e25528e864",
"projects/52e4646be4b0f8e25528e865",
"projects/52eba85fe4b0f8e25528e86b",
"projects/52ebe378e4b0f8e25528e86c",
"projects/52ef82bbe4b0509014b1d978",
"projects/52ef839ce4b0509014b1d979",
"projects/52ef84e2e4b0509014b1d97a",
"projects/52ef854ce4b0509014b1d97b",
"projects/52ef85a9e4b0509014b1d97c",
"projects/52ef85fee4b0509014b1d97d",
"projects/52ef868ce4b0509014b1d97e",
"projects/52efbaf2e4b0509014b1d97f",
"projects/52efbba9e4b0509014b1d981",
"projects/52f4d4b9e4b0509014b1d98d",
"projects/52f4da07e4b0509014b1d991",
"projects/52f4e577e4b0509014b1d995",
"projects/52f4e658e4b0509014b1d997",
"projects/52f5439de4b0509014b1d998",
"projects/530231c8e4b01b8da31a20b2",
"projects/53023758e4b01b8da31a20b3",
"projects/53221a30e4b0dc5dc2fd8002",
"projects/533473e6e4b090a3c9f047ec",
"projects/533d6340e4b0a9a22a7fc504",
"projects/533dbd56e4b0a9a22a7fc50f",
"projects/53470463e4b0b0b4533ebca4",
"projects/535e669de4b0d71c8f7f3629",
"projects/53626ac8e4b0d71c8f7f365c",
"projects/53626c7ee4b0d71c8f7f3663",
"projects/53725a32e4b0c58093cf3e00",
"projects/537e0b6de4b0c58093cf3ea3",
"projects/538530f9e4b0c58093cf3ef0",
"projects/53874686e4b0c58093cf3f4d",
"projects/539097a8e4b02753c657771f",
"projects/53910f14e4b02753c65777c5",
"projects/5391e957e4b02753c65777fc",
"projects/53976ca0e4b0eaa1d385f46f",
"projects/5398718ae4b07ea884533e0c",
"projects/53a1c431e4b0fbfdf90a0496",
"projects/53a46d47e4b0fbfdf90a05a2",
"projects/53ac520be4b0fbfdf90a06a1",
"projects/53b561f2e4b0e8fc69c5caa9",
"projects/53c93f6de4b0e4a55cd32c55",
"projects/53ce6dd3e4b0e4a55cd32d63",
"projects/53d127f8e4b0e4a55cd32ec6",
"projects/53d1745be4b07bd2954375be",
"projects/53d23ea3e4b07bd29543760f",
"projects/53d240a7e4b07bd295437617",
"projects/53d24123e4b07bd295437619",
"projects/53dfe664e4b0c7de6916e4cf",
"projects/53e3abcfe4b055f3ad8b5cc6",
"projects/53e3b218e4b055f3ad8b5cc9",
"projects/53ecbbd0e4b06c92403f4ce3",
"projects/53fbcba0e4b0e587c077f20d",
"projects/5411db44e4b0e587c077f93b",
"projects/541a404be4b0e587c077fb8a",
"projects/541b3b3ee4b0e587c077fc0c",
"projects/541c22a0e4b0e587c077fc4e",
"projects/541dd87be4b0e587c077fce5",
"projects/54201a33e4b0e587c077fd0c",
"projects/542961ffe4b0e587c077ffa1",
"projects/54296355e4b0e587c077ffbc",
"projects/542c5edae4b0e587c07800ce",
"projects/5446cf77e4b0d6d616826edb",
"projects/54478bf3e4b0d6d616826ef4",
"projects/54495a35e4b0d6d616827010",
"projects/5db4581d606a394ce60591347b978c27",
"projects/74a18b34b6f30577c11d1d9c6d506237",
"projects/7d5e30f6fc28586c9cdd9996143be0cb",
"projects/8528b360bbef7de14eda085c1d90b330",
"projects/e0a5a184cd85d5b38e78a10f6b4100b2",
"projects/f618b90b7d82877900d4c9f65900b4a4"
];



var startDate = "2014-11-01";
var endDate = "2014-11-25";
var q = {
		"form": "Hours", 
		"project.resource": {"$exists": true, "$in" : projects},
		"date": {"$gte": startDate, "$lte": endDate  } 
};
console.log(q);


var s = new Date().getTime();
var e;


dbAccess.cloudantQuerySearch(q, function (err, body){
	if (err) 
		{console.log(err);}
	else
	{
		e = new Date().getTime();
		console.log("Query search took " + ((e-s)/1000) + " sec");		
		console.log("Got " + body.docs.length + " docs");
		//body.docs.forEach(function(d) {
		//	console.log("id:" + d._id + " : date:" + d.date + " : person:" + d.person.resource + " : project:" + d.project.resource);
		//});
	}
});


//dbAccess.deleteAllViewDocs();