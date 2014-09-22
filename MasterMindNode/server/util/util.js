
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


/**
 * Returns today date in YYYY-MM-DD format
 * 
 * @param {Object} id
 * @param {Object} resource
 */
 
module.exports.getTodayDate = function(){
	var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; //January is 0!
    var yyyy = today.getFullYear();
    if (dd<10){
    	dd='0'+dd;
	}
    if (mm<10){
    	mm='0'+mm;
	}
    today = yyyy+'-'+mm+'-'+dd;
        
    return today;
};
    
