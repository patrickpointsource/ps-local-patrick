// Run via `node server/v3/designDocuments/test.js dev`

if(process.argv.length != 3){
    console.log('usage: node load.js {stage,prod,demo,dev,test}');
    process.exit(1);
}

var config = require('../../config/config.js');
var env = process.argv[2];
var dbName = config.cloudant[env].db;
var dbAccount = config.cloudant[env].account;
var dbApiKey = config.cloudant[env].user;
var dbPwd = config.cloudant[env].password;

var dbConnParams = {
    account: dbAccount,
    key: "blehrietherieldstlyievio",
    password: "yU1lWnVqAqfKEKu2ywLI4Wok",
    request_defaults: {
        maxSockets: 30
    }
}; 
var Cloudant = require('cloudant')(dbConnParams);
var db = Cloudant.db.use(dbName);

var _ = require('underscore');

console.log('Attempting to get AllTasks');
db.view("Tasks", "AllTasks", function(err, allTasks){
    if(!err && allTasks){
        console.log('Got AllTasks?', allTasks.rows);
        
        console.log('Searching AllTasks');
        db.search("Tasks", "SearchAllTasks", {
            q: 'name:time*',
            include_docs: true
        }, function(err, results){
            console.log('SearchAllTasks?', results.rows);
        })
    }
});