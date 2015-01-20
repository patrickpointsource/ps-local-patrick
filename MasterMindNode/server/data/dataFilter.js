'use strict';

var util = require('../util/util');
var security = require('../util/security');
var _ = require( 'underscore' );

/**
 * Returns active people filtered by roles
 * 
 * @param {Object} roleResources
 * @param {Object} callback
 */

var filterPeopleByRoles = function(roleIds, includeInactive, people) {
	var result = [];
	_.each(people, function(person) {
		checkPeopleByRoles(person, roleIds, includeInactive, function (checked) {
			if (checked) {
				result.push(person);
			}
		});
	});
	return result;
};

var checkPeopleByRoles = function (person, roleIds, includeInactive, callback) {
	if (roleIds instanceof Array) {
		var found = false;
		_.each(roleIds, function(roleId) {
			if (roleId) {
	 			checkPersonByRole (person, roleId, includeInactive, function (checked) {
					if (checked) {
						found = true;
						return;
					}
				});
			}
		});
		return callback(found);
	}
	else {
		checkPeopleByRoles(person, [roleIds], includeInactive, callback);
	}
};

var checkPersonByRole = function(person, roleId, includeInactive, callback) {
	var roleResource = roleId.indexOf("roles") == 0 ? roleId : util.getFullID( roleId, "roles");
	if ( (includeInactive || ( person.isActive && person.isActive != "false" ) )
			&& ( person.primaryRole && person.primaryRole.resource == roleResource ) ) {
		return callback(true);
	} 
	return callback(false);
};


/**
 * Returns people by isActive flag
 * 
 * @param {Object} people
 * @param {Object} isActive
 */

var filterPeopleByIsActiveFlag = function(people, isActive) {
	var result = [];
	_.each(people, function(person) {
		/*if (isActive && person.isActive && person.isActive != "false") {
			result.push(person);
		}
		else if (!isActive && ( !person.isActive || person.isActive == "false") ) {
			result.push(person);
		}*/
		if (isActive && person.isActive != "false") {
			result.push(person);
		}
		else if (!isActive && ( person.isActive == "false") ) {
			result.push(person);
		}
	});
	return result;
};


/**
 * Returns people people with primary role
 * 
 * @param {Object} people
 */

var filterPeopleWithPrimaryRole = function(people) {
	var result = [];
	_.each(people, function(person) {
		if (person.primaryRole && person.primaryRole.resource) {
			result.push(person);
		}
	});
	return result;
};

/**
 * Returns people filtered by groups
 * 
 * @param {Object} groups
 * @param {Object} people
 */

var filterPeopleByGroups = function(groups, people) {
	var result = [];
	_.each(people, function(person) {
		checkPerson(person, groups, function (checked){
			if (checked) {
				result.push(person);
			}
		});
	});
	return result;
};


var checkPerson = function(person, groups, callback) {

	if (groups) {
		var checked = false;
		if (!(groups instanceof Array)) {
			groups = [groups];
		}
		security.getUserRoles(person, function(err, userRole) {	    
			if ( userRole ) {
				_.each(groups, function(initialGroup) {		
					if ( _.findWhere(userRole.roles, { name: initialGroup }) ) {
						checked = true;
						return;
					}
				});
			}
		});		
		
		return callback (checked);
	}
	else {
		return callback (true);
	}

};


/**
 * Returns projects filtered by executive sponsor roles
 * 
 * @param {Object} roleResources
 * @param {Object} projects
 */

var filterProjectsByExecutiveSponsor = function(roleResources, projects) {
	return filterProjectsByRoleResources('executiveSponsor', roleResources, projects);
};


/**
 * Returns projects filtered by sponsor roles
 * 
 * @param {Object} roleResources
 * @param {Object} projects
 */

var filterProjectsBySponsors = function(roleResources, projects) {
	return filterProjectsByRoleResources(['executiveSponsor','salesSponsor'], roleResources, projects);
};


/**
 * Returns projects filtered by role resources
 * 
 * @param {Object} roleTypes
 * @param {Object} roleResources
 * @param {Object} projects
 */

var filterProjectsByRoleResources = function(roleTypes, roleResources, projects) {
	var result = [];
	_.each(projects, function(project) {
		checkRoleResourcesByRoleTypesInProject(roleTypes, roleResources, project, function (checked){
			if (checked) {
				result.push(project);
			}
		});
	});
	return result;
};


var checkRoleResourcesByRoleTypesInProject = function(roleTypes, roleResources, project, callback) {
	var checked = false;
	if (roleTypes instanceof Array) {
		_.each(roleTypes, function(roleType) {
			var res = project[roleType];
			if (res && roleResources.toString().indexOf(res.resource) != -1) {
				checked = true;
				return;
			}
		});
	}
	else {
		var res = project[roleTypes];
		if (res && roleResources.toString().indexOf(res.resource) != -1) {
			checked = true;
		}
	}
	return callback(checked);
};


/**
 * Returns projects filtered between dates by project types
 * 
 * @param {Object} startDate
 * @param {Object} endDate
 * @param {Object} types
 * @param {Object} projects
 */

var filterProjectsBetweenDatesByTypes = function(startDate, endDate, types, isCommited, projects) {
	var result = [];
	_.each(projects, function(project) {
		if (	
			(startDate == null  || project.startDate >= startDate) && 
				(endDate == null || project.endDate < endDate) && 
					( types == null || types.toString().indexOf(project.type) != -1) &&
						(isCommited == null || project.commited == isCommited)
					 ) { 
			result.push(project);
		}
	});
	return result;
};


/**
 * Returns projects filtered between dates by project types and sponsor role resources
 * 
 * @param {Object} startDate
 * @param {Object} endDate
 * @param {Object} types
 * @param {Object} isCommited
 * @param {Object} roleResources
 * @param {Object} projects
 */

var filterProjectsBetweenDatesByTypesAndSponsors = function(startDate, endDate, types, isCommited, roleResources, projects) {
	var filtered = ( roleResources != null ) ? filterProjectsBySponsors(roleResources, projects) : projects;
	return filterProjectsBetweenDatesByTypes(startDate, endDate, types, isCommited, filtered);
};


/**
 * Returns assignments filtered by type
 * 
 * @param {Object} types (for example 'active')
 * @param {Object} assignments
 */

var filterAssignmentsByTypes = function(types, assignments) {
	var result = [];
	_.each(assignments.data, function(assignment) {
		checkAssignmentByTypes(types, assignment, function(checked) {
			if (checked) {
				result.push(assignment);
			}
		});
	});
	return result;
};



var checkAssignmentByTypes = function(types, assignment, callback) {
	var checked = false;
	if (types instanceof Array) {
		_.each(types, function(type) {
			
			// checks for active assignments
			if (type == "active") {
				_.each(assignment.members, function(member) {
					if ( member.startDate <= util.getTodayDate() &&
							(!member.endDate || member.endDate > util.getTodayDate() ) ) {
						checked = true;
						return;				
					}

				});
			}

		});
		
		return callback(checked);
	}
	else {
		checkAssignmentByTypes([types], assignment, callback);
	}
}



/**
 * Returns projects filtered by statuses
 * 
 * @param {Object} statuses
 * @param {Object} projects
 */

var filterProjectsByStatuses = function(statuses, projects) {
	var result = [];
	_.each(projects, function(project) {
		checkProjectByStatuses(statuses, project, function(checked) {
			if (checked) {
				result.push(project);
			}
		});
	});
	return result;
};


/**
 * Returns projects filtered by project resources
 * 
 * @param {Object} resources
 * @param {Object} projects
 */

var filterProjectsByResources = function(resources, projects) {
	
	var result = [];
	resources = (resources instanceof Array) ? resources : [resources];
	
	_.each(projects, function(project) {
		_.each(resources, function(resource) {
			if (project.resource == resource) {
				result.push(project);
			}
		});
	});
	return result;
};


var checkProjectByStatuses = function(statuses, project, callback) {
	if (statuses instanceof Array) {
		var checked = false;
		_.each(statuses, function(status) {
			
			// checks for active projects
			if (status == "active"  &&
					project.startDate <= util.getTodayDate() &&
						(!project.endDate || project.endDate >= util.getTodayDate() ) &&
							project.type == "paid" &&
								project.committed == true ) {
				checked = true;
				return;				
			}

			// checks for backlog projects
			if (status == "backlog" &&
					project.startDate > util.getTodayDate() &&
						project.type == "paid" &&
							project.committed == true ) {
				checked = true;
				return;				
			}

			// checks for pipeline projects
			if (status == "pipeline" &&
					(!project.endDate || project.endDate >= util.getTodayDate() ) &&
						project.type == "paid" &&
							project.committed == false ) {
				checked = true;
				return;				
			}

			// checks for investment projects
			if (status == "investment" &&
					(!project.endDate || project.endDate >= util.getTodayDate() ) &&
						( project.type == "invest" || project.type == "poc" ) ) {
				checked = true;
				return;				
			}

			// checks for complete projects
			if (status == "complete" &&
					project.endDate < util.getTodayDate()  &&
							project.committed == true ) {
				checked = true;
				return;				
			}

			// checks for deallost projects
			if (status == "deallost" &&
					project.endDate < util.getTodayDate()  &&
							project.committed == false ) {
				checked = true;
				return;				
			}

			// checks for ongoing projects
			if (status == "ongoing" &&
					(!project.endDate || project.endDate >= util.getTodayDate() ) &&
						(  project.type == "invest" || project.type == "poc"  || ( project.committed == true && project.type == "paid" ) )  ) {
				checked = true;
				return;				
			}

			// checks for unfinished projects
			if (status == "unfinished" &&
					(!project.endDate || project.endDate >= util.getTodayDate() ) ) {
				checked = true;
				return;				
			}

			// checks for kick-off projects
			if (status == "kick-off" &&
					project.startDate >= util.getTodayDate() &&
						project.committed == true ) {
				checked = true;
				return;				
			}

			// checks for quickview projects
			if (status == "quickview" &&
					project.startDate <= util.getDateFromNow(6) &&
						( !project.endDate || project.endDate > util.getTodayDate() ) ) {
				checked = true;
				return;				
			}

		});
		
		return callback(checked);
	}
	else {
		checkProjectByStatuses([statuses], project, callback);
	}
}

/**
 * Returns notifications filtered by person
 * 
 * @param {Object} person
 * @param {Object} notifications
 */

var filterNotificationsByPerson = function(person, notifications) {
	var result = [];	
	_.each(notifications, function(notification) {
		if (notification.person && notification.person.resource == person) {
			result.push(notification);
		}
	});
	return result;
};

/**
 * Returns vacations filtered by person
 * 
 * @param {Object} person
 * @param {Object} vacations
 */

var filterVacationsByPerson = function(person, vacations) {
	var result = [];	
	_.each(vacations, function(vacation) {
		if (vacation.person && vacation.person.resource == person) {
			result.push(vacation);
		}
	});
	return result;
};

/**
 * Returns filtered vacations by people and period
 * 
 * @param {Object} people
 * @param {Object} startDate
 * @param {Object} endDate
 * @param {Object} vacations
 */

var filterVacationsByPeriod = function(people, startDate, endDate, vacations) {
	var result = [];	
	_.each(vacations, function(vacation) {
		checkVacation(vacation, people, startDate, endDate, function (checked) {
			if (checked) {
				result.push (vacation);
			}
		});
	});
	return result;
};

// vacation.start-vacation.end date can be "2014-11-23 17:00", startDate only "2014-11-23"
var checkVacation = function(vacation, people, startDate, endDate, callback) {

	var checked = false;
	if (people) {
		if (!(people instanceof Array)) {
			people = [people];
		}

		_.each(people, function(person) {
			if (vacation.person && vacation.person.resource == person) {
				checked = true;
			}
		});
		
	}
			
	if (checked && startDate && (new Date(vacation.endDate) < (new Date(startDate)) )) {
		checked = false;
	}
	
	if (checked && endDate && (new Date(vacation.startDate) > (new Date(endDate)) ) ) {
		checked = false;
	}

	return callback (checked);
};

/**
 * Returns filtered requests
 * 
 * @param {Object} manager
 * @param {Object} statuses
 * @param {Object} startDate
 * @param {Object} endDate
 * @param {Object} vacations
 */

var filterRequests = function(manager, statuses, startDate, endDate, vacations) {
	var result = [];	
	_.each(vacations, function(vacation) {
		checkRequest(vacation, manager, statuses, startDate, endDate, function (checked) {
			if (checked) {
				result.push (vacation);
			}
		});
	});
	return result;
};

var checkRequest = function(vacation, manager, statuses, startDate, endDate, callback) {

	if (statuses) {
		var checked = false;
		if (!(statuses instanceof Array)) {
			statuses = [statuses];
		}

		_.each(statuses, function(status) {
			if (vacation.status == status) {
				checked = true;
			}
		});
		
		if (!checked) {
			return callback (false);
		}
	}
	
	if (manager && ( !vacation.vacationManager || vacation.vacationManager.resource != manager ) ) {
		return callback (false);
	}
	
	if (startDate && vacation.endDate > startDate) {
		return callback (false);
	}
	
	if (endDate && vacation.startDate < endDate) {
		return callback (false);
	}
	
	return callback (true);
};

/**
 * Returns tasks filtered by name
 * 
 * @param {Object} name
 * @param {Object} tasks
 */

var filterTasksByName = function(name, tasks) {
	var result = [];	
	_.each(tasks, function(task) {
		if (task.name == name) {
			result.push(task);
		}
	});
	return result;
};


/**
 * Returns links filtered by project
 * 
 * @param {Object} project
 * @param {Object} links
 */

var filterLinksByProject = function(project, links) {
	var result = [];	
	_.each(links, function(link) {
		if (link.project && link.project.resource == project ) {
			_.each(link.members, function(member) {
				result.push(member);
			});
		}
	});
	return result;
};

/**
 * Returns non-billable roles
 * 
 * @param {Object} roles
 */

var filterNonBillableRoles = function(roles) {
	var result = [];
	_.each(roles, function(role) {
		if (role.isNonBillable) {
			result.push(role);
		}
	});
	return result;
};


// people filter functions
module.exports.filterPeopleByRoles = filterPeopleByRoles;
module.exports.filterPeopleByIsActiveFlag = filterPeopleByIsActiveFlag;
module.exports.filterPeopleWithPrimaryRole = filterPeopleWithPrimaryRole;
module.exports.filterPeopleByGroups = filterPeopleByGroups;

// projects filter functions
module.exports.filterProjectsByExecutiveSponsor = filterProjectsByExecutiveSponsor;
module.exports.filterProjectsBySponsors = filterProjectsBySponsors;
module.exports.filterProjectsByRoleResources = filterProjectsByRoleResources;
module.exports.filterProjectsBetweenDatesByTypes = filterProjectsBetweenDatesByTypes;
module.exports.filterProjectsBetweenDatesByTypesAndSponsors = filterProjectsBetweenDatesByTypesAndSponsors;
module.exports.filterProjectsByStatuses = filterProjectsByStatuses;
module.exports.filterProjectsByResources = filterProjectsByResources;

// assignments filter functions
module.exports.filterAssignmentsByTypes = filterAssignmentsByTypes;

// notifications filter functions
module.exports.filterNotificationsByPerson = filterNotificationsByPerson;

// vacations filter functions
module.exports.filterVacationsByPerson = filterVacationsByPerson;
module.exports.filterVacationsByPeriod = filterVacationsByPeriod;
module.exports.filterRequests = filterRequests;

//tasks filter functions
module.exports.filterTasksByName = filterTasksByName;

//links filter functions
module.exports.filterLinksByProject = filterLinksByProject;

//roles filter functions
module.exports.filterNonBillableRoles = filterNonBillableRoles;
