'use strict';

var securityResources = {
    
    tasks :{
        resourceName: 'tasks',
        permissions: {
        	viewTasks : 'viewTasks',
        	editTasks : 'editTasks'
        }
    },
    assignments :{
        resourceName: 'assignments',
        permissions: {
	       	viewAssignments : 'viewAssignments',
        	editAssignments : 'editAssignments'
        }
    },
    configuration :{
        resourceName: 'configuration',
        permissions: {
	       	viewConfiguration : 'viewConfiguration',
        	editConfiguration : 'editConfiguration'
        }
        
    },
    hours :{
        resourceName: 'hours',
        permissions: {
	       	viewHours : 'viewHours',
        	editHours : 'editHours',
        	deleteMyHours : 'deleteMyHours',
        	editMyHours : 'editMyHours',
        	viewHoursReportsAndCSV : 'viewHoursReportsAndCSV'
        }
    },
    people :{
        resourceName: 'people',
        permissions: {
	       	viewPeople : 'viewPeople',
        	viewProfile : 'viewProfile',
        	editProfile : 'editProfile',
        	viewMyProfile : 'viewMyProfile',
        	editMyProfile : 'editMyProfile',
        	viewPersonnelData : 'viewPersonnelData',
        	editPersonnelData : 'editPersonnelData',
        	viewGroups : 'viewGroups',
        	editGroups : 'editGroups'
        } 
    },
    projects :{
        resourceName: 'projects',
        permissions: {
	       	viewProjects : 'viewProjects',
        	editProjects : 'editProjects',
        	viewProjectLinks : 'viewProjectLinks',
        	editProjectLinks : 'editProjectLinks',
        	viewRoles : 'viewRoles',
        	editRoles : 'editRoles'
        }         
    }
};

module.exports = securityResources;