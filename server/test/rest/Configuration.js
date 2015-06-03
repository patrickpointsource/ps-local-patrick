/* global it, describe */

/* Copyright © 2015 PointSource, LLC. All rights reserved. */
var path = require('path'),
    request = require('request'),
    assert = require('assert'),
    util = require('../util/launch'),
    _ = require('underscore');

describe('CONFIGURATIONS - test simple REST calls', function () {

    var configTemplate = {
        config: 'Test',
        properties: [{'name':'test name','value':'test value'}]
    };

    it('GET /v3/configurations (unauthenticated)', function (done) {
        request('http://localhost:3000/v3/configurations', function(err, resp, body) {
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

    it('GET /v3/configurations (User authenticated)', function(done){
        request('http://localhost:3000/v3/configurations', {
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

    it('GET /v3/configurations (Admin authenticated)', function(done){
        request('http://localhost:3000/v3/configurations', {
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
                assert.notEqual(keys.indexOf('config'), -1);
                assert.notEqual(keys.indexOf('properties'), -1);
            }
            done();
        });
    });

    it('POST /v3/configurations (unauthenticated)', function(done){
        request.post('http://localhost:3000/v3/configurations', {
            body: JSON.stringify({
                config: configTemplate.config,
                properties: configTemplate.properties
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

    it('POST /v3/configurations (User authenticated)', function(done){
        request.post('http://localhost:3000/v3/configurations', {
            body: JSON.stringify({
                config: configTemplate.config,
                properties: configTemplate.properties
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

    it('POST /v3/configurations (Admin authenticated)', function(done){
        request.post('http://localhost:3000/v3/configurations', {
            body: JSON.stringify({
                config: configTemplate.config,
                properties: configTemplate.properties
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
            assert.notEqual(keys.indexOf('config'), -1);
            assert.notEqual(keys.indexOf('properties'), -1);
            assert.equal(json.config, configTemplate.config);
            assert.ok(_.isEqual(json.properties, configTemplate.properties));

            // Save the configuration ID to do an update and delete later
            configTemplate.id = json.id;
            console.log('got configuration ID:', configTemplate.id);

            done();
        });
    });

    it('GET /v3/configurations/:id (unauthenticated)', function(done){
        // Dummy Configuration ID but should still get Unauthorized
        request.get('http://localhost:3000/v3/configurations/A1', {
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

    it('GET /v3/configurations/:id (invalid configuration id)', function(done){
        // Fail if we don't have a configuration ID
        assert.ok(configTemplate.id);

        request.get('http://localhost:3000/v3/configurations/' + configTemplate.id.substr(0, 5), {
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

    it('GET /v3/configurations/:id (authenticated)', function(done){
        // Fail if we don't have a configuration ID
        assert.ok(configTemplate.id);

        request.get('http://localhost:3000/v3/configurations/' + configTemplate.id, {
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
            assert.notEqual(keys.indexOf('config'), -1);
            assert.notEqual(keys.indexOf('properties'), -1);
            assert.equal(json.config, configTemplate.config);
            assert.ok(_.isEqual(json.properties, configTemplate.properties));
            done();
        });
    });

    it('PUT /v3/configurations/:id (unauthenticated)', function(done){
        // Dummy Configuration ID but should still get Unauthorized
        request.put('http://localhost:3000/v3/configurations/A1', {
            body: JSON.stringify({
                config: configTemplate.config+' v2',
                properties: configTemplate.properties
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

    it('PUT /v3/configurations/:id (invalid configuration id)', function(done){
        // Fail if we don't have a configuration ID
        assert.ok(configTemplate.id);

        request.put('http://localhost:3000/v3/configurations/' + configTemplate.id.substr(0, 5), {
            body: JSON.stringify({
                config: configTemplate.config+' v2',
                properties: configTemplate.properties
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

    it('PUT /v3/configurations/:id (User authenticated)', function(done){
        // Fail if we don't have a configuration ID
        assert.ok(configTemplate.id);

        // Dummy Configuration ID but should still get Unauthorized
        request.put('http://localhost:3000/v3/configurations/'+configTemplate.id, {
            body: JSON.stringify({
                config: configTemplate.config+' v2',
                properties: configTemplate.properties
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

    it('PUT /v3/configurations/:id (Admin authenticated)', function(done){
        // Fail if we don't have a configuration ID
        assert.ok(configTemplate.id);

        request.put('http://localhost:3000/v3/configurations/'+configTemplate.id, {
            body: JSON.stringify({
                config: configTemplate.config+' v2',
                properties: configTemplate.properties
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
            assert.notEqual(keys.indexOf('config'), -1);
            assert.notEqual(keys.indexOf('properties'), -1);
            assert.equal(json.config, configTemplate.config+' v2');
            assert.ok(_.isEqual(json.properties, configTemplate.properties));
            done();
        });
    });

    it('DELETE /v3/configurations/:id (unauthenticated)', function(done){
        // Dummy Configuration ID but should still get Unauthorized
        request.del('http://localhost:3000/v3/configurations/A1', {
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

    it('DELETE /v3/configurations/:id (invalid configuration id)', function(done){
        // Fail if we don't have a configuration ID
        assert.ok(configTemplate.id);

        request.del('http://localhost:3000/v3/configurations/'+configTemplate.id.substr(0, 5), {
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

    it('DELETE /v3/configurations/:id (User authenticated)', function(done){
        // Fail if we don't have a configuration ID
        assert.ok(configTemplate.id);

        request.del('http://localhost:3000/v3/configurations/'+configTemplate.id, {
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

    it('DELETE /v3/configurations/:id (Admin authenticated)', function(done){
        // Fail if we don't have a configuration ID
        assert.ok(configTemplate.id);

        request.del('http://localhost:3000/v3/configurations/'+configTemplate.id, {
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
