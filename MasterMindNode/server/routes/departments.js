'use strict';

var departments = require( '../controllers/departments' );
var express = require( 'express' );
var util = require( '../util/auth' );

var security = require( '../util/security' );
var securityResources = require( '../util/securityResources' );

var router = express.Router( );

router.get( '/', util.isAuthenticated, function( req, res ) {
	security.isAllowed( req.user, res, securityResources.departments.resourceName, securityResources.departments.permissions.viewDepartments, function( allowed ) {
		if( allowed ) {
			// Call to projects service
			departments.listDepartments( function( err, result ) {
				if( err ) {
					res.json( 500, err );
				} else {
					res.json( result );
				}
			} );
		}
	});
} );

router.get( '/available/people', util.isAuthenticated, function( req, res ) {
	security.isAllowed( req.user, res, securityResources.departments.resourceName, securityResources.departments.permissions.viewDepartments, function( allowed ) {
		if( allowed ) {
			var substr = req.query[ "substr" ] ? req.query[ "substr" ] : "";
			// Call to projects service
			departments.listAvailablePeople( substr, function( err, result ) {
				if( err ) {
					res.json( 500, err );
				} else {
					res.json( result );
				}
			} );
		}
	});
} );

router.get( '/available/code', util.isAuthenticated, function( req, res ) {
	security.isAllowed( req.user, res, securityResources.departments.resourceName, securityResources.departments.permissions.viewDepartments, function( allowed ) {
		if( allowed ) {
			// Call to projects service
			departments.listAvailableCode( function( err, result ) {
				if( err ) {
					res.json( 500, err );
				} else {
					res.json( result );
				}
			} );
		}
	});
} );

router.get( '/search', util.isAuthenticated, function( req, res ) {
	security.isAllowed( req.user, res, securityResources.departments.resourceName, securityResources.departments.permissions.viewDepartments, function( allowed ) {
		if( allowed ) {
			var code = req.query[ "code" ] ? req.query[ "code" ] : "";
            var manager = req.query[ "manager" ] ? req.query[ "manager" ] : "";
            var nickname = req.query[ "nickname" ] ? req.query[ "nickname" ] : "";
            var substr = req.query[ "substr" ] ? req.query[ "substr" ] : "";
			// Call to projects service
			departments.filterDepartments( code, manager, nickname, substr, function( err, result ) {
				if( err ) {
					res.json( 500, err );
				} else {
					res.json( result );
				}
			} );
		}
	});
} );

router.post( '/', util.isAuthenticated, function( req, res ) {
	security.isAllowed( req.user, res, securityResources.departments.resourceName, securityResources.departments.permissions.editDepartments, function( allowed ) {
		if( allowed ) {
			departments.insertDepartment( req.body, function( err, result ) {
				if( err ) {
					res.json( 500, err );
				} else {
					res.json( result );
				}
			} );
		}
	});
} );

router.put( '/:id', util.isAuthenticated, function( req, res ) {
	security.isAllowed( req.user, res, securityResources.departments.resourceName, securityResources.departments.permissions.editDepartments, function( allowed ) {
		if( allowed ) {
			var id = req.params.id;
			
			departments.updateDepartment(id, req.body, function( err, result ) {
				if( err ) {
					res.json( 500, err );
				} else {
					res.json( result );
				}
			} );
		}
	});
} );

router.delete ( '/:id', util.isAuthenticated, function( req, res ) {
	security.isAllowed( req.user, res, securityResources.departments.resourceName, securityResources.departments.permissions.deleteDepartments, function( allowed ) {
		if( allowed ) {
			var id = req.params.id;
			
			departments.deleteDepartment(id, req.body, function( err, result ) {
				if( err ) {
					res.json( 500, err );
				} else {
					res.json( result );
				}
			} );
		}
	});
} );

router.get( '/:id', util.isAuthenticated, function( req, res ) {
	security.isAllowed( req.user, res, securityResources.departments.resourceName, securityResources.departments.permissions.viewDepartments, function( allowed ) {
		if( allowed ) {
			var id = req.params.id;
			
			departments.getDepartment( id, function( err, result ) {
				if( err ) {
					res.json( 500, err );
				} else {
					res.json( result );
				}
			} );
		}
	});
} );

module.exports = router;
