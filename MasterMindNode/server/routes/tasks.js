'use strict';

var tasks = require( '../controllers/tasks' );

var express = require( 'express' );
var auth = require( '../util/auth' );

var security = require( '../util/security' );
var securityResources = require( '../util/securityResources' );

var router = express.Router( );

router.get( '/', auth.isAuthenticated, function( req, res ) {
	security.isAllowed( req.user, res, securityResources.tasks.resourceName, securityResources.tasks.permissions.viewTasks, function( allowed ) {
		if( allowed ) {
			var query = req.query[ "query" ] ? JSON.parse( req.query[ "query" ] ) : {};
			tasks.listTasks( query, function( err, result ) {
				if( err ) {
					res.json( 500, err );
				} else {
					res.json( result );
				}
			} );

		}
	} );

} );

router.get( '/byname/:name', auth.isAuthenticated, function( req, res ) {

	security.isAllowed( req.user, res, securityResources.tasks.resourceName, securityResources.tasks.permissions.viewTasks, function( allowed ) {
		if( allowed ) {
			var name = req.params.name;
			if( name ) {
				tasks.listTasksByName( name, function( err, result ) {
					if( err ) {
						res.json( 500, err );
					} else {
						res.json( result );
					}
				} );
			} else {
				res.json( 500, 'No required name' );
			}
		}
	} );

} );


router.post( '/', auth.isAuthenticated, function( req, res ) {

	security.isAllowed( req.user, res, securityResources.tasks.resourceName, securityResources.tasks.permissions.editTasks, function( allowed ) {
		if( allowed ) {
			tasks.insertTask( req.body, function( err, result ) {
				if( err ) {
					res.json( 500, err );
				} else {
					res.json( result );
				}
			} );
		}
	} );

} );

router.
delete ( '/', auth.isAuthenticated,
function( req, res ) {

	security.isAllowed( req.user, res, securityResources.tasks.resourceName, securityResources.tasks.permissions.editTasks, function( allowed ) {
		if( allowed ) {
			tasks.deleteTask( req.body, function( err, result ) {
				if( err ) {
					res.json( 500, err );
				} else {
					res.json( result );
				}
			} );
		}
	} );
} );

router.get( '/:id', auth.isAuthenticated, function( req, res ) {
	security.isAllowed( req.user, res, securityResources.tasks.resourceName, securityResources.tasks.permissions.viewTasks, function( allowed ) {
		if( allowed ) {
			var id = req.params.id;
			tasks.getTask( id, function( err, result ) {
				if( err ) {
					res.json( 500, err );
				} else {
					res.json( result );
				}
			} );

		}
	} );
} );

module.exports = router;
