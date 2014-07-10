var cache = require('memory-cache');

module.exports.putObject = function( key, obj ) {
	cache.put(key, obj);
}; 

module.exports.getObject = function( key ) {
	return cache.get(key);
}; 