// Run via `node server/v3/designDocuments/load.js dev`

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
var loadLocalDocument = function(documentName){
    var doc = require('./'+documentName);
    if(doc.indexes){
        _.each(doc.indexes, function(search, key){
            search.index = search.index.toString();
            doc.indexes[key] = search;
        });
    }
    return doc;
};

var docs = [
    'Tasks'
];
_.each(docs, function(docName){
    var localDoc = loadLocalDocument(docName);
    console.log('got '+docName+' on disk:', localDoc);
    if(localDoc){
        db.get('_design/'+docName, function(err, doc){
            if(!err && doc){
                console.log('got '+docName+'?', doc);
                localDoc._rev = doc._rev;
            }
            db.insert(localDoc, '_design/'+docName, function(err, doc){
                console.log('successfully loaded localDoc?', arguments);
            });
        });
    }
});