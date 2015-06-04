/* global it, describe */

/* Copyright © 2015 PointSource, LLC. All rights reserved. */
var path = require('path'),
    request = require('request'),
    assert = require('assert'),
    util = require('../util/launch'),
    _ = require('underscore');


describe('PEOPLE - test simple REST calls', function () {
	
	
    var personID;

    var ADMIN = {
        id : '52ab7005e4b0fd2a8d130008',
        googleId : '107489151868154139257',
        name: {
            familyName : 'apps',
            givenName : 'ps',
            fullName : 'ps apps'
        }
    };
	
    var USER = {
        id : '5310e2bae4b0a300af62db04',
        name: {
            familyName : 'apps2',
            givenName : 'ps',
            fullName : 'ps apps2'
        }
    };

    var USER_WITH_MANAGER = {
        id : '52ab7005e4b0fd2a8d130004',
        name: {
            familyName : 'Burckart',
            givenName : 'Erik',
            fullName : 'Erik Burckart'
        }
    };

    var DEFAULT_PERSON = {
        name: {
            familyName : 'apps_test',
            givenName : 'ps',
            fullName : 'ps apps_test'
        },
        isActive : 'true',
        googleId : '52ab7005e4b0fd2a8d12fff0',
        primaryRole : '52c70ae5e4b0911cacf4e117',
        secondaryRoles : ['52c70ae5e4b0911cacf4e118'],
        groups : [ 'Admin' ]
    };
	
    var CHANGED_PERSON = {
        name: {
            familyName : 'apps_test_v2',
            givenName : 'ps_v2',
            fullName : 'ps_v2 apps_test_v2'
        },
        isActive : 'true',
        googleId : '52ab7005e4b0fd2a8d12fff0',
        primaryRole : '52c70ae5e4b0911cacf4e117',
        secondaryRoles : ['52c70ae5e4b0911cacf4e118'],
        groups : [ 'Admin' ]
    };
	
    it('GET /v3/people (unauthenticated)', function (done) {
        request('http://localhost:3000/v3/people', function(err, resp, body) {
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

    it('GET /v3/people (User authenticated)', function(done){
        request('http://localhost:3000/v3/people', {
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
                assert.notEqual(keys.indexOf('name'), -1);
            }
            done();
        });
    });

    it('GET /v3/people (Admin authenticated)', function(done){
        request('http://localhost:3000/v3/people', {
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
                assert.notEqual(keys.indexOf('name'), -1);
            }
            done();
        });
    });

    it('POST /v3/people (unauthenticated)', function(done){
        request.post('http://localhost:3000/v3/people', {
            body: JSON.stringify(DEFAULT_PERSON),
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

    it('POST /v3/people (User authenticated)', function(done){
        request.post('http://localhost:3000/v3/people', {
            body: JSON.stringify(DEFAULT_PERSON),
            headers: {
                'Content-Type': 'application/json'
            },
            jar: util.userCookieJar
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
            assert.equal(json.name.familyName, DEFAULT_PERSON.name.familyName);
            assert.equal(json.name.givenName, DEFAULT_PERSON.name.givenName);
            assert.equal(json.name.fullName, DEFAULT_PERSON.name.fullName);

            // Save the personID to do an update and delete later
            personID = json.id;

            done();
        });
    });

    it('GET /v3/people/:id (unauthenticated)', function(done){
        // Dummy Person ID but should still get Unauthorized
        request.get('http://localhost:3000/v3/people/A1', {
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

    it('GET /v3/people/:id (invalid person id)', function(done){
        // Fail if we don't have a personID
        assert.ok(personID);

        request.get('http://localhost:3000/v3/people/' + personID.substr(0, 5), {
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

    it('GET /v3/people/:id (authenticated)', function(done){
        // Fail if we don't have a personID
        assert.ok(personID);

        request.get('http://localhost:3000/v3/people/' + personID, {
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
            assert.equal(json.id, personID);
            assert.equal(json.name.familyName, DEFAULT_PERSON.name.familyName);
            assert.equal(json.name.givenName, DEFAULT_PERSON.name.givenName);
            assert.equal(json.name.fullName, DEFAULT_PERSON.name.fullName);
            done();
        });
    });

    it('PUT /v3/people/:id (unauthenticated)', function(done){
        // Dummy Person ID but should still get Unauthorized
        request.put('http://localhost:3000/v3/people/A1', {
            body: JSON.stringify(CHANGED_PERSON),
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

    it('PUT /v3/people/:id (invalid person id)', function(done){
        // Fail if we don't have a personID
        assert.ok(personID);

        request.put('http://localhost:3000/v3/people/' + personID.substr(0, 5), {
            body: JSON.stringify(CHANGED_PERSON),
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

    it('PUT /v3/people/:id (User authenticated)', function(done){
        // Fail if we don't have a personID
        assert.ok(personID);

        // Dummy Person ID but should still get Unauthorized
        request.put('http://localhost:3000/v3/people/'+personID, {
            body: JSON.stringify(CHANGED_PERSON),
            headers: {
                'Content-Type': 'application/json'
            },
            jar: util.userCookieJar
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
            assert.equal(json.id, personID);
            assert.equal(json.name.familyName, CHANGED_PERSON.name.familyName);
            assert.equal(json.name.givenName, CHANGED_PERSON.name.givenName);
            assert.equal(json.name.fullName, CHANGED_PERSON.name.fullName);
            done();
        });
    });

    it('PUT /v3/people/:id (Admin authenticated)', function(done){
        // Fail if we don't have a personID
        assert.ok(personID);

        request.put('http://localhost:3000/v3/people/'+personID, {
            body: JSON.stringify(CHANGED_PERSON),
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
            assert.equal(json.id, personID);
            assert.equal(json.name.familyName, CHANGED_PERSON.name.familyName);
            assert.equal(json.name.givenName, CHANGED_PERSON.name.givenName);
            assert.equal(json.name.fullName, CHANGED_PERSON.name.fullName);
            done();
        });
    });

    it('GET /v3/googlePlus/:id (unauthenticated)', function (done) {
        request('http://localhost:3000/v3/people/googlePlus/' + ADMIN.googleId, function(err, resp, body) {
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

    it('GET /v3/googlePlus/:id (invalid person id)', function(done){

        request.get('http://localhost:3000/v3/people/googlePlus/' + ADMIN.googleId.substr(0, 5), {
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

    it('GET /v3/people/googlePlus/:id (User authenticated)', function(done){

        request.get('http://localhost:3000/v3/people/googlePlus/' + ADMIN.googleId, {
            headers: {
                'Content-Type': 'application/json'
            },
            jar: util.userCookieJar
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
            assert.equal(json.name.familyName, ADMIN.name.familyName);
            assert.equal(json.name.givenName, ADMIN.name.givenName);
            assert.equal(json.name.fullName, ADMIN.name.fullName);
            done();
        });
    });

    it('GET /v3/people/googlePlus/:id (Admin authenticated)', function(done){

        request.get('http://localhost:3000/v3/people/googlePlus/' + ADMIN.googleId, {
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
            assert.equal(json.name.familyName, ADMIN.name.familyName);
            assert.equal(json.name.givenName, ADMIN.name.givenName);
            assert.equal(json.name.fullName, ADMIN.name.fullName);
            done();
        });
    });

    it('GET /v3/people/me (unauthenticated)', function (done) {
        request('http://localhost:3000/v3/people/me', function(err, resp, body) {
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

    it('GET /v3/people/me (User authenticated)', function(done){

        request.get('http://localhost:3000/v3/people/me', {
            headers: {
                'Content-Type': 'application/json'
            },
            jar: util.userCookieJar
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
            assert.equal(json.name.familyName, 'apps2');
            assert.equal(json.name.givenName, 'ps');
            assert.equal(json.name.fullName, 'ps apps2');
            done();
        });
    });

    it('GET /v3/people/me (Admin authenticated)', function(done){

        request.get('http://localhost:3000/v3/people/me', {
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
            assert.equal(json.name.familyName, 'apps');
            assert.equal(json.name.givenName, 'ps');
            assert.equal(json.name.fullName, 'ps apps');
            done();
        });
    });

    it('GET /v3/people/:id/manager (unauthenticated)', function(done){
        // Dummy Person ID but should still get Unauthorized
        request.get('http://localhost:3000/v3/people/A1/manager', {
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

    it('GET /v3/people/:id/manager (invalid person id)', function(done){

        request.get('http://localhost:3000/v3/people/' + USER_WITH_MANAGER.id.substr(0, 5) + '/manager', {
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

    it('GET /v3/people/:id/manager (User authenticated)', function(done){

        request.get('http://localhost:3000/v3/people/' + USER_WITH_MANAGER.id + '/manager', {
            headers: {
                'Content-Type': 'application/json'
            },
            jar: util.userCookieJar
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
            assert.equal(json.name.familyName, USER_WITH_MANAGER.name.familyName);
            assert.equal(json.name.givenName, USER_WITH_MANAGER.name.givenName);
            assert.equal(json.name.fullName, USER_WITH_MANAGER.name.fullName);
            done();
        });
    });

    it('GET /v3/people/:id/manager (Admin authenticated)', function(done){
    
        request.get('http://localhost:3000/v3/people/' + USER_WITH_MANAGER.id + '/manager', {
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
            assert.equal(json.name.familyName, USER_WITH_MANAGER.name.familyName);
            assert.equal(json.name.givenName, USER_WITH_MANAGER.name.givenName);
            assert.equal(json.name.fullName, USER_WITH_MANAGER.name.fullName);
            done();
        });
    });

    it('GET /v3/people/:id/accessRights (unauthenticated)', function(done){
        // Dummy Person ID but should still get Unauthorized
        request.get('http://localhost:3000/v3/people/A1/accessRights', {
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

    it('GET /v3/people/:id/accessRights (invalid person id)', function(done){

        request.get('http://localhost:3000/v3/people/' + ADMIN.id.substr(0, 5) + '/accessRights', {
            headers: {
                'Content-Type': 'application/json'
            },
            jar: util.adminCookieJar
        }, function(err, resp, body) {
            if(err){
                throw err;
            }
            if(resp.statusCode !== 500){
                console.log('error:', err, body);
            }
            assert.equal(resp.statusCode, 500);
            done();
        });
    });

    it('GET /v3/people/:id/accessRights (User authenticated)', function(done){

        request.get('http://localhost:3000/v3/people/' + ADMIN.id + '/accessRights', {
            headers: {
                'Content-Type': 'application/json'
            },
            jar: util.userCookieJar
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
            assert.ok(keys.length >= 5);
            assert.notEqual(keys.indexOf('hasFinanceRights'), -1);
            assert.notEqual(keys.indexOf('hasAdminRights'), -1);
            assert.notEqual(keys.indexOf('hasManagementRights'), -1);
            assert.notEqual(keys.indexOf('hasProjectManagementRights'), -1);
            assert.notEqual(keys.indexOf('hasExecutiveRights'), -1);
            done();
        });
    });

    it('GET /v3/people/:id/accessRights (Admin authenticated)', function(done){

        request.get('http://localhost:3000/v3/people/' + ADMIN.id + '/accessRights', {
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
            assert.ok(keys.length >= 5);
            assert.notEqual(keys.indexOf('hasFinanceRights'), -1);
            assert.notEqual(keys.indexOf('hasAdminRights'), -1);
            assert.notEqual(keys.indexOf('hasManagementRights'), -1);
            assert.notEqual(keys.indexOf('hasProjectManagementRights'), -1);
            assert.notEqual(keys.indexOf('hasExecutiveRights'), -1);
            done();
        });
    });

    it('GET /v3/people/:id/googleProfile (unauthenticated)', function(done){
        // Dummy Person ID but should still get Unauthorized
        request.get('http://localhost:3000/v3/people/A1/googleProfile', {
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

    it('GET /v3/people/:id/googleProfile (invalid person id)', function(done){

        request.get('http://localhost:3000/v3/people/' + ADMIN.id.substr(0, 5) + '/googleProfile', {
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

    it('GET /v3/people/:id/googleProfile (User authenticated)', function(done){

        request.get('http://localhost:3000/v3/people/' + ADMIN.id + '/googleProfile', {
            headers: {
                'Content-Type': 'application/json'
            },
            jar: util.userCookieJar
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
            assert.equal(json.id, ADMIN.googleId);
            assert.equal(json.name.familyName, ADMIN.name.familyName);
            assert.equal(json.name.givenName, ADMIN.name.givenName);
            assert.equal(json.name.fullName, ADMIN.name.fullName);
            done();
        });
    });

    it('GET /v3/people/:id/accessRights (Admin authenticated)', function(done){

        request.get('http://localhost:3000/v3/people/' + ADMIN.id + '/googleProfile', {
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
            assert.equal(json.id, ADMIN.googleId);
            assert.equal(json.name.familyName, ADMIN.name.familyName);
            assert.equal(json.name.givenName, ADMIN.name.givenName);
            assert.equal(json.name.fullName, ADMIN.name.fullName);
            done();
        });
    });

    it('DELETE /v3/people/:id (Admin unauthenticated)', function(done){
        // Dummy Person ID but should still get Unauthorized
        request.del('http://localhost:3000/v3/people/A1', {
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

    it('DELETE /v3/people/:id (invalid person id)', function(done){
        // Fail if we don't have a personID
        assert.ok(personID);

        request.del('http://localhost:3000/v3/people/'+personID.substr(0, 5), {
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

    it('DELETE /v3/people/:id (User authenticated)', function(done){
        // Fail if we don't have a personID
        assert.ok(personID);

        request.del('http://localhost:3000/v3/people/'+personID, {
            headers: {
                'Content-Type': 'application/json'
            },
            jar: util.userCookieJar
        }, function(err, resp, body) {
            if(err){
                throw err;
            }
            if(resp.statusCode !== 200){
                console.log('error:', err, body);
            }
            assert.equal(resp.statusCode, 200);
            done();
        });
    });

    // create another user by admin
    it('POST /v3/people (Admin authenticated)', function(done){
        request.post('http://localhost:3000/v3/people', {
            body: JSON.stringify(DEFAULT_PERSON),
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
            assert.equal(json.name.familyName, DEFAULT_PERSON.name.familyName);
            assert.equal(json.name.givenName, DEFAULT_PERSON.name.givenName);
            assert.equal(json.name.fullName, DEFAULT_PERSON.name.fullName);
    
            // Save the personID to do an update and delete later
            personID = json.id;
            console.log('got personID:', personID);

            done();
        });
    });

    it('DELETE /v3/people/:id (Admin authenticated)', function(done){
        // Fail if we don't have a personID
        assert.ok(personID);
        request.del('http://localhost:3000/v3/people/'+personID, {
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
