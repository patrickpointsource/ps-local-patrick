'use strict';

var securityResources = {
    tasks :{
        resourceName: 'tasks',
        permissions: ['viewTasks','editTasks']
    },
    assignments :{
        resourceName: 'assignments',
        permissions: ['viewAssignments','editAssignments']
    },
    configuration :{
        resourceName: 'configuration',
        permissions: ['viewConfiguration','editConfiguration']
    }
};

module.exports = securityResources;