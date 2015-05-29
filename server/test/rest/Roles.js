/* global it, describe */

/* Copyright © 2015 PointSource, LLC. All rights reserved. */
var path = require('path'),
    request = require('request'),
    assert = require('assert'),
    util = require('../util/launch'),
    _ = require('underscore');

describe('ROLES - test simple REST calls', function () {

    var roleTemplate = {
        title: 'Test Role Title',
        abbreviation: 'TRT'
    };

    it('GET /v3/roles (unauthenticated)', function (done) {
        request('http://localhost:3000/v3/roles', function(err, resp, body) {
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

    it('GET /v3/roles (User authenticated)', function(done){
        request('http://localhost:3000/v3/roles', {
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
                assert.ok(keys.length >= 2);
                assert.notEqual(keys.indexOf('id'), -1);
                assert.notEqual(keys.indexOf('title'), -1);
                assert.notEqual(keys.indexOf('abbreviation'), -1);
            }
            done();
        });
    });

    it('GET /v3/roles (Admin authenticated)', function(done){
        request('http://localhost:3000/v3/roles', {
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
                assert.notEqual(keys.indexOf('title'), -1);
                assert.notEqual(keys.indexOf('abbreviation'), -1);
            }
            done();
        });
    });

    it('POST /v3/roles (unauthenticated)', function(done){
        request.post('http://localhost:3000/v3/roles', {
            body: JSON.stringify({
                'title': roleTemplate.title,
                'abbreviation': roleTemplate.abbreviation
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

    it('POST /v3/roles (User authenticated)', function(done){
        request.post('http://localhost:3000/v3/roles', {
            body: JSON.stringify({
                'title': roleTemplate.title,
                'abbreviation': roleTemplate.abbreviation
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

    it('POST /v3/roles (Admin authenticated)', function(done){
        request.post('http://localhost:3000/v3/roles', {
            body: JSON.stringify({
                'title': roleTemplate.title,
                'abbreviation': roleTemplate.abbreviation
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
            assert.notEqual(keys.indexOf('title'), -1);
            assert.notEqual(keys.indexOf('abbreviation'), -1);
            assert.equal(json.title, roleTemplate.title);
            assert.equal(json.abbreviation, roleTemplate.abbreviation);

            // Save the role ID to do an update and delete later
            roleTemplate.id = json.id;
            console.log('got role ID:', roleTemplate.id);

            done();
        });
    });

    it('GET /v3/roles/:id (unauthenticated)', function(done){
        // Dummy Role ID but should still get Unauthorized
        request.get('http://localhost:3000/v3/roles/A1', {
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

    it('GET /v3/roles/:id (invalid role id)', function(done){
        // Fail if we don't have a roleI D
        assert.ok(roleTemplate.id);

        request.get('http://localhost:3000/v3/roles/' + roleTemplate.id.substr(0, 5), {
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

    it('GET /v3/roles/:id (authenticated)', function(done){
        // Fail if we don't have a role ID
        assert.ok(roleTemplate.id);

        request.get('http://localhost:3000/v3/roles/' + roleTemplate.id, {
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
            assert.notEqual(keys.indexOf('title'), -1);
            assert.notEqual(keys.indexOf('abbreviation'), -1);
            assert.equal(json.title, roleTemplate.title);
            assert.equal(json.abbreviation, roleTemplate.abbreviation);
            done();
        });
    });

    it('PUT /v3/roles/:id (unauthenticated)', function(done){
        // Dummy Role ID but should still get Unauthorized
        request.put('http://localhost:3000/v3/roles/A1', {
            body: JSON.stringify({
                'title': roleTemplate.title + ' v2',
                'abbreviation': roleTemplate.abbreviation
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

    it('PUT /v3/roles/:id (invalid role id)', function(done){
        // Fail if we don't have a role ID
        assert.ok(roleTemplate.id);

        request.put('http://localhost:3000/v3/roles/' + roleTemplate.id.substr(0, 5), {
            body: JSON.stringify({
                'title': roleTemplate.title + ' v2',
                'abbreviation': roleTemplate.abbreviation
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

    it('PUT /v3/roles/:id (User authenticated)', function(done){
        // Fail if we don't have a role ID
        assert.ok(roleTemplate.id);

        // Dummy Role ID but should still get Unauthorized
        request.put('http://localhost:3000/v3/roles/'+roleTemplate.id, {
            body: JSON.stringify({
                'title': roleTemplate.title + ' v2',
                'abbreviation': roleTemplate.abbreviation
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

    it('PUT /v3/roles/:id (Admin authenticated)', function(done){
        // Fail if we don't have a role ID
        assert.ok(roleTemplate.id);

        request.put('http://localhost:3000/v3/roles/'+roleTemplate.id, {
            body: JSON.stringify({
                'title': roleTemplate.title + ' v2',
                'abbreviation': roleTemplate.abbreviation
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
            assert.notEqual(keys.indexOf('title'), -1);
            assert.notEqual(keys.indexOf('abbreviation'), -1);
            assert.equal(json.title, roleTemplate.title + ' v2');
            assert.equal(json.abbreviation, roleTemplate.abbreviation);
            done();
        });
    });

    it('DELETE /v3/roles/:id (unauthenticated)', function(done){
        // Dummy Role ID but should still get Unauthorized
        request.del('http://localhost:3000/v3/roles/A1', {
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

    it('DELETE /v3/roles/:id (invalid role id)', function(done){
        // Fail if we don't have a role ID
        assert.ok(roleTemplate.id);

        request.del('http://localhost:3000/v3/roles/'+roleTemplate.id.substr(0, 5), {
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

    it('DELETE /v3/roles/:id (User authenticated)', function(done){
        // Fail if we don't have a role ID
        assert.ok(roleTemplate.id);

        request.del('http://localhost:3000/v3/roles/'+roleTemplate.id, {
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

    it('DELETE /v3/roles/:id (Admin authenticated)', function(done){
        // Fail if we don't have a role ID
        assert.ok(roleTemplate.id);

        request.del('http://localhost:3000/v3/roles/'+roleTemplate.id, {
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
