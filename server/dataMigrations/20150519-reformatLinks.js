var _ = require('underscore');

module.exports = function(dbAccess, callback){
    var db = dbAccess.db;
    db.view('views', 'Links', function(err, allDocs){
        if(err){
            return callback(err);
        }
        var toInsert = [];
        var toDelete = [];
        var found = _.find(allDocs.rows, function(doc){
            if(doc.value && doc.value.project && doc.value.project.resource){
                var project = doc.value.project;
                if(_.isArray(doc.value.members)){
                    _.each(doc.value.members, function(member, idx){
                        member.form = 'ProjectLinks';
                        member.index = idx;
                        member.project = project;
                        toInsert.push(member);
                    });
                    toDelete.push({
                        _id: doc.value._id,
                        _rev: doc.value._rev,
                        _deleted: true
                    });
                }
            }else{
                console.error('this doc didn\'t have a project.resource?!', doc);
                callback('This doc didn\'t have a project resource.');
                return true;
            }
        });
        if(!found){
            db.bulk({docs: _.union(toInsert, toDelete)}, function(err, results){
                return callback(err);
            });
        }
    });
};