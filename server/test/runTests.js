#!/usr/bin/env node

if(!process.env.GUSER){
    console.log('GUSER env variable is required!');
    process.exit(1);
}
if(!process.env.GPASSWD){
    console.log('GPASSWD env variable is required!');
    process.exit(1);
}

var http = require('http');
var fs = require('fs');
var path = require('path');
var childProcess = require('child_process');
var index = fs.readFileSync(path.resolve(__dirname, '../../client/src/alternative-login.html'));

var server = http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.end(index);
}).listen({
    port: 8080
}, function(){
    var binPath = 'casperjs';

    console.log('fetching auth code using provided credentials');
    var childArgs = [
        '--ignore-ssl-errors=true',
        '--web-security=no',
        path.resolve(__dirname, 'util/getGoogleOAuthCodeViaCasper.js'),
        '--username=' + process.env.GUSER,
        '--password=' + process.env.GPASSWD
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
        server.close();
        if(retcode > 0){
            console.log('error occurred while fetching auth code. Exiting...');
            console.log(code);
            process.exit();
        }
        code = code.trim();
        console.log('initiating mocha tests with AUTH_CODE=', code);
        
        var env = process.env;
        env['AUTH_CODE'] = code;
        var mocha = childProcess.spawn('mocha', [
            '--timeout=10000', 
            path.resolve(__dirname, 'rest') // /server/test/rest/*
        ], {
            env: env,
            stdio: 'inherit'
        });

        mocha.on('close', function (code) {
            process.exit();
        });
    });
});