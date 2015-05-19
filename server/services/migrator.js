// The migrator handles migrations upon server startup
var async = require('async'),
    _ = require('underscore');

var migrations = [
    'reformatAssignments',
    'reformatLinks'
];

var migrationImplementations = {
    reformatAssignments: function(dbAccess, logger, callback){
        var db = dbAccess.db;
        db.view('views', 'Assignments', function(err, allDocs){
            if(err){
                return callback(err);
            }
            var toInsert = [];
            var toDelete = [];
            var found = _.find(allDocs.rows, function(doc){
                if(doc.value && doc.value.project && doc.value.project.resource){
                    var project = doc.value.project;
                    if(_.isArray(doc.value.members)){
                        _.each(doc.value.members, function(member){
                            member.form = 'ProjectAssignments';
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
                    logger.debug('this doc didn\'t have a project.resource?!', doc);
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
    },
    reformatLinks: function(dbAccess, logger, callback){
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
                    logger.debug('this doc didn\'t have a project.resource?!', doc);
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
    }
};

module.exports.init = function(dbAccess, logger, callback){
    // Check what migrations have been completed.
    var db = dbAccess.db;

    db.view('Migrations', 'AllMigrationNames', function(err, allDocs){
        if(err){
            return callback();
        }
        var toRemove = [];
        _.each(allDocs.rows, function(row){
            toRemove.push(row.value);
        });
        migrations = _.difference(migrations, toRemove);
        async.each(migrations, function(migration, callback){
            migrationImplementations[migration](dbAccess, logger, function(err){
                if(err){
                    return callback(err);
                }
                // Note that this migration was done successfully!
                db.insert({
                    form: 'Migrations',
                    name: migration,
                    completed: new Date()
                }, function(err, doc){
                    callback(err);
                });
            });
        }, callback);
    });
};