/* Copyright © 2015 PointSource, LLC. All rights reserved. */
var path = require('path'),
    request = require('request'),
    assert = require('assert'),
    util = require('../util/launch'),
    _ = require('underscore');

describe('DEPARTMENT CATEGORIES - test simple REST calls', function () {
		
	it('GET /v3/departments/categories (unauthenticated)', function (done) {
        request('http://localhost:3000/v3/departments/categories', function(err, resp, body) {
            assert.equal(resp.statusCode, 401);
            done();
        });
    });
	
	it('GET /v3/departments/categories (User authenticated)', function(done){
        request('http://localhost:3000/v3/departments/categories', {
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
                assert.ok(keys.length === 3 || keys.length === 4);
                assert.notEqual(keys.indexOf('id'), -1);
                assert.notEqual(keys.indexOf('name'), -1);
                assert.notEqual(keys.indexOf('trimmedValue'), -1);
            }
            done();
        });
    });

	it('GET /v3/departments/categories (Admin authenticated)', function(done){
        request('http://localhost:3000/v3/departments/categories', {
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
                assert.ok(keys.length >= 3);
                assert.notEqual(keys.length === 3 || keys.length === 4);
                assert.notEqual(keys.indexOf('name'), -1);
                assert.notEqual(keys.indexOf('trimmedValue'), -1);
            }
            done();
        });
    });
    
	it('POST /v3/departments/categories (unauthenticated)', function(done){
        request.post('http://localhost:3000/v3/departments/categories', {
            body: JSON.stringify({
                'name': 'Test Department Category',
                'trimmedValue': 'Test Trimmed Value'
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        }, function(err, resp, body) {
            assert.equal(resp.statusCode, 401);
            done();
        });
    });
	
	it('POST /v3/departments/categories (User authenticated)', function(done){
        request.post('http://localhost:3000/v3/departments/categories', {
            body: JSON.stringify({
                'name': 'Test Department Category',
                'trimmedValue': 'Test Trimmed Value'
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
	
	var departmentCategoryID;
    it('POST /v3/departments/categories (Admin authenticated)', function(done){
        request.post('http://localhost:3000/v3/departments/categories', {
            body: JSON.stringify({
                'name': 'Test Department Category',
                'trimmedValue': 'Test Trimmed Value'
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
            assert.ok(keys.length >= 3);
            assert.notEqual(keys.indexOf('id'), -1);
            assert.notEqual(keys.indexOf('name'), -1);
            assert.notEqual(keys.indexOf('trimmedValue'), -1);
            assert.equal(json.name, 'Test Department Category');
            assert.equal(json.trimmedValue, 'Test Trimmed Value');
            
            // Save the departmentCategoryID to do an update and delete later
            departmentCategoryID = json.id;
            console.log('got departmentCategoryID:', departmentCategoryID);
    
            done();
        });
    });
	
    it('GET /v3/departments/categories/:id (unauthenticated)', function(done){
        // Dummy Department Category ID but should still get Unauthorized
        request.get('http://localhost:3000/v3/departments/categories/A1', {
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
    
    it('GET /v3/departments/categories/:id (invalid task id)', function(done){
        // Fail if we don't have a departmentCategoryID
        assert.ok(departmentCategoryID);
    
        request.get('http://localhost:3000/v3/departments/categories/' + departmentCategoryID.substr(0, 5), {
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
   
    it('GET /v3/departments/categories/:id (authenticated)', function(done){
        // Fail if we don't have a departmentCategoryID
        assert.ok(departmentCategoryID);
    
        request.get('http://localhost:3000/v3/departments/categories/' + departmentCategoryID, {
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
            assert.ok(keys.length >= 3);
            assert.notEqual(keys.indexOf('id'), -1);
            assert.notEqual(keys.indexOf('name'), -1);
            assert.notEqual(keys.indexOf('trimmedValue'), -1);
            assert.equal(json.id, departmentCategoryID);
            assert.equal(json.name, 'Test Department Category');
            assert.equal(json.trimmedValue, 'Test Trimmed Value');

            done();
        });
    });
    
    it('PUT /v3/departments/categories/:id (unauthenticated)', function(done){
        // Dummy Department Category ID but should still get Unauthorized
        request.put('http://localhost:3000/v3/departments/categories/A1', {
            body: JSON.stringify({
                'name': 'Test Department Category v2',
                'trimmedValue': 'Test Trimmed Value v2'
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
    
    it('PUT /v3/departments/categories/:id (invalid task id)', function(done){
        // Fail if we don't have a departmentCategoryID
        assert.ok(departmentCategoryID);
        
        request.put('http://localhost:3000/v3/departments/categories/' + departmentCategoryID.substr(0, 5), {
            body: JSON.stringify({
                'name': 'Test Department Category v2',
                'trimmedValue': 'Test Trimmed Value v2'
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
    
    it('PUT /v3/departments/categories/:id (User authenticated)', function(done){
        // Fail if we don't have a departmentCategoryID
        assert.ok(departmentCategoryID);

        // Dummy Task ID but should still get Unauthorized
        request.put('http://localhost:3000/v3/departments/categories/'+departmentCategoryID, {
            body: JSON.stringify({
                'name': 'Test Department Category v2',
                'trimmedValue': 'Test Trimmed Value v2'
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
    
    it('PUT /v3/departments/categories/:id (Admin authenticated)', function(done){
        // Fail if we don't have a departmentCategoryID
        assert.ok(departmentCategoryID);
    
        request.put('http://localhost:3000/v3/departments/categories/'+departmentCategoryID, {
            body: JSON.stringify({
                'name': 'Test Department Category v2',
                'trimmedValue': 'Test Trimmed Value v2'
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
            assert.ok(keys.length >= 3);
            assert.notEqual(keys.indexOf('id'), -1);
            assert.notEqual(keys.indexOf('name'), -1);
            assert.notEqual(keys.indexOf('trimmedValue'), -1);
            assert.equal(json.id, departmentCategoryID);
            assert.equal(json.name, 'Test Department Category v2');
            assert.equal(json.trimmedValue, 'Test Trimmed Value v2');
            done();
        });
    });
    
    it('DELETE /v3/departments/categories/:id (unauthenticated)', function(done){
        // Dummy Task ID but should still get Unauthorized
        request.del('http://localhost:3000/v3/departments/categories/A1', {
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
    
    it('DELETE /v3/departments/categories/:id (invalid department category id)', function(done){
        // Fail if we don't have a departmentCategoryID
        assert.ok(departmentCategoryID);
    
        request.del('http://localhost:3000/v3/departments/categories/'+departmentCategoryID.substr(0, 5), {
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
    
    it('DELETE /v3/departments/categories/:id (User authenticated)', function(done){
        // Fail if we don't have a departmentCategoryID
        assert.ok(departmentCategoryID);
    
        request.del('http://localhost:3000/v3/departments/categories/'+departmentCategoryID, {
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
    
    it('DELETE /v3/departments/categories/:id (Admin authenticated)', function(done){
        // Fail if we don't have a departmentCategoryID
        assert.ok(departmentCategoryID);
    
        request.del('http://localhost:3000/v3/departments/categories/'+departmentCategoryID, {
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