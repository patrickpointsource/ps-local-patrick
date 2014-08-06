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
    },
    hours :{
        resourceName: 'hours',
        permissions: ['viewHours','editHours','editMyHours', 'viewHoursReportsAndCSV']
    },
    people :{
        resourceName: 'people',
        permissions: ['viewPeople', 'viewProfile','editProfile','viewMyProfile','editMyProfile','viewPersonnelData','editPersonnelData','viewGroups','editGroups']
    },
    projects :{
        resourceName: 'projects',
        permissions: ['viewProjects','editProjects','viewProjectLinks','editProjectLinks','viewRoles','editRoles']
    }
};

module.exports = securityResources;