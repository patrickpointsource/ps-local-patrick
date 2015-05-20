/* Copyright © 2015 PointSource, LLC. All rights reserved. */
var path = require('path'),
    request = require('request'),
    assert = require('assert'),
    util = require('../util/launch'),
    _ = require('underscore');

describe('SKILLS - test simple REST calls', function () {
	
	it('GET /v3/skills (unauthenticated)', function (done) {
        request('http://localhost:3000/v3/skills', function(err, resp, body) {
            assert.equal(resp.statusCode, 401);
            done();
        });
    });
	
	it('GET /v3/skills (User authenticated)', function(done){
        request('http://localhost:3000/v3/skills', {
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

	it('GET /v3/skills (Admin authenticated)', function(done){
        request('http://localhost:3000/v3/skills', {
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
                assert.ok(keys.length == 2);
                assert.notEqual(keys.indexOf('id'), -1);
                assert.notEqual(keys.indexOf('name'), -1);
            }
            done();
        });
    });

	it('POST /v3/skills (unauthenticated)', function(done){
        request.post('http://localhost:3000/v3/skills', {
            body: JSON.stringify({
                'title': 'Test Skill'
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        }, function(err, resp, body) {
            assert.equal(resp.statusCode, 401);
            done();
        });
    });
	
	it('POST /v3/skills (User authenticated)', function(done){
        request.post('http://localhost:3000/v3/skills', {
            body: JSON.stringify({
                'title': 'Test Skill'
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
	
	var skillID;
    it('POST /v3/skills (Admin authenticated)', function(done){
        request.post('http://localhost:3000/v3/skills', {
            body: JSON.stringify({
                'title': 'Test Skill'
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
            assert.equal(json.name, 'Test Skill');
            
            // Save the skillID to do an update and delete later
            skillID = json.id;
            console.log('got skillID:', skillID);
    
            done();
        });
    });
	
    it('GET /v3/skills/:id (unauthenticated)', function(done){
        // Dummy Skill ID but should still get Unauthorized
        request.get('http://localhost:3000/v3/skills/A1', {
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
    
    it('GET /v3/skills/:id (invalid skill id)', function(done){
        // Fail if we don't have a skillID
        assert.ok(skillID);
    
        request.get('http://localhost:3000/v3/skills/' + skillID.substr(0, 5), {
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
   
    it('GET /v3/skills/:id (authenticated)', function(done){
        // Fail if we don't have a skillID
        assert.ok(skillID);
    
        request.get('http://localhost:3000/v3/skills/' + skillID, {
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
            assert.equal(json.name, 'Test Skill');
            done();
        });
    });
    
    it('PUT /v3/skills/:id (unauthenticated)', function(done){
        // Dummy Skill ID but should still get Unauthorized
        request.put('http://localhost:3000/v3/skills/A1', {
            body: JSON.stringify({
                'title': 'Test Skill'
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
    
    it('PUT /v3/skills/:id (invalid skill id)', function(done){
        // Fail if we don't have a skillID
        assert.ok(skillID);
        
        request.put('http://localhost:3000/v3/skills/' + skillID.substr(0, 5), {
            body: JSON.stringify({
                'title': 'Test Skill'
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
    
    it('PUT /v3/skills/:id (User authenticated)', function(done){
        // Fail if we don't have a skillID
        assert.ok(skillID);

        request.put('http://localhost:3000/v3/skills/'+skillID, {
            body: JSON.stringify({
                'title': 'Test Skill v2'
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
    
    it('PUT /v3/skills/:id (Admin authenticated)', function(done){
        // Fail if we don't have a skillID
        assert.ok(skillID);
    
        request.put('http://localhost:3000/v3/skills/'+skillID, {
            body: JSON.stringify({
                'title': 'Test Skill v2'
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
            assert.equal(json.id, skillID);
            assert.equal(json.name, 'Test Skill v2');
            done();
        });
    });
    
    it('DELETE /v3/skills/:id (unauthenticated)', function(done){
        // Dummy Skill ID but should still get Unauthorized
        request.del('http://localhost:3000/v3/skills/A1', {
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
    
    it('DELETE /v3/skills/:id (invalid skill id)', function(done){
        // Fail if we don't have a skillID
        assert.ok(skillID);
    
        request.del('http://localhost:3000/v3/skills/' + skillID.substr(0, 5), {
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
    
    it('DELETE /v3/skills/:id (User authenticated)', function(done){
        // Fail if we don't have a skillID
        assert.ok(skillID);
    
        request.del('http://localhost:3000/v3/skills/'+skillID, {
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
    
    it('DELETE /v3/skills/:id (Admin authenticated)', function(done){
        // Fail if we don't have a skillID
        assert.ok(skillID);
    
        request.del('http://localhost:3000/v3/skills/'+skillID, {
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
