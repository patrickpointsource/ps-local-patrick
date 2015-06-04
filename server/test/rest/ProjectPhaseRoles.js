/* global it, describe */

/* Copyright © 2015 PointSource, LLC. All rights reserved. */
var path = require('path'),
    request = require('request'),
    assert = require('assert'),
    util = require('../util/launch'),
    _ = require('underscore');

describe('PROJECT PHASE ROLES - test simple REST calls', function () {

    var projectID = '52b0a6c2e4b02565de24922d';
	
    var DEFAULT_PROJECT_PHASE_ROLE = {
        phase: '52b0a6c2e4b02565de24922d',
        daysGap: 260,
        hoursNeededToCover: 8,
        isCurrentRole: true,
        rate: {
            type: 'weekly',
            rateUnits: '$/hr',
            fullyUtilized: false,
            hoursPerWeek: 8,
            amount: 195,
            loadedAmount: 120,
            advAmount: 195
        },
        shore: 'on',
        originalAssignees: ['52ab7005e4b0fd2a8d13001f'],
        type: '52c70ae5e4b0911cacf4e11a'
    };
    
    var CHANGED_PROJECT_PHASE_ROLE = {
        phase: '52b0a6c2e4b02565de24922d',
        daysGap: 260,
        hoursNeededToCover: 8,
        isCurrentRole: true,
        rate: {
            type: 'hourly',
            rateUnits: '$/hr',
            fullyUtilized: false,
            hoursPerMth: 180,
            amount: 90,
            loadedAmount: 24,
            advAmount: 0
        },
        shore: 'on',
        originalAssignees: [ '52ab7005e4b0fd2a8d13001f' ],
        type: '52c70ae5e4b0911cacf4e118'
    };

    it('GET /v3/projects/:projectID/phases/:phaseID/roles (unauthenticated)', function (done) {
        request('http://localhost:3000/v3/projects/' + projectID + '/phases/' +
            DEFAULT_PROJECT_PHASE_ROLE.phaseID + '/roles', function(err, resp, body) {
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

    it('GET /v3/projects/:projectID/phases/:phaseID/roles (User authenticated)', function(done){
        request('http://localhost:3000/v3/projects/' + projectID + '/phases/' +
            DEFAULT_PROJECT_PHASE_ROLE.phaseID + '/roles', {
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
                assert.ok(keys.length >= 4);
                assert.notEqual(keys.indexOf('id'), -1);
                assert.notEqual(keys.indexOf('phase'), -1);
                assert.notEqual(keys.indexOf('type'), -1);
                assert.notEqual(keys.indexOf('rate'), -1);
            }
            done();
        });
    });

    it('GET /v3/projects/:projectID/phases/:phaseID/roles (Admin authenticated)', function(done){
        request('http://localhost:3000/v3/projects/' + projectID + '/phases/' +
            DEFAULT_PROJECT_PHASE_ROLE.phaseID + '/roles', {
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
                assert.ok(keys.length >= 4);
                assert.notEqual(keys.indexOf('id'), -1);
                assert.notEqual(keys.indexOf('phase'), -1);
                assert.notEqual(keys.indexOf('type'), -1);
                assert.notEqual(keys.indexOf('rate'), -1);
            }
            done();
        });
    });
    
    it('POST /v3/projects/:projectID/phases/:phaseID/roles (unauthenticated)', function(done){
        request.post('http://localhost:3000/v3/projects/' + projectID + '/phases/' +
            DEFAULT_PROJECT_PHASE_ROLE.phaseID +'/roles', {
            body: JSON.stringify(DEFAULT_PROJECT_PHASE_ROLE),
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
    
    it('POST /v3/projects/:projectID/phases/:phaseID/roles (User authenticated)', function(done){
        request.post('http://localhost:3000/v3/projects/' + projectID + '/phases/' +
            DEFAULT_PROJECT_PHASE_ROLE.phaseID + '/roles', {
            body: JSON.stringify(DEFAULT_PROJECT_PHASE_ROLE),
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
    
    var roleID;
    it('POST /v3/projects/:projectID/phases/:phaseID/roles (Admin authenticated)', function(done){
        request.post('http://localhost:3000/v3/projects/' + projectID + '/phases/' +
            DEFAULT_PROJECT_PHASE_ROLE.phaseID + '/roles', {
            body: JSON.stringify(DEFAULT_PROJECT_PHASE_ROLE),
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
            assert.ok(keys.length >= 4);
            assert.notEqual(keys.indexOf('id'), -1);
            assert.notEqual(keys.indexOf('phase'), -1);
            assert.notEqual(keys.indexOf('type'), -1);
            assert.notEqual(keys.indexOf('rate'), -1);
            assert.equal(json.phase, DEFAULT_PROJECT_PHASE_ROLE.phaseID);
            assert.equal(json.type, DEFAULT_PROJECT_PHASE_ROLE.type);
            assert.equal(json.rate.type, DEFAULT_PROJECT_PHASE_ROLE.rate.type);
            
            // Save the roleID to do an update and delete later
            roleID = json.id;
            console.log('got roleID:', roleID);
    
            done();
        });
    });
    
    it('GET /v3/projects/:projectID/phases/:phaseID/roles/:id (unauthenticated)', function(done){
        // Dummy Project Phase Role ID but should still get Unauthorized
        request.get('http://localhost:3000/v3/projects/' + projectID + '/phases/' +
            DEFAULT_PROJECT_PHASE_ROLE.phaseID + '/roles/A1', {
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
    
    it('GET /v3/projects/:projectID/phases/:phaseID/roles/:id (invalid project phase id)', function(done){
        // Fail if we don't have a roleID
        assert.ok(roleID);
    
        request.get('http://localhost:3000/v3/projects/' + projectID + '/phases/' +
            DEFAULT_PROJECT_PHASE_ROLE.phaseID + '/roles/' + roleID.substr(0, 5), {
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
    
    it('GET /v3/projects/:projectID/phases/:phaseID/roles/:id (authenticated)', function(done){
        // Fail if we don't have a roleID
        assert.ok(roleID);
    
        request.get('http://localhost:3000/v3/projects/' + projectID + '/phases/' +
            DEFAULT_PROJECT_PHASE_ROLE.phaseID + '/roles/' + roleID, {
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
            assert.ok(keys.length >= 4);
            assert.notEqual(keys.indexOf('id'), -1);
            assert.notEqual(keys.indexOf('phase'), -1);
            assert.notEqual(keys.indexOf('type'), -1);
            assert.notEqual(keys.indexOf('rate'), -1);
            assert.equal(json.phase, DEFAULT_PROJECT_PHASE_ROLE.phaseID);
            assert.equal(json.type, DEFAULT_PROJECT_PHASE_ROLE.type);
            assert.equal(json.rate.type, DEFAULT_PROJECT_PHASE_ROLE.rate.type);
            assert.equal(json.id, roleID);
            done();
        });
    });
    
    it('PUT /v3/projects/:projectID/phases/:phaseID/roles/:id (unauthenticated)', function(done){
        // Dummy Project Phase Role ID but should still get Unauthorized
        request.put('http://localhost:3000/v3/projects/' + projectID + '/phases/' +
            CHANGED_PROJECT_PHASE_ROLE.phaseID + '/roles/A1', {
            body: JSON.stringify(CHANGED_PROJECT_PHASE_ROLE),
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
    
    it('PUT /v3/projects/:projectID/phases/:phaseID/roles/:id (invalid pproject phase role id)', function(done){
        // Fail if we don't have a roleID
        assert.ok(roleID);
        
        request.put('http://localhost:3000/v3/projects/' + projectID + '/phases/' +
            CHANGED_PROJECT_PHASE_ROLE.phaseID +
                '/roles/' + roleID.substr(0, 5), {
            body: JSON.stringify(CHANGED_PROJECT_PHASE_ROLE),
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

    it('PUT /v3/projects/:projectID/phases/:phaseID/roles/:id (User authenticated)', function(done){
        // Fail if we don't have a roleID
        assert.ok(roleID);

        // Dummy Project Phase Role ID but should still get Unauthorized
        request.put('http://localhost:3000/v3/projects/' + projectID + '/phases/' +
            CHANGED_PROJECT_PHASE_ROLE.phaseID + '/roles/' + roleID, {
            body: JSON.stringify(CHANGED_PROJECT_PHASE_ROLE),
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
    
    it('PUT /v3/projects/:projectID/phases/:phaseID/roles/:id (Admin authenticated)', function(done){
        // Fail if we don't have a roleID
        assert.ok(roleID);
    
        request.put('http://localhost:3000/v3/projects/' + projectID + '/phases/' +
            CHANGED_PROJECT_PHASE_ROLE.phaseID + '/roles/' + roleID, {
            body: JSON.stringify(CHANGED_PROJECT_PHASE_ROLE),
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
            assert.ok(keys.length >= 4);
            assert.notEqual(keys.indexOf('id'), -1);
            assert.notEqual(keys.indexOf('phase'), -1);
            assert.notEqual(keys.indexOf('type'), -1);
            assert.notEqual(keys.indexOf('rate'), -1);
            assert.equal(json.phase, CHANGED_PROJECT_PHASE_ROLE.phaseID);
            assert.equal(json.type, CHANGED_PROJECT_PHASE_ROLE.type);
            assert.equal(json.rate.type, CHANGED_PROJECT_PHASE_ROLE.rate.type);
            assert.equal(json.id, roleID);
            done();
        });
    });
    
    it('DELETE /v3/projects/:projectID/phases/:phaseID/roles/:id (unauthenticated)', function(done){
        // Dummy Project Phase Role ID but should still get Unauthorized
        request.del('http://localhost:3000/v3/projects/' + projectID + '/phases/' +
            CHANGED_PROJECT_PHASE_ROLE.phaseID + '/roles/A1', {
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
    
    it('DELETE /v3/projects/:projectID/phases/:phaseID/roles/:id (invalid project phase role id)', function(done){
        // Fail if we don't have a roleID
        assert.ok(roleID);
    
        request.del('http://localhost:3000/v3/projects/' + projectID + '/phases/' +
            CHANGED_PROJECT_PHASE_ROLE.phaseID +
'/roles/' + roleID.substr(0, 5), {
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
    
    it('DELETE /v3/projects/:projectID/phases/:phaseID/roles/:id (User authenticated)', function(done){
        // Fail if we don't have a roleID
        assert.ok(roleID);
    
        request.del('http://localhost:3000/v3/projects/' + projectID + '/phases/' +
            CHANGED_PROJECT_PHASE_ROLE.phaseID + '/roles/' + roleID, {
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
    
    it('DELETE /v3/projects/:projectID/phases/:phaseID/roles/:id (Admin authenticated)', function(done){
        // Fail if we don't have a roleID
        assert.ok(roleID);
    
        request.del('http://localhost:3000/v3/projects/' + projectID + '/phases/' +
            CHANGED_PROJECT_PHASE_ROLE.phaseID + '/roles/' + roleID, {
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
