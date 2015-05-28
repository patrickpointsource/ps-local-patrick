/* global it, describe */

/* Copyright © 2015 PointSource, LLC. All rights reserved. */
var path = require('path'),
    request = require('request'),
    assert = require('assert'),
    util = require('../util/launch'),
    _ = require('underscore');

describe('CLIENTS - test simple REST calls', function () {

    it('GET /v3/clients (unauthenticated)', function (done) {
        request('http://localhost:3000/v3/clients', function(err, resp, body) {
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

    it('GET /v3/clients (User authenticated)', function(done){
        request('http://localhost:3000/v3/clients', {
            jar: util.userCookieJar
        }, function(err, resp, body){
            if(err){
                throw err;
            }
            if(resp.statusCode !== 403){
                console.log('error:', err, body);
            }
            assert.ok(!err);
            assert.equal(resp.statusCode, 403);
            done();
        });
    });

    it('GET /v3/clients (Admin authenticated)', function(done){
        request('http://localhost:3000/v3/clients', {
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
    
    it('POST /v3/clients (unauthenticated)', function(done){
        request.post('http://localhost:3000/v3/clients', {
            body: JSON.stringify({
                'name': 'Test Client'
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
    
    it('POST /v3/clients (User authenticated)', function(done){
        request.post('http://localhost:3000/v3/clients', {
            body: JSON.stringify({
                'name': 'Test Client'
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
    
    var clientID;
    it('POST /v3/clients (Admin authenticated)', function(done){
        request.post('http://localhost:3000/v3/clients', {
            body: JSON.stringify({
                name: 'Test Client'
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
            assert.equal(json.name, 'Test Client');
            
            // Save the clientID to do an update and delete later
            clientID = json.id;
            console.log('got clientID:', clientID);
    
            done();
        });
    });
    
    it('GET /v3/clients/:id (unauthenticated)', function(done){
        // Dummy Client ID but should still get Unauthorized
        request.get('http://localhost:3000/v3/clients/A1', {
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
    
    it('GET /v3/clients/:id (invalid client id)', function(done){
        // Fail if we don't have a clientID
        assert.ok(clientID);
    
        request.get('http://localhost:3000/v3/clients/' + clientID.substr(0, 5), {
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
    
    it('GET /v3/clients/:id (authenticated)', function(done){
        // Fail if we don't have a clientID
        assert.ok(clientID);
    
        request.get('http://localhost:3000/v3/clients/' + clientID, {
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
            assert.equal(json.id, clientID);
            assert.equal(json.name, 'Test Client');
            done();
        });
    });
    
    it('PUT /v3/clients/:id (unauthenticated)', function(done){
        // Dummy Client ID but should still get Unauthorized
        request.put('http://localhost:3000/v3/clients/A1', {
            body: JSON.stringify({
                'name': 'Test Client v2'
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
    
    it('PUT /v3/clients/:id (invalid client id)', function(done){
        // Fail if we don't have a clientID
        assert.ok(clientID);
        
        request.put('http://localhost:3000/v3/clients/' + clientID.substr(0, 5), {
            body: JSON.stringify({
                'name': 'Test Client v2'
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

    it('PUT /v3/clients/:id (User authenticated)', function(done){
        // Fail if we don't have a clientID
        assert.ok(clientID);

        // Dummy Client ID but should still get Unauthorized
        request.put('http://localhost:3000/v3/clients/'+clientID, {
            body: JSON.stringify({
                'name': 'Test Client v2'
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
    
    it('PUT /v3/clients/:id (Admin authenticated)', function(done){
        // Fail if we don't have a clientID
        assert.ok(clientID);
    
        request.put('http://localhost:3000/v3/clients/'+clientID, {
            body: JSON.stringify({
                name: 'Test Client v2'
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
            assert.equal(json.id, clientID);
            assert.equal(json.name, 'Test Client v2');
            done();
        });
    });
    
    it('DELETE /v3/clients/:id (unauthenticated)', function(done){
        // Dummy Client ID but should still get Unauthorized
        request.del('http://localhost:3000/v3/clients/A1', {
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
    
    it('DELETE /v3/clients/:id (invalid client id)', function(done){
        // Fail if we don't have a clientID
        assert.ok(clientID);
    
        request.del('http://localhost:3000/v3/clients/' + clientID.substr(0, 5), {
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
    
    it('DELETE /v3/clients/:id (User authenticated)', function(done){
        // Fail if we don't have a clientID
        assert.ok(clientID);
    
        request.del('http://localhost:3000/v3/clients/'+clientID, {
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
    
    it('DELETE /v3/clients/:id (Admin authenticated)', function(done){
        // Fail if we don't have a clientID
        assert.ok(clientID);
    
        request.del('http://localhost:3000/v3/clients/'+clientID, {
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
