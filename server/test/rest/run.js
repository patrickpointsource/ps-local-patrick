/* global it, describe, before, after */

var request = require('request'),
    util = require('../util/launch.js'),
    async = require('async'),
    _ = require('underscore');

describe('REST TEST SETUP/TEARDOWN - ', function () {
    before(function (done) {
        if(!process.env.USER_AUTH_CODE){
            return done(new Error('USER_AUTH_CODE env variable is required'));
        }
        if(!process.env.ADMIN_AUTH_CODE){
            return done(new Error('ADMIN_AUTH_CODE env variable is required'));
        }
        util.launch().then(function(){
            // Do auth with the AUTH_CODE
            async.parallel([
                function(callback){
                    request('http://localhost:3000/auth?code='+process.env.USER_AUTH_CODE, {
                        jar: util.userCookieJar
                    }, function(err, resp, body){
                        console.log('posted user code?', process.env.USER_AUTH_CODE, err, body);
                        callback();
                    });
                },
                function(callback){
                    request('http://localhost:3000/auth?code='+process.env.ADMIN_AUTH_CODE, {
                        jar: util.adminCookieJar
                    }, function(err, resp, body){
                        console.log('posted admin code?', process.env.ADMIN_AUTH_CODE, err, body);
                        callback();
                    });
                }
            ], done);
        });
    });

    var tests = [
         'Hours',
         'Tasks',
         'Projects',
         'Clients',
         'Assignments',
         'ProjectPhaseRoles',
         'ProjectPhases',
         'Roles',
         'Skills',
         'UserRoles',
         'UtilizationReport'
    ];
    _.each(tests, function(test){
        require('./'+test);
    });

    after(function (done) {
        util.finish().then(done);
    });
});
