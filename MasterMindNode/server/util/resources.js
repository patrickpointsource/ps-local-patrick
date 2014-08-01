'use strict';

var resources = {
    tasks :{
        resourceName: 'tasks',
        permissions: ['viewTasks','editTasks']
    },
    assignments :{
        resourceName: 'assignments',
        permissions: ['viewAssignments','editAssignments']
    }
};

module.exports = resources;