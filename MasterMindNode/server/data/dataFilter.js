
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
	if (person.isActive && person.primaryRole && roleResources.toString().indexOf(person.primaryRole.resource) != -1) {
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



module.exports.filterActivePeopleByRoleResources = filterActivePeopleByRoleResources;
module.exports.filterActivePeople = filterActivePeople;
module.exports.filterProjectsByExecutiveSponsor = filterProjectsByExecutiveSponsor;
module.exports.filterProjectsBySponsors = filterProjectsBySponsors;
module.exports.filterProjectsByRoleResources = filterProjectsByRoleResources;
module.exports.filterProjectsBetweenDatesByTypes = filterProjectsBetweenDatesByTypes;
module.exports.filterProjectsBetweenDatesByTypesAndSponsors = filterProjectsBetweenDatesByTypesAndSponsors;
