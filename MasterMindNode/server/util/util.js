
/**
 * Returns ID from a resource (such as "people/52ab7005e4b0fd2a8d130004")
 * 
 * @param {Object} resource
 * @param {Object} callback
 */

var getIDfromResource = function(resource, callback) {
	
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

var getFullID = function(id, resource) {
	return resource + "/" + id;
};


/**
 * Returns today date in YYYY-MM-DD format
 * 
 */
 
var getTodayDate = function(){
	return module.exports.getDateFromNow();
};

/**
 * Returns date that was a certain number of months ago in YYYY-MM-DD format
 * 
 * @param {Object} monthCountAgo - number of months
 */
     
var getDateFromNow = function(monthCountAgo){
	var dateFromNow = new Date();
	if (monthCountAgo) {
    	dateFromNow.setMonth(dateFromNow.getMonth() + monthCountAgo);
    }
	return getFormattedDate(dateFromNow);
};


/**
 * Returns date in YYYY-MM-DD format
 * 
 * @param {Object} date
 */

var getFormattedDate = function(date) {
	var dd = date.getDate();
	var mm = date.getMonth()+1; //January is 0!
	var yyyy = date.getFullYear();
	if (dd<10){
		dd='0'+dd;
	}
	if (mm<10){
		mm='0'+mm;
	}
	var result = yyyy+'-'+mm+'-'+dd;
	return result;
}


/**
 * Returns previous working date (excluding Saturdays & Sundays)
 */

var getPreviousWorkingDay = function(){
	var cDate = new Date();
    var dayOfWeek;
    
    do {
    	cDate.setDate(cDate.getDate()-1);
    	dayOfWeek = cDate.getDay();
    } while (dayOfWeek == 5 || dayOfWeek == 6 )
    
    return cDate;
};


/**
 *  Checks whether object is a string
 */

var isString = function isString(o) {
    return (Object.prototype.toString.call(o) === '[object String]');
}

module.exports.getIDfromResource = getIDfromResource;
module.exports.getFullID = getFullID;
module.exports.getTodayDate = getTodayDate;
module.exports.getDateFromNow = getDateFromNow;
module.exports.getPreviousWorkingDay = getPreviousWorkingDay;
module.exports.getFormattedDate = getFormattedDate;
module.exports.isString = isString;

    