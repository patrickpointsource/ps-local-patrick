/* global it, describe */

/* Copyright © 2015 PointSource, LLC. All rights reserved. */
var path = require('path'),
    request = require('request'),
    assert = require('assert'),
    util = require('../util/launch'),
    _ = require('underscore');

describe('HOURS - test simple REST calls', function () {

    it('GET /v3/hours (unauthenticated)', function (done) {
        request('http://localhost:3000/v3/hours', function(err, resp, body) {
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

    it('GET /v3/hours (User authenticated)', function(done){
        request('http://localhost:3000/v3/hours', {
            qs: {
                person: '54105c59e4b0e587c077f854'
            },
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
                assert.ok(keys.length > 3 && keys.length < 9);
                assert.notEqual(keys.indexOf('id'), -1);
                assert.notEqual(keys.indexOf('hours'), -1);
                assert.notEqual(keys.indexOf('description'), -1);
                assert.notEqual(keys.indexOf('person'), -1);
            }
            done();
        });
    });

    it('GET /v3/hours (Admin authenticated)', function(done){
        request('http://localhost:3000/v3/hours', {
            qs: {
                person: '54105c59e4b0e587c077f854'
            },
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
                assert.ok(keys.length > 3 && keys.length < 9);
                assert.notEqual(keys.indexOf('id'), -1);
                assert.notEqual(keys.indexOf('hours'), -1);
                assert.notEqual(keys.indexOf('description'), -1);
                assert.notEqual(keys.indexOf('person'), -1);
            }
            done();
        });
    });

    it('POST /v3/hours (unauthenticated)', function(done){
        request.post('http://localhost:3000/v3/hours', {
            body: JSON.stringify({
                'date': '2015-01-01',
                'description': 'Test Hours',
                'hours': 5,
                'person': '54105c59e4b0e587c077f854',
                'project': '52b0a6c2e4b02565de24922d'
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
    
    it('POST /v3/hours (User authenticated)', function(done){
        request.post('http://localhost:3000/v3/hours', {
            body: JSON.stringify({
                'date': '2015-01-01',
                'description': 'Test Hours',
                'hours': 5,
                'person': '54105c59e4b0e587c077f854',
                'project': '52b0a6c2e4b02565de24922d'
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
    
    var hoursID;
    it('POST /v3/hours (Admin authenticated)', function(done){
        request.post('http://localhost:3000/v3/hours', {
            body: JSON.stringify({
                'date': '2015-01-01',
                'description': 'Test Hours',
                'hours': 5,
                'person': '54105c59e4b0e587c077f854',
                'project': '52b0a6c2e4b02565de24922d'
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
            assert.notEqual(keys.indexOf('description'), -1);
            assert.equal(json.description, 'Test Hours');
            
            // Save the taskID to do an update and delete later
            hoursID = json.id;
            console.log('got hoursID:', hoursID);
    
            done();
        });
    });
    
    it('GET /v3/hours/:id (unauthenticated)', function(done){
        // Dummy Hours ID but should still get Unauthorized
        request.get('http://localhost:3000/v3/hours/A1', {
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
    
    it('GET /v3/hours/:id (invalid hours id)', function(done){
        // Fail if we don't have a hoursID
        assert.ok(hoursID);
    
        request.get('http://localhost:3000/v3/hours/' + hoursID.substr(0, 5), {
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
    
    it('GET /v3/hours/:id (authenticated)', function(done){
        // Fail if we don't have a hoursID
        assert.ok(hoursID);
    
        request.get('http://localhost:3000/v3/hours/' + hoursID, {
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
            assert.notEqual(keys.indexOf('description'), -1);
            assert.equal(json.id, hoursID);
            assert.equal(json.description, 'Test Hours');
            done();
        });
    });
    
    it('PUT /v3/hours/:id (unauthenticated)', function(done){
        // Dummy Hours ID but should still get Unauthorized
        request.put('http://localhost:3000/v3/hours/A1', {
            body: JSON.stringify({
                'date': '2015-01-01',
                'description': 'Test Hours v2',
                'hours': 5,
                'person': '54105c59e4b0e587c077f854',
                'project': '52b0a6c2e4b02565de24922d'
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
    
    it('PUT /v3/hours/:id (invalid hours id)', function(done){
        // Fail if we don't have a hoursID
        assert.ok(hoursID);
        
        request.put('http://localhost:3000/v3/hours/' + hoursID.substr(0, 5), {
            body: JSON.stringify({
                'date': '2015-01-01',
                'description': 'Test Hours v2',
                'hours': 5,
                'person': '54105c59e4b0e587c077f854',
                'project': '52b0a6c2e4b02565de24922d'
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

    it('PUT /v3/hours/:id (User authenticated)', function(done){
        // Fail if we don't have a hoursID
        assert.ok(hoursID);

        request.put('http://localhost:3000/v3/hours/'+hoursID, {
            body: JSON.stringify({
                'date': '2015-01-01',
                'description': 'Test Hours v2',
                'hours': 5,
                'person': '54105c59e4b0e587c077f854',
                'project': '52b0a6c2e4b02565de24922d'
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
    
    it('PUT /v3/hours/:id (Admin authenticated)', function(done){
        // Fail if we don't have a hoursID
        assert.ok(hoursID);
    
        request.put('http://localhost:3000/v3/hours/'+hoursID, {
            body: JSON.stringify({
                'date': '2015-01-01',
                'description': 'Test Hours v2',
                'hours': 5,
                'person': '54105c59e4b0e587c077f854',
                'project': '52b0a6c2e4b02565de24922d'
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
            assert.notEqual(keys.indexOf('description'), -1);
            assert.equal(json.id, hoursID);
            assert.equal(json.description, 'Test Hours v2');
            done();
        });
    });
    
    it('DELETE /v3/hours/:id (unauthenticated)', function(done){
        // Dummy Hours ID but should still get Unauthorized
        request.del('http://localhost:3000/v3/hours/A1', {
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
    
    it('DELETE /v3/hours/:id (invalid hours id)', function(done){
        // Fail if we don't have a hoursID
        assert.ok(hoursID);
    
        request.del('http://localhost:3000/v3/hours/' + hoursID.substr(0, 5), {
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
    
    it('DELETE /v3/hours/:id (User authenticated)', function(done){
        // Fail if we don't have a hoursID
        assert.ok(hoursID);
    
        request.del('http://localhost:3000/v3/hours/'+hoursID, {
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
    
    it('DELETE /v3/hours/:id (Admin authenticated)', function(done){
        // Fail if we don't have a hoursID
        assert.ok(hoursID);
    
        request.del('http://localhost:3000/v3/hours/'+hoursID, {
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
    //*/
});