/**
 * Returns active people filtered by role resources
 * 
 * @param {Object} roleResources
 * @param {Object} callback
 */

module.exports.filterActivePeopleByRoleResources = function(roleResources, people) {
	var result = [];
	people.forEach(function(person) {
		if (person.isActive && person.primaryRole && roleResources.toString().indexOf(person.primaryRole.resource) != -1) {
			result.push(person);
		}
	});
	return result;
};


/**
 * Returns active people
 * 
 * @param {Object} roleResources
 * @param {Object} callback
 */

module.exports.filterActivePeople = function(people) {
	var result = [];
	people.forEach(function(person) {
		if (person.isActive) {
			result.push(person);
		}
	});
	return result;
};
