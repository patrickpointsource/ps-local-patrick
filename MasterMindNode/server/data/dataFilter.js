'use strict';

var util = require('../util/util');

/**
 * Returns active people filtered by role resources
 * 
 * @param {Object} roleResources
 * @param {Object} callback
 */

var filterActivePeopleByRoleResources = function(roleResources, people) {
	var result = [];
	people.forEach(function(person) {
		checkActivePeopleByRoleResources(person, roleResources, function (checked) {
			if (checked) {
				result.push(person);
			}
		});
	});
	console.log("result.length=" + result.length);
	return result;
};

var checkActivePeopleByRoleResources = function (person, roleResources, callback) {
	if (!roleResources || person.isActive && person.primaryRole && roleResources.toString().indexOf(person.primaryRole.resource) != -1) {
		callback(true);
	}
	else {
		callback(false);
	}
};


/**
 * Returns active people
 * 
 * @param {Object} roleResources
 * @param {Object} callback
 */

var filterActivePeople = function(people) {
	var result = [];
	people.forEach(function(person) {
		if (person.isActive) {
			result.push(person);
		}
	});
	return result;
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
	projects.forEach(function(project) {
		checkRoleResourcesByRoleTypesInProject(roleTypes, roleResources, project, function (checked){
			if (checked) {
				result.push(project);
			}
		});
	});
	return result;
};


var checkRoleResourcesByRoleTypesInProject = function(roleTypes, roleResources, project, callback) {
	if (roleTypes instanceof Array) {
		roleTypes.forEach(function(roleType) {
			var res = project[roleType];
			if (res && roleResources.toString().indexOf(res.resource) != -1) {
				console.log("return true");
				callback(true);
			}
		});
	}
	else {
		var res = project[roleTypes];
		if (res && roleResources.toString().indexOf(res.resource) != -1) {
			callback(true);
		}
	}
	callback(false);
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
	projects.forEach(function(project) {
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
 * Returns projects filtered by statuses
 * 
 * @param {Object} statuses
 */

var filterProjectsByStatuses = function(statuses, projects) {
	var result = [];
	projects.forEach(function(project) {
		checkProjectByStatuses(statuses, project, function(checked) {
			if (checked) {
				result.push(project);
			}
		});
	});
	return result;
};


var checkProjectByStatuses = function(statuses, project, callback) {
	if (statuses instanceof Array) {
		statuses.forEach(function(status) {
			
			// checks for active projects
			if (status == "active"  &&
					project.startDate <= util.getTodayDate() &&
						(!project.endDate || project.endDate >= util.getTodayDate() ) &&
							project.type == "paid" &&
								project.committed == true ) {
				callback(true);				
			}

			// checks for backlog projects
			if (status == "backlog" &&
					project.startDate > util.getTodayDate() &&
						project.type == "paid" &&
							project.committed == true ) {
				callback(true);				
			}

			// checks for pipeline projects
			if (status == "pipeline" &&
					(!project.endDate || project.endDate >= util.getTodayDate() ) &&
						project.type == "paid" &&
							project.committed == false ) {
				callback(true);				
			}

			// checks for investment projects
			if (status == "investment" &&
					(!project.endDate || project.endDate >= util.getTodayDate() ) &&
						( project.type == "invest" || project.type == "poc" ) ) {
				callback(true);				
			}

			// checks for complete projects
			if (status == "complete" &&
					project.endDate < util.getTodayDate()  &&
							project.committed == true ) {
				callback(true);				
			}

			// checks for deallost projects
			if (status == "deallost" &&
					project.endDate < util.getTodayDate()  &&
							project.committed == false ) {
				callback(true);				
			}

			// checks for ongoing projects
			if (status == "ongoing" &&
					(!project.endDate || project.endDate >= util.getTodayDate() ) &&
						(  project.type == "invest" || project.type == "poc"  || ( project.committed == true && project.type == "paid" ) )  ) {
				callback(true);				
			}

			// checks for unfinished projects
			if (status == "unfinished" &&
					(!project.endDate || project.endDate >= util.getTodayDate() ) ) {
				callback(true);				
			}

			// checks for kick-off projects
			if (status == "kick-off" &&
					project.startDateDate >= util.getTodayDate() &&
						project.committed == true ) {
				callback(true);				
			}
		});
		
		callback(false);
	}
	else {
		checkProjectByStatuses([statuses], project, callback);
	}
}



module.exports.filterActivePeopleByRoleResources = filterActivePeopleByRoleResources;
module.exports.filterActivePeople = filterActivePeople;
module.exports.filterProjectsByExecutiveSponsor = filterProjectsByExecutiveSponsor;
module.exports.filterProjectsBySponsors = filterProjectsBySponsors;
module.exports.filterProjectsByRoleResources = filterProjectsByRoleResources;
module.exports.filterProjectsBetweenDatesByTypes = filterProjectsBetweenDatesByTypes;
module.exports.filterProjectsBetweenDatesByTypesAndSponsors = filterProjectsBetweenDatesByTypesAndSponsors;
module.exports.filterProjectsByStatuses = filterProjectsByStatuses;
