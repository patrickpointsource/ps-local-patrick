#!/usr/bin/env node

if(!process.env.USER_GUSER){
    console.log('USER_GUSER env variable is required!');
    process.exit(1);
}
if(!process.env.USER_GPASSWD){
    console.log('USER_GPASSWD env variable is required!');
    process.exit(1);
}
if(!process.env.ADMIN_GUSER){
    console.log('ADMIN_GUSER env variable is required!');
    process.exit(1);
}
if(!process.env.ADMIN_GPASSWD){
    console.log('ADMIN_GPASSWD env variable is required!');
    process.exit(1);
}

var http = require('http');
var fs = require('fs');
var path = require('path');
var childProcess = require('child_process');
var async = require('async');
var index = fs.readFileSync(path.resolve(__dirname, '../../client/src/alternative-login.html'));

var server = http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.end(index);
}).listen({
    port: 8080
}, function(){
    var binPath = 'casperjs';
    var userAuthCode;
    var adminAuthCode;
    var getAuthCode = function(username, password, callback){
        console.log('fetching auth code for', username, 'using provided credentials');
        var childArgs = [
            '--ignore-ssl-errors=true',
            '--web-security=no',
            path.resolve(__dirname, 'util/getGoogleOAuthCodeViaCasper.js'),
            '--username=' + username,
            '--password=' + password
        ];

        var code = '';
        var proc = childProcess.spawn(binPath, childArgs);
        proc.stdout.on('data', function (data) {
            code += data;
        });

        proc.stderr.on('data', function (data) {
            console.log('[casper] stderr: ' + data);
        });

        proc.on('close', function (retcode) {
            if(retcode > 0){
                console.log('error occurred while fetching auth code for', username, 'Exiting...');
                console.log(code);
                return callback(new Error('error occurred while fetching auth code. code:' + code));
            }
            code = code.trim();
            callback(null, code);
        });
    }
    async.parallel([
        function(callback){
            getAuthCode(process.env.USER_GUSER, process.env.USER_GPASSWD, function(err, code){
                if(code){
                    userAuthCode = code;
                }
                callback(err);
            });
        },
        function(callback){
            getAuthCode(process.env.ADMIN_GUSER, process.env.ADMIN_GPASSWD, function(err, code){
                if(code){
                    adminAuthCode = code;
                }
                callback(err);
            });
        }
    ], function(err){
        server.close();
        if(err){
            console.log('error while getting auth codes!');
            process.exit(1);
        }
        console.log('initiating mocha tests with USER_AUTH_CODE=', userAuthCode, 'and ADMIN_AUTH_CODE=', adminAuthCode);
        
        var env = process.env;
        env['USER_AUTH_CODE'] = userAuthCode;
        env['ADMIN_AUTH_CODE'] = adminAuthCode;
        var mocha = childProcess.spawn('mocha', [
            '--bail',
            '--timeout=10000', 
            path.resolve(__dirname, 'rest/run.js') // /server/test/rest/*
        ], {
            env: env,
            stdio: 'inherit'
        });

        mocha.on('close', function (code) {
            process.exit();
        });
    });
});