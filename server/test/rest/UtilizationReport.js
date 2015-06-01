/* global it, describe */

/* Copyright © 2015 PointSource, LLC. All rights reserved. */
var path = require('path'),
    request = require('request'),
    assert = require('assert'),
    util = require('../util/launch'),
    _ = require('underscore');

describe('UTILIZATION REPORT - test simple REST calls', function () {

    var utilizationReportRequest = 'http://localhost:3000/v3/reports/utilization';
    var requestDataTemplate = {
        department : '3ae0b327c7b0d2e13607c1d7a602383c',
        person: '52ab7005e4b0fd2a8d12fff7',
        startDate: '2014-01-01',
        endDate: '2015-01-01'
    };

    var getRequest = function(startDate, endDate, department, person) {
        var request = utilizationReportRequest+'?startDate='+startDate+'&endDate='+endDate;
        if (department){
            request = request+'&department='+department;
        }
        if (person){
            request = request+'&person='+person;
        }
        return request;
    };

    it('GET /v3/reports/utilization (unauthenticated)', function (done) {
        request(utilizationReportRequest, function(err, resp, body) {
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

    it('GET /v3/reports/utilization without params', function (done) {
        request(utilizationReportRequest, {
            jar: util.userCookieJar
        }, function(err, resp, body){
            if(err){
                throw err;
            }
            if(resp.statusCode !== 400){
                console.log('error:', err, body);
            }
            assert.equal(resp.statusCode, 400);
            done();
        });
    });

    it('GET /v3/reports/utilization without startDate', function (done) {
        request(utilizationReportRequest+'?endDate='+requestDataTemplate.endDate, {
            jar: util.userCookieJar
        }, function(err, resp, body){
            if(err){
                throw err;
            }
            if(resp.statusCode !== 400){
                console.log('error:', err, body);
            }
            assert.equal(resp.statusCode, 400);
            assert.ok(body.indexOf('Missing startDate query parameter') !== -1);
            done();
        });
    });

    it('GET /v3/reports/utilization without endDate', function (done) {
        request(utilizationReportRequest+'?startDate='+requestDataTemplate.startDate, {
            jar: util.userCookieJar
        }, function(err, resp, body){
            if(err){
                throw err;
            }
            if(resp.statusCode !== 400){
                console.log('error:', err, body);
            }
            assert.equal(resp.statusCode, 400);
            assert.ok(body.indexOf('Missing endDate query parameter') !== -1);
            done();
        });
    });

    it('GET /v3/reports/utilization by department (Admin authenticated)', function(done){
        var requestStr = getRequest(requestDataTemplate.startDate,
            requestDataTemplate.endDate,
            requestDataTemplate.department);
        request(requestStr, {jar: util.adminCookieJar},
            function(err, resp, body){
            if(err){
                throw err;
            }
            if(resp.statusCode !== 200){
                console.log('error:', err, body);
            }
            assert.ok(!err);
            assert.equal(resp.statusCode, 200);
            var json = JSON.parse(body);
            var keys = _.keys(json);
            assert.ok(keys.length >= 2);
            assert.notEqual(keys.indexOf('hours'), -1);
            assert.notEqual(keys.indexOf('people'), -1);
            done();
        });
    });

    it('GET /v3/reports/utilization by department (User authenticated)', function(done){
        var requestStr = getRequest(requestDataTemplate.startDate,
            requestDataTemplate.endDate,
            requestDataTemplate.department);
        request(requestStr, {jar: util.userCookieJar},
            function(err, resp, body){
            if(err){
                throw err;
            }
            if(resp.statusCode !== 200){
                console.log('error:', err, body);
            }
            assert.ok(!err);
            assert.equal(resp.statusCode, 200);
            var json = JSON.parse(body);
            var keys = _.keys(json);
            assert.ok(keys.length >= 2);
            assert.notEqual(keys.indexOf('hours'), -1);
            assert.notEqual(keys.indexOf('people'), -1);
            done();
        });
    });

    it('GET /v3/reports/utilization by person (Admin authenticated)', function(done){
        var requestStr = getRequest(requestDataTemplate.startDate,
            requestDataTemplate.endDate,
            null,
            requestDataTemplate.person);
        request(requestStr, {jar: util.adminCookieJar},
            function(err, resp, body){
            if(err){
                throw err;
            }
            if(resp.statusCode !== 200){
                console.log('error:', err, body);
            }
            assert.ok(!err);
            assert.equal(resp.statusCode, 200);
            var json = JSON.parse(body);
            var keys = _.keys(json);
            assert.ok(keys.length >= 2);
            assert.notEqual(keys.indexOf('hours'), -1);
            assert.notEqual(keys.indexOf('people'), -1);
            done();
        });
    });

    it('GET /v3/reports/utilization by person (User authenticated)', function(done){
        var requestStr = getRequest(requestDataTemplate.startDate,
            requestDataTemplate.endDate,
            null,
            requestDataTemplate.person);
        request(requestStr, {jar: util.userCookieJar},
            function(err, resp, body){
            if(err){
                throw err;
            }
            if(resp.statusCode !== 200){
                console.log('error:', err, body);
            }
            assert.ok(!err);
            assert.equal(resp.statusCode, 200);
            var json = JSON.parse(body);
            var keys = _.keys(json);
            assert.ok(keys.length >= 2);
            assert.notEqual(keys.indexOf('hours'), -1);
            assert.notEqual(keys.indexOf('people'), -1);
            done();
        });
    });
});
