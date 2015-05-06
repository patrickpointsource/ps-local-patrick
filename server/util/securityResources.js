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
            editGroups : 'editGroups',
            viewMyRoleTitle: 'viewMyRoleTitle',
            viewMySecondaryRole: 'viewMySecondaryRole',
            viewOthersRoleTitle: 'viewOthersRoleTitle',
            viewOthersSecondaryRole: 'viewOthersSecondaryRole',
            editRolesTitles: 'editRolesTitles',
            viewMySecurityRoles: 'viewMySecurityRoles',
            viewOthersSecurityRoles: 'viewOthersSecurityRoles',
            editProfileSecurityRoles: 'editProfileSecurityRoles',
            viewMyPublicPersonnelData: 'viewMyPublicPersonnelData',
            viewOthersPublicPersonnelData: 'viewOthersPublicPersonnelData',
            viewMyPrivatePersonnelData: 'viewMyPrivatePersonnelData',
            viewOthersPrivatePersonnelData: 'viewOthersPrivatePersonnelData'
        } 
    },
    projects :{
        resourceName: 'projects',
        permissions: {
            viewProjects : 'viewProjects',
            addProjects: 'addProjects',
            editProjects : 'editProjects',
            deleteProjects : 'deleteProjects',
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
            viewMyApprovedOOO : 'viewMyApprovedOOO',
            viewOthersApprovedOOO : 'viewOthersApprovedOOO',
            viewMyPendingOOO : 'viewMyPendingOOO',
            viewOthersPendingOOO : 'viewOthersPendingOOO',
            viewMyRemovedOOO : 'viewMyRemovedOOO',
            viewOtherRemovedOOO : 'viewOtherRemovedOOO'
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
    ,
    reports :{
        resourceName: 'reports',
        permissions: {
            viewReports: 'viewReports'
        }
    },
    
    departments :{
        resourceName: 'departments',
        permissions: {
        	viewDepartments: 'viewDepartments',
        	editDepartments: 'editDepartments',
    		deleteDepartments: 'deleteDepartments'
        }
    }

};

module.exports = securityResources;