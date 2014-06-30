'use strict';

var dataAccess = require('../data/dataAccess');

module.exports.listProjects = function(callback) {
    dataAccess.listProjects('mm_db_demo', function(err, body){
        if (err) {
            console.log(err);
            callback('error loading projects', null);
        } else {
            console.log(body);
            callback(null, body);
        }
    });
};