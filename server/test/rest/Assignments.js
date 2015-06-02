/* global it, describe */

/* Copyright © 2015 PointSource, LLC. All rights reserved. */
var path = require('path'),
    request = require('request'),
    assert = require('assert'),
    moment = require('moment'),
    util = require('../util/launch'),
    _ = require('underscore');

describe('ASSIGNMENTS - test simple REST calls', function () {

    var DEFAULT_ROLE = {
        role: 'a1cd901e3a45792a4db010fa44c19e9bcd7e',
        person: '5b40eabf7f08c51488fbfdf7d7d787fd',
        project: 'cce171d4ed9e0b5ec3c2f78715057678',
        startDate: '2015-01-01'
    };
	
    var CHANGED_ROLE = {
        role: '94e45b6d2581ac62ed2dc82e53200b9d6de2',
        person: '52ab7005e4b0fd2a8d130006',
        project: 'cfab522f1bcfb627bdf4202ebf2667d6',
        startDate: '2015-02-01'
    };
	
    it('GET /v3/assignments (unauthenticated)', function (done) {
        request('http://localhost:3000/v3/assignments', function(err, resp, body) {
            assert.equal(resp.statusCode, 401);
            done();
        });
    });
	
    it('GET /v3/assignments (User authenticated)', function(done){
        request('http://localhost:3000/v3/assignments', {
            jar: util.userCookieJar
        }, function(err, resp, body){
            assert.ok(!err);
            assert.equal(resp.statusCode, 200);
            var json = JSON.parse(body);
            assert.equal(_.isArray(json), true);
            if(json.length > 0){
                // Pick the first one and make sure it meets the standard format
                var item = json[0];
                var keys = _.keys(item);
                assert.ok(keys.length >= 5);
                assert.notEqual(keys.indexOf('id'), -1);
                assert.notEqual(keys.indexOf('role'), -1);
                assert.notEqual(keys.indexOf('person'), -1);
                assert.notEqual(keys.indexOf('project'), -1);
                assert.notEqual(keys.indexOf('startDate'), -1);
            }
            done();
        });
    });

    it('GET /v3/assignments (Admin authenticated)', function(done){
        request('http://localhost:3000/v3/assignments', {
            jar: util.adminCookieJar
        }, function(err, resp, body){
            assert.ok(!err);
            assert.equal(resp.statusCode, 200);
            var json = JSON.parse(body);
            assert.equal(_.isArray(json), true);
            if(json.length > 0){
                // Pick the first one and make sure it meets the standard format
                var item = json[0];
                var keys = _.keys(item);
                assert.ok(keys.length >= 5);
                assert.notEqual(keys.indexOf('id'), -1);
                assert.notEqual(keys.indexOf('role'), -1);
                assert.notEqual(keys.indexOf('person'), -1);
                assert.notEqual(keys.indexOf('project'), -1);
                assert.notEqual(keys.indexOf('startDate'), -1);
            }
            done();
        });
    });
    
    it('POST /v3/assignments (unauthenticated)', function(done){
        request.post('http://localhost:3000/v3/assignments', {
            body: JSON.stringify(DEFAULT_ROLE),
            headers: {
                'Content-Type': 'application/json'
            }
        }, function(err, resp, body) {
            assert.equal(resp.statusCode, 401);
            done();
        });
    });
	
    it('POST /v3/assignments (User authenticated)', function(done){
        request.post('http://localhost:3000/v3/assignments', {
            body: JSON.stringify(DEFAULT_ROLE),
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
	
    var assignmentID;
    it('POST /v3/assignments (Admin authenticated)', function(done){
        request.post('http://localhost:3000/v3/assignments', {
            body: JSON.stringify(DEFAULT_ROLE),
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
            assert.ok(keys.length >= 5);
            assert.notEqual(keys.indexOf('id'), -1);
            assert.notEqual(keys.indexOf('role'), -1);
            assert.notEqual(keys.indexOf('person'), -1);
            assert.notEqual(keys.indexOf('project'), -1);
            assert.notEqual(keys.indexOf('startDate'), -1);
            assert.equal(json.role, DEFAULT_ROLE.role);
            assert.equal(json.person, DEFAULT_ROLE.person);
            assert.equal(json.project, DEFAULT_ROLE.project);
            assert.equal(new Date(json.startDate).getTime() , new Date(DEFAULT_ROLE.startDate).getTime() );
             
            // Save the assignmentID to do an update and delete later
            assignmentID = json.id;
            console.log('got assignmentID:', assignmentID);
    
            done();
        });
    });
	
    it('GET /v3/assignments/:id (unauthenticated)', function(done){
        // Dummy Skill ID but should still get Unauthorized
        request.get('http://localhost:3000/v3/assignments/A1', {
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
    
    it('GET /v3/assignments/:id (invalid task id)', function(done){
        // Fail if we don't have a assignmentID
        assert.ok(assignmentID);
    
        request.get('http://localhost:3000/v3/assignments/' + assignmentID.substr(0, 5), {
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
   
    it('GET /v3/assignments/:id (authenticated)', function(done){
        // Fail if we don't have a assignmentID
        assert.ok(assignmentID);
    
        request.get('http://localhost:3000/v3/assignments/' + assignmentID, {
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
            assert.ok(keys.length >= 5);
            assert.notEqual(keys.indexOf('id'), -1);
            assert.notEqual(keys.indexOf('role'), -1);
            assert.notEqual(keys.indexOf('person'), -1);
            assert.notEqual(keys.indexOf('project'), -1);
            assert.notEqual(keys.indexOf('startDate'), -1);
            assert.equal(json.role, DEFAULT_ROLE.role);
            assert.equal(json.person, DEFAULT_ROLE.person);
            assert.equal(json.project, DEFAULT_ROLE.project);
            assert.equal(new Date(json.startDate).getTime() , new Date(DEFAULT_ROLE.startDate).getTime() );
            done();
        });
    });
    
    it('PUT /v3/assignments/:id (unauthenticated)', function(done){
        // Dummy Assignment ID but should still get Unauthorized
        request.put('http://localhost:3000/v3/assignments/A1', {
            body: JSON.stringify(CHANGED_ROLE),
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
    
    it('PUT /v3/assignments/:id (invalid task id)', function(done){
        // Fail if we don't have a assignmentID
        assert.ok(assignmentID);
        
        request.put('http://localhost:3000/v3/assignments/' + assignmentID.substr(0, 5), {
            body: JSON.stringify(CHANGED_ROLE),
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
    
    it('PUT /v3/assignments/:id (User authenticated)', function(done){
        // Fail if we don't have a assignmentID
        assert.ok(assignmentID);

        request.put('http://localhost:3000/v3/assignments/'+assignmentID, {
            body: JSON.stringify(CHANGED_ROLE),
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
    
    it('PUT /v3/assignments/:id (Admin authenticated)', function(done){
        // Fail if we don't have a assignmentID
        assert.ok(assignmentID);
    
        request.put('http://localhost:3000/v3/assignments/'+assignmentID, {
            body: JSON.stringify(CHANGED_ROLE),
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
            assert.ok(keys.length >= 5);
            assert.notEqual(keys.indexOf('id'), -1);
            assert.notEqual(keys.indexOf('role'), -1);
            assert.notEqual(keys.indexOf('person'), -1);
            assert.notEqual(keys.indexOf('project'), -1);
            assert.notEqual(keys.indexOf('startDate'), -1);
            assert.equal(json.id, assignmentID);
            assert.equal(json.role, CHANGED_ROLE.role);
            assert.equal(json.person, CHANGED_ROLE.person);
            assert.equal(json.project, CHANGED_ROLE.project);
            assert.equal(new Date(json.startDate).getTime() , new Date(CHANGED_ROLE.startDate).getTime() );
            done();
        });
    });
    
    it('DELETE /v3/assignments/:id (unauthenticated)', function(done){
        // Dummy Assignment ID but should still get Unauthorized
        request.del('http://localhost:3000/v3/assignments/A1', {
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
    
    it('DELETE /v3/assignments/:id (invalid skill id)', function(done){
        // Fail if we don't have a assignmentID
        assert.ok(assignmentID);
    
        request.del('http://localhost:3000/v3/assignments/'+assignmentID.substr(0, 5), {
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
    
    it('DELETE /v3/assignments/:id (User authenticated)', function(done){
        // Fail if we don't have a assignmentID
        assert.ok(assignmentID);
    
        request.del('http://localhost:3000/v3/assignments/'+assignmentID, {
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
    
    it('DELETE /v3/assignments/:id (Admin authenticated)', function(done){
        // Fail if we don't have a assignmentID
        assert.ok(assignmentID);
    
        request.del('http://localhost:3000/v3/assignments/'+assignmentID, {
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
