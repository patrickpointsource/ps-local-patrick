
/**
 * Returns ID from a resource (such as "people/52ab7005e4b0fd2a8d130004")
 * 
 * @param {Object} resource
 * @param {Object} callback
 */

module.exports.getIDfromResource = function(resource, callback) {
	
	var ind = resource.lastIndexOf("/");
	if (ind != -1) {
		var ID = resource.substring(ind + 1, resource.length);
		callback(null, ID);
	}
	else {
		callback("No valid resource", null);
	}
};


/**
 * Returns ID with a resource (such as "people/52ab7005e4b0fd2a8d130004")
 * 
 * @param {Object} id
 * @param {Object} resource
 */

module.exports.getFullID = function(id, resource) {
	return resource + "/" + id;
};
