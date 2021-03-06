// Run via `node dataMigrations/run.js`

var config = require('../node_modules/sprout-server/services/config');
if(!config){
    process.exit(1);
}

var path = require('path');
global.__appDir = path.resolve(__dirname, '../');

config.init(function(){
    var dbAccess = require('../services/dbAccess');
    if(!dbAccess){
        process.exit(1);
    }
    dbAccess.init(config, function(){
        var db = dbAccess.db;
        var async = require('async'),
            _ = require('underscore');

        var migrations = [
            'reformatAssignments',
            'reformatLinks',
            '20150521-addClients',
            '20150522-reformatDepartmentPeopleLink',
            '20150604-reformatProjectRoles',
            '20150521-Departments', 
            '20150527-Hours', '20150527-People', 
            '20150528-ProjectAssignments', '20150528-Projects', '20150528-UserRoles', 
            '20150528-Vacations', '20150528-ProjectLinks', '20150528-ProjectPhaseRoles'

        ];

        var migrationImplementations = {
            reformatAssignments: require('./20150518-reformatAssignments'),
            reformatLinks: require('./20150519-reformatLinks'),
            '20150521-addClients': require('./20150521-addClients'),
            '20150522-reformatDepartmentPeopleLink': require('./20150522-reformatDepartmentPeopleLink'),
            '20150604-reformatProjectRoles': require('./20150604-reformatProjectRoles'),
            '20150521-Departments': require('./20150521-Departments'),
            '20150527-Hours': require('./20150527-Hours'),
    	    '20150527-People': require('./20150527-People'),
    	    '20150528-ProjectAssignments': require('./20150528-ProjectAssignments'),
    	    '20150528-Projects': require('./20150528-Projects'),
    	    '20150528-UserRoles': require('./20150528-UserRoles'),
    	    '20150528-Vacations': require('./20150528-Vacations'),
    	    '20150528-ProjectLinks': require('./20150528-ProjectLinks'),
    	    '20150528-ProjectPhaseRoles': require('./20150528-ProjectPhaseRoles')
        };

        // Check what migrations have been completed.
        var done = function(err){
            // Done!
            if(err){
                console.error('an error occurred', err);
                process.exit(1);
            }
            console.log('done');
            process.exit();
        };

        db.view('Migrations', 'AllMigrationNames', function(err, allDocs){
            if(err){
                return done(err);
            }
            var toRemove = [];
            _.each(allDocs.rows, function(row){
                console.error(row.value, 'was already completed');
                toRemove.push(row.value);
            });
            migrations = _.difference(migrations, toRemove);
            async.each(migrations, function(migration, callback){
                db.insert({
                    form: 'Migrations',
                    name: migration,
                    state: 'started'
                }, function(err, doc){
                    if(err){
                        return callback(err);
                    }
                    migrationImplementations[migration](dbAccess, function(err){
                        if(err){
                            return callback(err);
                        }
                        // Note that this migration was done successfully!
                        doc.state = 'completed';
                        doc.completed = new Date();
                        db.insert(doc, doc._id, function(err, doc){
                            callback(err);
                        });
                    });
                });
            }, done);
        });
    });
});