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
    },
    skills :{
        resourceName: 'skills',
        permissions: {
        	viewSkills : 'viewSkills',
        	editSkills : 'editSkills'
        }
    },
    vacations :{
        resourceName: 'vacations',
        permissions: {
            viewVacations : 'viewVacations',
            viewMyVacations: 'viewMyVacations',
            editVacations : 'editVacations',
            editMyVacations : 'editMyVacations',
        }
    },
    notifications :{
        resourceName: 'notifications',
        permissions: {
            viewNotifications : 'viewNotifications',
            editNotifications : 'editNotifications',
            deleteNotifications : 'deleteNotifications'
        }
    },
	upgrade :{
        resourceName: 'upgrade',
        permissions: {
            executeUpgrade : 'executeUpgrade'
        }
    },
    securityRoles :{
        resourceName: 'securityRoles',
        permissions: {
            viewSecurityRoles: 'viewSecurityRoles',
            editSecurityRoles: 'editSecurityRoles'
        }
    }

};

module.exports = securityResources;