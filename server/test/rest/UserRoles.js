/* global it, describe */

/* Copyright © 2015 PointSource, LLC. All rights reserved. */
var path = require('path'),
    request = require('request'),
    assert = require('assert'),
    util = require('../util/launch'),
    _ = require('underscore');

describe('USER ROLES - test simple REST calls', function () {

    var userRoleTemplate = {};

    it('GET /v3/userRoles (unauthenticated)', function (done) {
        request('http://localhost:3000/v3/userRoles', function(err, resp, body) {
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

    it('GET /v3/userRoles (User authenticated)', function(done){
        request('http://localhost:3000/v3/userRoles', {
            jar: util.userCookieJar
        }, function(err, resp, body){
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

    it('GET /v3/userRoles (Admin authenticated)', function(done){
        request('http://localhost:3000/v3/userRoles', {
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
                assert.ok(keys.length >= 2);
                assert.notEqual(keys.indexOf('id'), -1);
                assert.notEqual(keys.indexOf('roles'), -1);
                assert.notEqual(keys.indexOf('userId'), -1);
                userRoleTemplate.roles = item.roles;
                userRoleTemplate.userId = item.userId;
            }
            done();
        });
    });

    it('POST /v3/userRoles (unauthenticated)', function(done){
        request.post('http://localhost:3000/v3/userRoles', {
            body: JSON.stringify({
                'roles': userRoleTemplate.roles,
                'userId': userRoleTemplate.userId
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

    it('POST /v3/userRoles (User authenticated)', function(done){
        request.post('http://localhost:3000/v3/userRoles', {
            body: JSON.stringify({
                'roles': userRoleTemplate.roles,
                'userId': userRoleTemplate.userId
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

    it('POST /v3/userRoles (Admin authenticated)', function(done){
        request.post('http://localhost:3000/v3/userRoles', {
            body: JSON.stringify({
                'roles': userRoleTemplate.roles,
                'userId': userRoleTemplate.userId
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
            assert.notEqual(keys.indexOf('roles'), -1);
            assert.notEqual(keys.indexOf('userId'), -1);
            assert.equal(json.roles[0], userRoleTemplate.roles[0]);
            assert.equal(json.userId, userRoleTemplate.userId);

            // Save the userRole ID to do an update and delete later
            userRoleTemplate.id = json.id;
            console.log('got userRole ID:', userRoleTemplate.id);

            done();
        });
    });

    it('GET /v3/userRoles/:id (unauthenticated)', function(done){
        // Dummy User Role ID but should still get Unauthorized
        request.get('http://localhost:3000/v3/userRoles/A1', {
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

    it('GET /v3/userRoles/:id (invalid user role id)', function(done){
        // Fail if we don't have a roleID
        assert.ok(userRoleTemplate.id);

        request.get('http://localhost:3000/v3/userRoles/' + userRoleTemplate.id.substr(0, 5), {
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

    it('GET /v3/userRoles/:id (authenticated)', function(done){
        // Fail if we don't have a userRole ID
        assert.ok(userRoleTemplate.id);

        request.get('http://localhost:3000/v3/userRoles/' + userRoleTemplate.id, {
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
            assert.notEqual(keys.indexOf('roles'), -1);
            assert.notEqual(keys.indexOf('userId'), -1);
            assert.equal(json.roles[0], userRoleTemplate.roles[0]);
            assert.equal(json.userId, userRoleTemplate.userId);
            assert.equal(json.id, userRoleTemplate.id);
            done();
        });
    });

    it('PUT /v3/userRoles/:id (unauthenticated)', function(done){
        // Dummy User Role ID but should still get Unauthorized
        request.put('http://localhost:3000/v3/userRoles/A1', {
            body: JSON.stringify({
                'roles': userRoleTemplate.roles,
                'userId': userRoleTemplate.userId
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

    it('PUT /v3/userRoles/:id (invalid user role id)', function(done){
        // Fail if we don't have a userRole ID
        assert.ok(userRoleTemplate.id);

        request.put('http://localhost:3000/v3/userRoles/' + userRoleTemplate.id.substr(0, 5), {
            body: JSON.stringify({
                'roles': userRoleTemplate.roles,
                'userId': userRoleTemplate.userId
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

    it('PUT /v3/userRoles/:id (User authenticated)', function(done){
        // Fail if we don't have a userRole ID
        assert.ok(userRoleTemplate.id);

        // Dummy User Role ID but should still get Unauthorized
        request.put('http://localhost:3000/v3/userRoles/'+userRoleTemplate.id, {
            body: JSON.stringify({
                'roles': userRoleTemplate.roles,
                'userId': userRoleTemplate.userId
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

    it('PUT /v3/userRoles/:id (Admin authenticated)', function(done){
        // Fail if we don't have a userRole ID
        assert.ok(userRoleTemplate.id);

        request.put('http://localhost:3000/v3/userRoles/'+userRoleTemplate.id, {
            body: JSON.stringify({
                'roles': userRoleTemplate.roles,
                'userId': userRoleTemplate.userId
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
            assert.notEqual(keys.indexOf('roles'), -1);
            assert.notEqual(keys.indexOf('userId'), -1);
            assert.equal(json.roles[0], userRoleTemplate.roles[0]);
            assert.equal(json.userId, userRoleTemplate.userId);
            assert.equal(json.id, userRoleTemplate.id);
            done();
        });
    });

    it('DELETE /v3/userRoles/:id (unauthenticated)', function(done){
        // Dummy User Role ID but should still get Unauthorized
        request.del('http://localhost:3000/v3/userRoles/A1', {
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

    it('DELETE /v3/userRoles/:id (invalid user role id)', function(done){
        // Fail if we don't have a userRole ID
        assert.ok(userRoleTemplate.id);

        request.del('http://localhost:3000/v3/userRoles/'+userRoleTemplate.id.substr(0, 5), {
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

    it('DELETE /v3/userRoles/:id (User authenticated)', function(done){
        // Fail if we don't have a userRole ID
        assert.ok(userRoleTemplate.id);

        request.del('http://localhost:3000/v3/userRoles/'+userRoleTemplate.id, {
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

    it('DELETE /v3/userRoles/:id (Admin authenticated)', function(done){
        // Fail if we don't have a userRole ID
        assert.ok(userRoleTemplate.id);

        request.del('http://localhost:3000/v3/userRoles/'+userRoleTemplate.id, {
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
