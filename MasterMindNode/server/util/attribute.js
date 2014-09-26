var _ = require( 'underscore' );

/**
 * Returns $or attribute values by parameter name
 * 
 * @param {Object} query
 * @param {Object} callback
 */

module.exports.getORAttributes = function(query, parameterName) {
	return getValuesByAttributeAndParameter(query, '$or', parameterName);
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


getValuesByAttributeAndParameter = function(query, attributeName, parameterName) {
	var result = [];
	var attrs = query[attributeName];

	if (attrs instanceof Array) {
		_.each(attrs, function (attribute) {
			var val = attribute[parameterName];
			if (val) {
				result.push(val);
			}
		});
	}
	else {
		var val = (attrs) ? attrs[attributeName] : null;
		if (val) {
			result.push(val);
		}
	}
	return (result.length > 0) ? result : null;
};
