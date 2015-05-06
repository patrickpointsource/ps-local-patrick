var _ = require('underscore');

// var auth = require('../../util/auth');
// var security = require( '../../util/security' );

var implementations = [
    // 'Tasks'
];
_.each(implementations, function(impl){
    var actualImpl = require('../handler-implementations/'+impl+'.js');
    _.extend(module.exports, actualImpl);
});