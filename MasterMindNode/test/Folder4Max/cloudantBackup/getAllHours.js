/*
 * Set of functions required for Cloudant DB Replicas (Backups) creation. 
 */

var config = require('../../server/config/config.js');
var nano = require('nano')(config.cloudant.url);
//var nano = require('nano');

function doTest() {
	getData();
};



function getData() {
	var db = nano.db.use('mm_db_demo');
    var params = {"keys" : [["Project", "projects/52b06e5fe4b02565de24922c"], ["Project", "tasks/535673593004dbe1ec073b6f"]]};
	
	db.view ('views', 'AllHoursInOne?include_docs=true', params, function(err, body){
        if (err) {
            console.log(err);
        } else {
          console.log(body);
        }
	});	
};


doTest(null, null);

