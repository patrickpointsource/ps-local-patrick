'use strict';

var tasksController = require('../../server/controllers/tasks');

describe('Tasks controller suite', function() {
    it('Tasks controller listTasks', function(done) {
        tasksController.listTasks(function(err, result){
            expect(err).toBeNull();
            expect(result).toBeDefined();
            done();
        });
    });
});