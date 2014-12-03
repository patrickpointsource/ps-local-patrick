'use strict';

/**
 * get/update operations for request session
 */

var get = function(session, key) {
  if(!key || !session[key]) {
    return undefined;
  } else {
    return session[key];
  }
};

var update = function(session, key, value) {
  if(!session || !key) {
    return;
  }
  
  session[key] = value;
};

module.exports.get = get;
module.exports.update = update;
