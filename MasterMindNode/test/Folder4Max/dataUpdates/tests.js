var config = require('../../../server/config/config.js');
//var dbAccess = require( '../../../server/data/dbAccess.js' );
var dbAccess = require( './dbUtils.js' );

var q={"form": "Hours", 
		"project.resource": {"$in" : ["projects/52b0a6c2e4b02565de24922d"]},
		"person.resource": {"$in": ["people/531dc05fe4b0a300af62db98", "people/52ab7005e4b0fd2a8d130016"]},
		"date": {"$gte":"2014-10-01"}};

dbAccess.cloudantQuerySearch(q, function (err, body){
	if (err) 
		{console.log(err);}
	else
	{
		body.docs.forEach(function(d) {
			console.log("id:" + d._id + " : date:" + d.date + " : person:" + d.person.resource + " : project:" + d.project.resource);
		});
	}
});
