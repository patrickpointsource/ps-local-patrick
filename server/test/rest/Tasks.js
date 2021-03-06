/* global it, describe */

/* Copyright © 2015 PointSource, LLC. All rights reserved. */
var path = require('path'),
    request = require('request'),
    assert = require('assert'),
    util = require('../util/launch'),
    _ = require('underscore');

describe('TASKS - test simple REST calls', function () {

    it('GET /v3/tasks (unauthenticated)', function (done) {
        request('http://localhost:3000/v3/tasks', function(err, resp, body) {
            if(err){
                throw err;
            }
            if(resp.statusCode !== 401){
                console.log('error:', err, body);
            }
            assert.equal(resp.statusCode, 401);
            done();
        });
    });

    it('GET /v3/tasks (User authenticated)', function(done){
        request('http://localhost:3000/v3/tasks', {
            jar: util.userCookieJar
        }, function(err, resp, body){
            if(err){
                throw err;
            }
            if(resp.statusCode !== 200){
                console.log('error:', err, body);
            }
            assert.ok(!err);
            assert.equal(resp.statusCode, 200);
            var json = JSON.parse(body);
            assert.equal(_.isArray(json), true);
            if(json.length > 0){
                // Pick the first one and make sure it meets the standard format
                var item = json[0];
                var keys = _.keys(item);
                assert.ok(keys.length === 2 || keys.length === 3);
                assert.notEqual(keys.indexOf('id'), -1);
                assert.notEqual(keys.indexOf('name'), -1);
            }
            done();
        });
    });

    it('GET /v3/tasks (Admin authenticated)', function(done){
        request('http://localhost:3000/v3/tasks', {
            jar: util.adminCookieJar
        }, function(err, resp, body){
            if(err){
                throw err;
            }
            if(resp.statusCode !== 200){
                console.log('error:', err, body);
            }
            assert.ok(!err);
            assert.equal(resp.statusCode, 200);
            var json = JSON.parse(body);
            assert.equal(_.isArray(json), true);
            if(json.length > 0){
                // Pick the first one and make sure it meets the standard format
                var item = json[0];
                var keys = _.keys(item);
                assert.ok(keys.length === 2 || keys.length === 3);
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
            if(err){
                throw err;
            }
            if(resp.statusCode !== 401){
                console.log('error:', err, body);
            }
            assert.equal(resp.statusCode, 401);
            done();
        });
    });
    
    it('POST /v3/tasks (User authenticated)', function(done){
        request.post('http://localhost:3000/v3/tasks', {
            body: JSON.stringify({
                'name': 'Test Task'
            }),
            headers: {
                'Content-Type': 'application/json'
            },
            jar: util.userCookieJar
        }, function(err, resp, body) {
            if(err){
                throw err;
            }
            if(resp.statusCode !== 403){
                console.log('error:', err, body);
            }
            assert.equal(resp.statusCode, 403);
            done();
        });
    });
    
    var taskID;
    it('POST /v3/tasks (Admin authenticated)', function(done){
        request.post('http://localhost:3000/v3/tasks', {
            body: JSON.stringify({
                name: 'Test Task'
            }),
            headers: {
                'Content-Type': 'application/json'
            },
            jar: util.adminCookieJar
        }, function(err, resp, body) {
            if(err){
                throw err;
            }
            if(resp.statusCode !== 200){
                console.log('error:', err, body);
            }
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
            console.log('got taskID:', taskID);
    
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
            if(err){
                throw err;
            }
            if(resp.statusCode !== 401){
                console.log('error:', err, body);
            }
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
            jar: util.adminCookieJar
        }, function(err, resp, body) {
            if(err){
                throw err;
            }
            if(resp.statusCode !== 404){
                console.log('error:', err, body);
            }
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
            jar: util.adminCookieJar
        }, function(err, resp, body) {
            if(err){
                throw err;
            }
            if(resp.statusCode !== 200){
                console.log('error:', err, body);
            }
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
            if(err){
                throw err;
            }
            if(resp.statusCode !== 401){
                console.log('error:', err, body);
            }
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
            jar: util.adminCookieJar
        }, function(err, resp, body) {
            if(err){
                throw err;
            }
            if(resp.statusCode !== 404){
                console.log('error:', err, body);
            }
            assert.equal(resp.statusCode, 404);
            done();
        });
    });

    it('PUT /v3/tasks/:id (User authenticated)', function(done){
        // Fail if we don't have a taskID
        assert.ok(taskID);

        // Dummy Task ID but should still get Unauthorized
        request.put('http://localhost:3000/v3/tasks/'+taskID, {
            body: JSON.stringify({
                'name': 'Test Task v2'
            }),
            headers: {
                'Content-Type': 'application/json'
            },
            jar: util.userCookieJar
        }, function(err, resp, body) {
            if(err){
                throw err;
            }
            if(resp.statusCode !== 403){
                console.log('error:', err, body);
            }
            assert.equal(resp.statusCode, 403);
            done();
        });
    });
    
    it('PUT /v3/tasks/:id (Admin authenticated)', function(done){
        // Fail if we don't have a taskID
        assert.ok(taskID);
    
        request.put('http://localhost:3000/v3/tasks/'+taskID, {
            body: JSON.stringify({
                name: 'Test Task v2'
            }),
            headers: {
                'Content-Type': 'application/json'
            },
            jar: util.adminCookieJar
        }, function(err, resp, body) {
            if(err){
                throw err;
            }
            if(resp.statusCode !== 200){
                console.log('error:', err, body);
            }
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
            if(err){
                throw err;
            }
            if(resp.statusCode !== 401){
                console.log('error:', err, body);
            }
            assert.equal(resp.statusCode, 401);
            done();
        });
    });
    
    it('DELETE /v3/tasks/:id (invalid task id)', function(done){
        // Fail if we don't have a taskID
        assert.ok(taskID);
    
        request.del('http://localhost:3000/v3/tasks/' + taskID.substr(0, 5), {
            headers: {
                'Content-Type': 'application/json'
            },
            jar: util.adminCookieJar
        }, function(err, resp, body) {
            if(err){
                throw err;
            }
            if(resp.statusCode !== 404){
                console.log('error:', err, body);
            }
            assert.equal(resp.statusCode, 404);
            done();
        });
    });
    
    it('DELETE /v3/tasks/:id (User authenticated)', function(done){
        // Fail if we don't have a taskID
        assert.ok(taskID);
    
        request.del('http://localhost:3000/v3/tasks/'+taskID, {
            headers: {
                'Content-Type': 'application/json'
            },
            jar: util.userCookieJar
        }, function(err, resp, body) {
            if(err){
                throw err;
            }
            if(resp.statusCode !== 403){
                console.log('error:', err, body);
            }
            assert.equal(resp.statusCode, 403);
            done();
        });
    });
    
    it('DELETE /v3/tasks/:id (Admin authenticated)', function(done){
        // Fail if we don't have a taskID
        assert.ok(taskID);
    
        request.del('http://localhost:3000/v3/tasks/'+taskID, {
            headers: {
                'Content-Type': 'application/json'
            },
            jar: util.adminCookieJar
        }, function(err, resp, body) {
            if(err){
                throw err;
            }
            if(resp.statusCode !== 200){
                console.log('error:', err, body);
            }
            assert.ok(!err);
            assert.equal(resp.statusCode, 200);
            done();
        });
    });
});
