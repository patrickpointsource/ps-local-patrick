var _ = require('underscore'),
    async = require('async');

module.exports = function(dbAccess, callback){
    var db = dbAccess.db;
    db.view('Projects', 'AllProjects', function(err, allDocs){
        if(err){
            return callback(err);
        }
        
        var toUpdate = [];
        var finish = function(doc, clientID, callback){
            delete doc.value.customerName;
            doc.value.client = clientID;
            toUpdate.push(doc.value);
            callback();
        };
        var addedClients = {};
        async.each(allDocs.rows, function(doc, callback){
            if(doc.value && doc.value.customerName){
                if(addedClients[doc.value.customerName]){
                    // We've already added a client with this name!
                    return finish(doc, addedClients[doc.value.customerName], callback);
                }
                
                // We need to add a client with this name
                db.insert({
                    form: 'Clients',
                    name: doc.value.customerName
                }, function(err, client){
                    if(err){
                        return callback(err);
                    }
                    addedClients[doc.value.customerName] = client.id;
                    finish(doc, client.id, callback);
                });
            }
        }, function(err){
            // Got updated projects!
            if(err){
                return console.error('error creating clients!', err);
            }
            db.bulk({docs: toUpdate}, function(err, results){
                return callback(err);
            });
        });
    });
};