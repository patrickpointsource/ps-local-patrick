var async = require('async'),
    _ = require('underscore');

module.exports = function(dbAccess, callback){

    var db = dbAccess.db;
    db.view('views', 'Projects', function(err, allProjects){
        if(err){
            return callback(err);
        }
        var toInsert = [];
        var found = async.eachSeries(allProjects.rows, function(doc, callback){
            var project = doc.value;

            db.insert({
                form: 'ProjectPhases',
                project: project._id,
                name: 'Phase 1',
                startDate: project.startDate,
                endDate: project.endDate
            }, function(err, phase){
                if(err){
                    console.error('error creating ProjectPhase', err);
                    return callback(err);
                }

                _.each(project.roles, function(role){
                    if(role._duplicated !== undefined){
                        role.duplicated = role._duplicated;
                        delete role._duplicated;
                    }
                    delete role._id;
                    role.form = 'ProjectPhaseRoles';
                    role.phase = phase.id;
                    toInsert.push(role);
                });

                delete project.roles;
                toInsert.push(project);

                // Done!
                callback();
            });
        }, function(err){
            if(!err){
                // console.log('would insert:', toInsert);
                db.bulk({docs: toInsert}, function(err, results){
                    return callback(err);
                });
            }else{
                console.error('error', err);
                callback(err);
            }
        });
    });
};