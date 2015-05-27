var _ = require('underscore'),
    async = require('async');

module.exports = function(dbAccess, callback){
    var db = dbAccess.db;
    db.view('Departments', 'AllDepartments', function(err, allDocs){
        if(err){
            return callback(err);
        }
        var toInsert = [];
        var toDelete = [];
        _.each(allDocs.rows, function(doc){
            var key = 'departmentPeople';
            if(!doc.value[key]){
                key = 'people';
            }
            if(!doc.value[key]){
                return;
            }
            async.each(doc.value[key], function(person, callback){
                if(person.indexOf('people/') !== -1){
                    person = person.replace('people/', '');
                }
                db.get(person, function(err, personDoc){
                    if(err){
                        return callback(err);
                    }
                    personDoc.department = doc.id;
                    db.insert(personDoc, personDoc._id, function(err, doc){
                        callback(err);
                    });
                });
            }, function(err){
                callback(err);
            });
        })
    });
};