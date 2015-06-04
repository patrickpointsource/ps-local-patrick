/* global it, describe */

/* Copyright © 2015 PointSource, LLC. All rights reserved. */
var path = require('path'),
    request = require('request'),
    assert = require('assert'),
    util = require('../util/launch'),
    _ = require('underscore');

describe('PROJECT PHASES - test simple REST calls', function () {

    var projectPhasesRequest = 'http://localhost:3000/v3/projects/05625e12ea02cbdf615a53025b3efe5d/phases';
    var projectPhasesDataTemplate = {};

    it('GET /projects/{projectID}/phases (unauthenticated)', function (done) {
        request(projectPhasesRequest, function(err, resp, body) {
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

    it('GET /projects/{projectID}/phases (authenticated)', function(done){
        request(projectPhasesRequest, {
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
                assert.ok(keys.length > 2 && keys.length < 6);
                assert.notEqual(keys.indexOf('id'), -1);
                assert.notEqual(keys.indexOf('project'), -1);
                assert.notEqual(keys.indexOf('name'), -1);
                assert.notEqual(keys.indexOf('startDate'), -1);
                projectPhasesDataTemplate = item;
            }
            done();
        });
    });

    it('POST /projects/{projectID}/phases (unauthenticated)', function(done){
        request.post(projectPhasesRequest, {
            body: JSON.stringify({
                project: projectPhasesDataTemplate.project,
                name: projectPhasesDataTemplate.name,
                startDate: getFormattedDate(projectPhasesDataTemplate.startDate)
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

    it('POST /projects/{projectID}/phases (missing required attributes)', function(done){
        request.post(projectPhasesRequest, {
            body: JSON.stringify({
            }),
            headers: {
                'Content-Type': 'application/json'
            },
            jar: util.adminCookieJar
        }, function(err, resp, body) {
            if(err){
                throw err;
            }
            if(resp.statusCode !== 400){
                console.log('error:', err, body);
            }
            assert.equal(resp.statusCode, 400);
            assert.ok(body.indexOf('Missing required property') !== -1);

            done();
        });
    });

    it('POST /projects/{projectID}/phases (User authenticated)', function(done){
        request.post(projectPhasesRequest, {
            body: JSON.stringify({
                project: projectPhasesDataTemplate.project,
                name: projectPhasesDataTemplate.name,
                startDate: getFormattedDate(projectPhasesDataTemplate.startDate)
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

    it('POST /projects/{projectID}/phases (Admin authenticated)', function(done){
        request.post(projectPhasesRequest, {
            body: JSON.stringify({
                project: projectPhasesDataTemplate.project,
                name: projectPhasesDataTemplate.name,
                startDate: getFormattedDate(projectPhasesDataTemplate.startDate)
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
            assert.ok(keys.length > 2 && keys.length < 6);
            assert.notEqual(keys.indexOf('id'), -1);
            assert.notEqual(keys.indexOf('project'), -1);
            assert.notEqual(keys.indexOf('name'), -1);
            assert.notEqual(keys.indexOf('startDate'), -1);
            assert.equal(json.name, projectPhasesDataTemplate.name);
            assert.equal(json.project, projectPhasesDataTemplate.project);
            assert.equal(json.startDate, projectPhasesDataTemplate.startDate);

            // Save the taskID to do an update and delete later
            projectPhasesDataTemplate.id = json.id;

            done();
        });
    });

    it('GET /projects/{projectID}/phases/:id (unauthenticated)', function(done){
        // Dummy Project Phase ID but should still get Unauthorized
        request.get(projectPhasesRequest + '/A1', {
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

    it('GET /projects/{projectID}/phases/:id (invalid project phase id)', function(done){
        // Fail if we don't have a project phases ID
        assert.ok(projectPhasesDataTemplate.id);

        request.get(projectPhasesRequest + projectPhasesDataTemplate.id.substr(0, 5), {
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

    it('GET /projects/{projectID}/phases/:id (authenticated)', function(done){
        // Fail if we don't have a project phases ID
        assert.ok(projectPhasesDataTemplate.id);

        request.get(projectPhasesRequest+'/'+projectPhasesDataTemplate.id, {
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
            assert.ok(keys.length > 2 && keys.length < 6);
            assert.notEqual(keys.indexOf('id'), -1);
            assert.notEqual(keys.indexOf('project'), -1);
            assert.notEqual(keys.indexOf('name'), -1);
            assert.notEqual(keys.indexOf('startDate'), -1);
            assert.equal(json.id, projectPhasesDataTemplate.id);
            assert.equal(json.name, projectPhasesDataTemplate.name);
            assert.equal(json.project, projectPhasesDataTemplate.project);
            assert.equal(json.startDate, projectPhasesDataTemplate.startDate);
            done();
        });
    });

    it('PUT /projects/{projectID}/phases/:id (unauthenticated)', function(done){
        // Dummy Project Phase ID but should still get Unauthorized
        request.put(projectPhasesRequest+'/A1', {
            body: JSON.stringify({
                project: projectPhasesDataTemplate.project,
                name: projectPhasesDataTemplate.name,
                startDate: getFormattedDate(projectPhasesDataTemplate.startDate)
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

    it('PUT /projects/{projectID}/phases/:id (invalid project phase id)', function(done){
        // Fail if we don't have a project phases ID
        assert.ok(projectPhasesDataTemplate.id);

        request.put(projectPhasesRequest+'/'+projectPhasesDataTemplate.id.substr(0, 5), {
            body: JSON.stringify({
                project: projectPhasesDataTemplate.project,
                name: projectPhasesDataTemplate.name,
                startDate: getFormattedDate(projectPhasesDataTemplate.startDate)
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

    // Should fail because a normal user doesn't have permission to update a project phase
    it('PUT /projects/{projectID}/phases/:id (User authenticated)', function(done){
        // Fail if we don't have a project phases ID
        assert.ok(projectPhasesDataTemplate.id);

        request.put(projectPhasesRequest+'/'+projectPhasesDataTemplate.id, {
            body: JSON.stringify({
                project: projectPhasesDataTemplate.project,
                name: projectPhasesDataTemplate.name,
                startDate: getFormattedDate(projectPhasesDataTemplate.startDate)
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

    it('PUT /projects/{projectID}/phases/:id (Admin authenticated)', function(done){
        // Fail if we don't have a project phases ID
        assert.ok(projectPhasesDataTemplate.id);
        projectPhasesDataTemplate.name = projectPhasesDataTemplate.name + 'v2';

        request.put(projectPhasesRequest+'/'+projectPhasesDataTemplate.id, {
            body: JSON.stringify({
                project: projectPhasesDataTemplate.project,
                name: projectPhasesDataTemplate.name,
                startDate: getFormattedDate(projectPhasesDataTemplate.startDate)
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
            assert.ok(keys.length > 2 && keys.length < 6);
            assert.notEqual(keys.indexOf('id'), -1);
            assert.notEqual(keys.indexOf('project'), -1);
            assert.notEqual(keys.indexOf('name'), -1);
            assert.notEqual(keys.indexOf('startDate'), -1);
            assert.equal(json.id, projectPhasesDataTemplate.id);
            assert.equal(json.name, projectPhasesDataTemplate.name);
            assert.equal(json.project, projectPhasesDataTemplate.project);
            assert.equal(json.startDate, projectPhasesDataTemplate.startDate);
            done();
        });
    });

    it('DELETE /projects/{projectID}/phases/:id (unauthenticated)', function(done){
        // Dummy Project Phase ID but should still get Unauthorized
        request.del(projectPhasesRequest+'/A1', {
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

    it('DELETE /projects/{projectID}/phases/:id (invalid project phase id)', function(done){
        // Fail if we don't have a project phases ID
        assert.ok(projectPhasesDataTemplate.id);

        request.del(projectPhasesRequest+'/'+projectPhasesDataTemplate.id.substr(0, 5), {
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

    it('DELETE /projects/{projectID}/phases/:id (User authenticated)', function(done){
        // Fail if we don't have a project phases ID
        assert.ok(projectPhasesDataTemplate.id);

        request.del(projectPhasesRequest+'/'+projectPhasesDataTemplate.id, {
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

    it('DELETE /projects/{projectID}/phases/:id (Admin authenticated)', function(done){
        // Fail if we don't have a project phases ID
        assert.ok(projectPhasesDataTemplate.id);

        request.del(projectPhasesRequest+'/'+projectPhasesDataTemplate.id, {
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

    var getFormattedDate = function(dateStr) {
        return dateStr.slice(0, 10);
    };
});
