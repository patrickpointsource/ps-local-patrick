/* Copyright © 2015 PointSource, LLC. All rights reserved. */
var path = require('path'),
    request = require('request'),
    assert = require('assert'),
    util = require('../util/launch'),
    _ = require('underscore');

describe('TASKS - test simple REST calls', function () {

    before(function (done) {
        if(!process.env.AUTH_CODE){
            return done(new Error('AUTH_CODE env variable is required'));
        }
        util.launch().then(function(){
            // Do auth with the AUTH_CODE
            request('http://localhost:3000/auth?code='+process.env.AUTH_CODE, {
                jar: true
            }, function(err, resp, body){
                console.log('posted code?', process.env.AUTH_CODE, err, body);
                done();
            });
        });
    });

    after(function (done) {
        util.finish().then(done);
    });

    it('GET /v3/tasks (unauthenticated)', function (done) {
        request('http://localhost:3000/v3/tasks', function(err, resp, body) {
            assert.equal(resp.statusCode, 401);
            done();
        });
    });

    it('GET /v3/tasks (authenticated)', function(done){
        request('http://localhost:3000/v3/tasks', {
            jar: true
        }, function(err, resp, body){
            assert.ok(!err);
            assert.equal(resp.statusCode, 200);
            var json = JSON.parse(body);
            assert.equal(_.isArray(json), true);
            if(json.length > 0){
                // Pick the first one and make sure it meets the standard format
                var item = json[0];
                var keys = _.keys(item);
                assert.ok(keys.length == 2 || keys.length == 3);
                assert.notEqual(keys.indexOf('id'), -1);
                assert.notEqual(keys.indexOf('name'), -1);
            }
            done();
        });
    });
    
    it('POST /v3/tasks (unauthenticated)', function(done){
        request.post('http://localhost:3000/v3/tasks', {
            body: JSON.stringify({
                'name': 'Test Task'
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        }, function(err, resp, body) {
            assert.equal(resp.statusCode, 401);
            done();
        });
    });
    
    var taskID;
    it('POST /v3/tasks (authenticated)', function(done){
        request.post('http://localhost:3000/v3/tasks', {
            body: JSON.stringify({
                name: 'Test Task'
            }),
            headers: {
                'Content-Type': 'application/json'
            },
            jar: true
        }, function(err, resp, body) {
            assert.ok(!err);
            assert.equal(resp.statusCode, 200);
            var json = JSON.parse(body);
            assert.ok(_.isObject(json));
            var keys = _.keys(json);
            assert.ok(keys.length >= 2);
            assert.notEqual(keys.indexOf('id'), -1);
            assert.notEqual(keys.indexOf('name'), -1);
            assert.equal(json.name, 'Test Task');
            
            // Save the taskID to do an update and delete later
            taskID = json.id;
    
            done();
        });
    });
    
    it('GET /v3/tasks/:id (unauthenticated)', function(done){
        // Dummy Task ID but should still get Unauthorized
        request.get('http://localhost:3000/v3/tasks/A1', {
            headers: {
                'Content-Type': 'application/json'
            }
        }, function(err, resp, body) {
            assert.equal(resp.statusCode, 401);
            done();
        });
    });
    
    it('GET /v3/tasks/:id (invalid task id)', function(done){
        // Fail if we don't have a taskID
        assert.ok(taskID);
    
        request.get('http://localhost:3000/v3/tasks/' + taskID.substr(0, 5), {
            headers: {
                'Content-Type': 'application/json'
            },
            jar: true
        }, function(err, resp, body) {
            assert.equal(resp.statusCode, 404);
            done();
        });
    });
    
    it('GET /v3/tasks/:id (authenticated)', function(done){
        // Fail if we don't have a taskID
        assert.ok(taskID);
    
        request.get('http://localhost:3000/v3/tasks/' + taskID, {
            headers: {
                'Content-Type': 'application/json'
            },
            jar: true
        }, function(err, resp, body) {
            assert.ok(!err);
            assert.equal(resp.statusCode, 200);
            var json = JSON.parse(body);
            assert.ok(_.isObject(json));
            var keys = _.keys(json);
            assert.ok(keys.length >= 2);
            assert.notEqual(keys.indexOf('id'), -1);
            assert.notEqual(keys.indexOf('name'), -1);
            assert.equal(json.id, taskID);
            assert.equal(json.name, 'Test Task');
            done();
        });
    });
    
    it('PUT /v3/tasks/:id (unauthenticated)', function(done){
        // Dummy Task ID but should still get Unauthorized
        request.put('http://localhost:3000/v3/tasks/A1', {
            body: JSON.stringify({
                'name': 'Test Task v2'
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        }, function(err, resp, body) {
            assert.equal(resp.statusCode, 401);
            done();
        });
    });
    
    it('PUT /v3/tasks/:id (invalid task id)', function(done){
        // Fail if we don't have a taskID
        assert.ok(taskID);
        
        request.put('http://localhost:3000/v3/tasks/' + taskID.substr(0, 5), {
            body: JSON.stringify({
                'name': 'Test Task v2'
            }),
            headers: {
                'Content-Type': 'application/json'
            },
            jar: true
        }, function(err, resp, body) {
            assert.equal(resp.statusCode, 404);
            done();
        });
    });
    
    it('PUT /v3/tasks/:id (authenticated)', function(done){
        // Fail if we don't have a taskID
        assert.ok(taskID);
    
        request.put('http://localhost:3000/v3/tasks/'+taskID, {
            body: JSON.stringify({
                name: 'Test Task v2'
            }),
            headers: {
                'Content-Type': 'application/json'
            },
            jar: true
        }, function(err, resp, body) {
            assert.ok(!err);
            assert.equal(resp.statusCode, 200);
            var json = JSON.parse(body);
            assert.ok(_.isObject(json));
            var keys = _.keys(json);
            assert.ok(keys.length >= 2);
            assert.notEqual(keys.indexOf('id'), -1);
            assert.notEqual(keys.indexOf('name'), -1);
            assert.equal(json.id, taskID);
            assert.equal(json.name, 'Test Task v2');
            done();
        });
    });
    
    it('DELETE /v3/tasks/:id (unauthenticated)', function(done){
        // Dummy Task ID but should still get Unauthorized
        request.del('http://localhost:3000/v3/tasks/A1', {
            headers: {
                'Content-Type': 'application/json'
            }
        }, function(err, resp, body) {
            assert.equal(resp.statusCode, 401);
            done();
        });
    });
    
    it('DELETE /v3/tasks/:id (invalid task id)', function(done){
        // Fail if we don't have a taskID
        assert.ok(taskID);
    
        request.del('http://localhost:3000/v3/tasks/' + taskID.substr(0, 5), {
            headers: {
                'Content-Type': 'application/json'
            },
            jar: true
        }, function(err, resp, body) {
            assert.equal(resp.statusCode, 404);
            done();
        });
    });
    
    it('DELETE /v3/tasks/:id (authenticated)', function(done){
        // Fail if we don't have a taskID
        assert.ok(taskID);
    
        request.del('http://localhost:3000/v3/tasks/'+taskID, {
            headers: {
                'Content-Type': 'application/json'
            },
            jar: true
        }, function(err, resp, body) {
            assert.ok(!err);
            assert.equal(resp.statusCode, 200);
            done();
        });
    });
});