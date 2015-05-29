/* global it, describe */

/* Copyright © 2015 PointSource, LLC. All rights reserved. */
var path = require('path'),
    request = require('request'),
    assert = require('assert'),
    util = require('../util/launch'),
    _ = require('underscore');

describe('LINKS - test simple REST calls', function () {

    var linksTemplate = {};

    it('GET /v3/links (unauthenticated)', function (done) {
        request('http://localhost:3000/v3/links', function(err, resp, body) {
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

    it('GET /v3/links (User authenticated)', function(done){
        request('http://localhost:3000/v3/links', {
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
                assert.ok(keys.length >= 1);
                assert.notEqual(keys.indexOf('id'), -1);
                assert.notEqual(keys.indexOf('project'), -1);
                linksTemplate.project = json.project;
            }
            done();
        });
    });

    it('GET /v3/links (Admin authenticated)', function(done){
        request('http://localhost:3000/v3/links', {
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
                assert.ok(keys.length >= 1);
                assert.notEqual(keys.indexOf('id'), -1);
                assert.notEqual(keys.indexOf('project'), -1);
                linksTemplate.project = json.project;
            }
            done();
        });
    });

    it('POST /v3/links (unauthenticated)', function(done){
        request.post('http://localhost:3000/v3/links', {
            body: JSON.stringify({
                'project': linksTemplate.project
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

    it('POST /v3/links (User authenticated)', function(done){
        request.post('http://localhost:3000/v3/links', {
            body: JSON.stringify({
                'project': linksTemplate.project
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

    it('POST /v3/links (Admin authenticated)', function(done){
        request.post('http://localhost:3000/v3/links', {
            body: JSON.stringify({
                'project': linksTemplate.project
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
            assert.ok(keys.length >= 1);
            assert.notEqual(keys.indexOf('id'), -1);
            assert.notEqual(keys.indexOf('project'), -1);
            assert.equal(json.project, linksTemplate.project);

            // Save the link ID to do an update and delete later
            linksTemplate.id = json.id;
            console.log('got link ID:', linksTemplate.id);

            done();
        });
    });

    it('GET /v3/links/:id (unauthenticated)', function(done){
        // Dummy Role ID but should still get Unauthorized
        request.get('http://localhost:3000/v3/links/A1', {
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

    it('GET /v3/links/:id (invalid link id)', function(done){
        // Fail if we don't have a link ID
        assert.ok(linksTemplate.id);

        request.get('http://localhost:3000/v3/links/' + linksTemplate.id.substr(0, 5), {
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

    it('GET /v3/links/:id (authenticated)', function(done){
        // Fail if we don't have a link ID
        assert.ok(linksTemplate.id);

        request.get('http://localhost:3000/v3/links/' + linksTemplate.id, {
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
            assert.ok(keys.length >= 1);
            assert.notEqual(keys.indexOf('id'), -1);
            assert.notEqual(keys.indexOf('project'), -1);
            assert.equal(json.project, linksTemplate.project);
            done();
        });
    });

    it('PUT /v3/links/:id (unauthenticated)', function(done){
        // Dummy Role ID but should still get Unauthorized
        request.put('http://localhost:3000/v3/links/A1', {
            body: JSON.stringify({
                'project': linksTemplate.project
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

    it('PUT /v3/links/:id (invalid link id)', function(done){
        // Fail if we don't have a link ID
        assert.ok(linksTemplate.id);

        request.put('http://localhost:3000/v3/links/' +linksTemplate.id.substr(0, 5), {
            body: JSON.stringify({
                'project': linksTemplate.project
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

    it('PUT /v3/links/:id (User authenticated)', function(done){
        // Fail if we don't have a link ID
        assert.ok(linksTemplate.id);

        // Dummy Role ID but should still get Unauthorized
        request.put('http://localhost:3000/v3/links/'+linksTemplate.id, {
            body: JSON.stringify({
                'project': linksTemplate.project
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

    it('PUT /v3/links/:id (Admin authenticated)', function(done){
        // Fail if we don't have a link ID
        assert.ok(linksTemplate.id);

        request.put('http://localhost:3000/v3/links/'+linksTemplate.id, {
            body: JSON.stringify({
                'project': linksTemplate.project
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
            assert.ok(keys.length >= 1);
            assert.notEqual(keys.indexOf('id'), -1);
            assert.notEqual(keys.indexOf('project'), -1);
            assert.equal(json.project, linksTemplate.project);
            done();
        });
    });

    it('DELETE /v3/links/:id (unauthenticated)', function(done){
        // Dummy Role ID but should still get Unauthorized
        request.del('http://localhost:3000/v3/links/A1', {
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

    it('DELETE /v3/links/:id (invalid link id)', function(done){
        // Fail if we don't have a link ID
        assert.ok(linksTemplate.id);

        request.del('http://localhost:3000/v3/links/'+linksTemplate.id.substr(0, 5), {
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

    it('DELETE /v3/links/:id (User authenticated)', function(done){
        // Fail if we don't have a link ID
        assert.ok(linksTemplate.id);

        request.del('http://localhost:3000/v3/links/'+linksTemplate.id, {
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

    it('DELETE /v3/links/:id (Admin authenticated)', function(done){
        // Fail if we don't have a link ID
        assert.ok(linksTemplate.id);

        request.del('http://localhost:3000/v3/links/'+linksTemplate.id, {
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
