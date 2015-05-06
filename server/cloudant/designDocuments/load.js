// Run via `node cloudant/designDocuments/load.js dev`
var stripJsonComments = require('strip-json-comments');
var fs = require('fs');
var _ = require('underscore');

if(process.argv.length != 3){
    console.log('usage: node load.js {stage,prod,demo,dev,test}');
    process.exit(1);
}
var env = process.argv[2];
var config;

var loadConfig = function(filename){
    var data = fs.readFileSync(__dirname + filename);
    var defaults = {};
    if(data){
        defaults = JSON.parse(stripJsonComments(data.toString()));
    }
    return defaults;
};
if(env == 'dev'){
    env = 'default';
    config = loadConfig('/../../config/default.json');
}else{
    config = loadConfig('/../../config/'+env+'.json');
}
var dbName = config.cloudant.db;
var dbAccount = config.cloudant.account;
var dbApiKey = config.cloudant.user;
var dbPwd = config.cloudant.password;

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
    'Tasks',
    'Projects',
    'SecurityRoles',
    'UserRoles'
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