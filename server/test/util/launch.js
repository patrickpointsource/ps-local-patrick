/* Copyright © 2015 PointSource, LLC. All rights reserved. */
var path = require('path'),
    child_process = require('child_process'),
    Q = require('q');
    
var LAUNCH_TIMEOUT = 5000;
var KILL_TIMEOUT = 100;

var lastLaunch = null;

exports.launch = function(opts) {

    var deferred = Q.defer();
    //opts is optional
    if (!opts) {
        opts = {
            exec: 'node',
            args: ['./index.js'],
            cwd: path.resolve(__dirname, '../../')
        };
    }
    lastLaunch = child_process.spawn(
        opts.exec, 
        opts.args,
        {
            cwd: opts.cwd,
            env: process.env,
            stdio: 'inherit' // 'inherit' | 'ignore'
        });

    setTimeout(function() {
        deferred.resolve();
    }, LAUNCH_TIMEOUT);

    return deferred.promise;
};

exports.finish = function() {
    var deferred = Q.defer();

    if(!lastLaunch){
        deferred.resolve();
    }else{
        lastLaunch.kill('SIGINT');
        setTimeout(function() {
            deferred.resolve();
        }, KILL_TIMEOUT);
    }

    return deferred.promise;
};