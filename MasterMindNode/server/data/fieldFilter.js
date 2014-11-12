var _ = require( 'underscore' );
var util = require('../util/util');

/**
 * Returns collection of items with filtered fields
 */

var filterByFields = function(collection, fields) {
	if (fields) {
		var updFields;
		if (fields instanceof Array) {
			updFields = fields;
		}
		else if (util.isString(fields) && fields.length > 0 && fields != "{}"){
			updFields = [fields];
		}

		if (updFields) {
			_.each(collection, function(item) {
				for (var attr in item) {
				    if (item.hasOwnProperty(attr)) {
						if (!_.contains(fields, attr)) {
							delete item[attr];
						}
				    }
				}
			});
		}
	}
	return collection;
	
};

module.exports.filterByFields = filterByFields;