/**
 * Returns $or attribute values by attribute name
 * 
 * @param {Object} query
 * @param {Object} callback
 */

module.exports.getORAttributes = function(query, attributeName) {
	console.log(query);
	console.log(attributeName);
	
	var result = [];
	var orAttributes = query["$or"];

	if (orAttributes instanceof Array) {
		orAttributes.forEach(function (attribute) {
			var val = attribute[attributeName];
			if (val) {
				result.push(val);
			}
		});
	}
	else {
		var val = (orAttributes) ? orAttributes[attributeName] : null;
		if (val) {
			result.push(val);
		}
	}
	
	return (result.length > 0) ? result : null;
};


/**
 * Returns root attribute value by attribute name
 * 
 * @param {Object} query
 * @param {Object} callback
 */
 
module.exports.getRootAttribute = function(query, attributeName) {
	var result = query[attributeName];
	return (result) ? result : null;
};