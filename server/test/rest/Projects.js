/* global it, describe */

/* Copyright © 2015 PointSource, LLC. All rights reserved. */
var path = require('path'),
    request = require('request'),
    assert = require('assert'),
    util = require('../util/launch'),
    _ = require('underscore');

describe('PROJECTS - test simple REST calls', function () {

    it('GET /v3/projects (unauthenticated)', function (done) {
        request('http://localhost:3000/v3/projects', function(err, resp, body) {
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
    
    it('GET /v3/projects (authenticated)', function(done){
        request('http://localhost:3000/v3/projects', {
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
                assert.ok(keys.length > 7 && keys.length < 18);
                assert.notEqual(keys.indexOf('id'), -1);
                assert.notEqual(keys.indexOf('customerName'), -1);
                assert.notEqual(keys.indexOf('name'), -1);
                assert.notEqual(keys.indexOf('type'), -1);
                assert.notEqual(keys.indexOf('startDate'), -1);
                assert.notEqual(keys.indexOf('state'), -1);
                assert.notEqual(keys.indexOf('executiveSponsor'), -1);
                assert.notEqual(keys.indexOf('roles'), -1);
            }
            done();
        });
    });
    
    it('POST /v3/projects (unauthenticated)', function(done){
        request.post('http://localhost:3000/v3/projects', {
            body: JSON.stringify({
                'name': 'Test Project'
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
    
    it('POST /v3/projects (missing required attributes)', function(done){
        request.post('http://localhost:3000/v3/projects', {
            body: JSON.stringify({
                name: 'Test Project'
            }),
            headers: {
                'Content-Type': 'application/json'
            },
            jar: util.adminCookieJar
        }, function(err, resp, body) {
            if(err){
                throw err;
            }
            if(resp.statusCode !== 400){
                console.log('error:', err, body);
            }
            assert.equal(resp.statusCode, 400);
            assert.ok(body.indexOf('Missing required property') !== -1);
    
            done();
        });
    });
    
    it('POST /v3/projects (invalid enum)', function(done){
        request.post('http://localhost:3000/v3/projects', {
            body: JSON.stringify({
                name: 'Test Project',
                customerName: 'Test Customer Name',
                type: 'invalid-type', // This is an invalid type
                startDate: '2015-01-01',
                state: 'planning',
                executiveSponsor: '52ab7005e4b0fd2a8d130001',
                roles: []
            }),
            headers: {
                'Content-Type': 'application/json'
            },
            jar: util.adminCookieJar
        }, function(err, resp, body) {
            if(err){
                throw err;
            }
            if(resp.statusCode !== 400){
                console.log('error:', err, body);
            }
            assert.equal(resp.statusCode, 400);
            assert.ok(body.indexOf('No enum match for: \\"invalid-type\\"') !== -1);
    
            done();
        });
    });
    
    it('POST /v3/projects (invalid executiveSponsor)', function(done){
        request.post('http://localhost:3000/v3/projects', {
            body: JSON.stringify({
                name: 'Test Project',
                customerName: 'Test Customer Name',
                type: 'poc',
                startDate: '2015-01-01',
                state: 'planning',
                executiveSponsor: 'A1', // This is an invalid executiveSponsor
                roles: []
            }),
            headers: {
                'Content-Type': 'application/json'
            },
            jar: util.adminCookieJar
        }, function(err, resp, body) {
            if(err){
                throw err;
            }
            if(resp.statusCode !== 400){
                console.log('error:', err, body);
            }
            assert.equal(resp.statusCode, 400);
            assert.ok(body.indexOf('The indicated executiveSponsor doesn\'t exist') !== -1);
            done();
        });
    });
    
    it('POST /v3/projects (User authenticated)', function(done){
        request.post('http://localhost:3000/v3/projects', {
            body: JSON.stringify({
                name: 'Test Project',
                customerName: 'Test Customer Name',
                type: 'poc',
                startDate: '2015-01-01',
                state: 'planning',
                executiveSponsor: '52ab7005e4b0fd2a8d130001',
                roles: []
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
    
    var projectID;
    it('POST /v3/projects (Admin authenticated)', function(done){
        request.post('http://localhost:3000/v3/projects', {
            body: JSON.stringify({
                name: 'Test Project',
                customerName: 'Test Customer Name',
                type: 'poc',
                startDate: '2015-01-01',
                state: 'planning',
                executiveSponsor: '52ab7005e4b0fd2a8d130001',
                roles: []
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
            assert.ok(keys.length > 7 && keys.length < 18);
            assert.notEqual(keys.indexOf('id'), -1);
            assert.notEqual(keys.indexOf('name'), -1);
            assert.equal(json.name, 'Test Project');
            assert.equal(json.customerName, 'Test Customer Name');
            
            // Save the taskID to do an update and delete later
            projectID = json.id;
    
            done();
        });
    });
    
    it('GET /v3/projects/:id (unauthenticated)', function(done){
        // Dummy Project ID but should still get Unauthorized
        request.get('http://localhost:3000/v3/projects/A1', {
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
    
    it('GET /v3/projects/:id (invalid project id)', function(done){
        // Fail if we don't have a projectID
        assert.ok(projectID);
    
        request.get('http://localhost:3000/v3/projects/' + projectID.substr(0, 5), {
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
    
    it('GET /v3/projects/:id (authenticated)', function(done){
        // Fail if we don't have a projectID
        assert.ok(projectID);
    
        request.get('http://localhost:3000/v3/projects/' + projectID, {
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
            assert.ok(keys.length > 7 && keys.length < 18);
            assert.notEqual(keys.indexOf('id'), -1);
            assert.notEqual(keys.indexOf('name'), -1);
            assert.equal(json.id, projectID);
            assert.equal(json.name, 'Test Project');
            assert.equal(json.customerName, 'Test Customer Name');
            done();
        });
    });
    
    it('PUT /v3/projects/:id (unauthenticated)', function(done){
        // Dummy Project ID but should still get Unauthorized
        request.put('http://localhost:3000/v3/projects/A1', {
            body: JSON.stringify({
                name: 'Test Project v2',
                customerName: 'Test Customer Name',
                type: 'poc',
                startDate: '2015-01-01',
                state: 'planning',
                executiveSponsor: '52ab7005e4b0fd2a8d130001',
                roles: []
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
    
    it('PUT /v3/projects/:id (invalid project id)', function(done){
        // Fail if we don't have a projectID
        assert.ok(projectID);
        
        request.put('http://localhost:3000/v3/projects/' + projectID.substr(0, 5), {
            body: JSON.stringify({
                name: 'Test Project v2',
                customerName: 'Test Customer Name',
                type: 'poc',
                startDate: '2015-01-01',
                state: 'planning',
                executiveSponsor: '52ab7005e4b0fd2a8d130001',
                roles: []
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
    
    // Should fail because a normal user doesn't have permission to update a project
    it('PUT /v3/projects/:id (User authenticated)', function(done){
        // Fail if we don't have a projectID
        assert.ok(projectID);
    
        request.put('http://localhost:3000/v3/projects/'+projectID, {
            body: JSON.stringify({
                name: 'Test Project v2',
                customerName: 'Test Customer Name',
                type: 'poc',
                startDate: '2015-01-01',
                state: 'planning',
                executiveSponsor: '52ab7005e4b0fd2a8d130001',
                roles: []
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
    
    it('PUT /v3/projects/:id (Admin authenticated)', function(done){
        // Fail if we don't have a projectID
        assert.ok(projectID);
    
        request.put('http://localhost:3000/v3/projects/'+projectID, {
            body: JSON.stringify({
                name: 'Test Project v2',
                customerName: 'Test Customer Name',
                type: 'poc',
                startDate: '2015-01-01',
                state: 'planning',
                executiveSponsor: '52ab7005e4b0fd2a8d130001',
                roles: []
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
            assert.ok(keys.length > 7 && keys.length < 18);
            assert.notEqual(keys.indexOf('id'), -1);
            assert.notEqual(keys.indexOf('name'), -1);
            assert.equal(json.id, projectID);
            assert.equal(json.name, 'Test Project v2');
            done();
        });
    });
    
    it('DELETE /v3/projects/:id (unauthenticated)', function(done){
        // Dummy Project ID but should still get Unauthorized
        request.del('http://localhost:3000/v3/projects/A1', {
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
    
    it('DELETE /v3/projects/:id (invalid project id)', function(done){
        // Fail if we don't have a projectID
        assert.ok(projectID);
    
        request.del('http://localhost:3000/v3/projects/' + projectID.substr(0, 5), {
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
    
    it('DELETE /v3/projects/:id (User authenticated)', function(done){
        // Fail if we don't have a projectID
        assert.ok(projectID);
    
        request.del('http://localhost:3000/v3/projects/'+projectID, {
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
    
    it('DELETE /v3/projects/:id (Admin authenticated)', function(done){
        // Fail if we don't have a projectID
        assert.ok(projectID);
    
        request.del('http://localhost:3000/v3/projects/'+projectID, {
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