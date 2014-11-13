var _ = require( 'underscore' );
var util = require('../util/util');

/**
 * Returns collection of items with filtered fields
 */

var filterByFields = function(collection, fields) {
	var resultCollection = [];
	
	if (fields) {
		var updFields;
		if (fields instanceof Array) {
			updFields = fields;
		}
		else if (util.isString(fields) && fields.length > 0 && fields != "{}"){
			updFields = [fields];
		}

		if (updFields) {
			var clonedItem = null;
			
			_.each(collection, function(item) {
				
				clonedItem = _.clone(item);
				
				for (var attr in clonedItem) {
				    if (clonedItem.hasOwnProperty(attr)) {
						if (!_.contains(fields, attr)) {
							delete clonedItem[attr];
						}
				    }
				}
				
				resultCollection.push(clonedItem);
			});
			
			
		}
	}
	return resultCollection;
	
};

module.exports.filterByFields = filterByFields;