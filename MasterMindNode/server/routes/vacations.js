'use strict';

var vacations = require( '../controllers/vacations' );
var express = require( 'express' );
var util = require( '../util/util' );
var auth = require( '../util/auth' );

var router = express.Router( );

var security = require( '../util/security' );
var securityResources = require( '../util/securityResources' );

router.get( '/', auth.isAuthenticated, function( req, res ) {
	security.isAllowed( req.user, res, securityResources.vacations.resourceName, securityResources.vacations.permissions.viewMyVacations, function( allowed ) {
		if( allowed ) {
			var query = req.query[ "query" ] ? JSON.parse( req.query[ "query" ] ) : {};
			// Call to vacations service
			vacations.listVacations( query, function( err, result ) {
				if( err ) {
					res.json( 500, err );
				} else {
					res.json( result );
				}
			} );
		}
	} );
} );

router.get( '/byperson/:person', auth.isAuthenticated, function( req, res ) {
	security.isAllowed( req.user, res, securityResources.vacations.resourceName, securityResources.vacations.permissions.viewVacations, function( allowed ) {
		if( allowed ) {
			var person = req.params.person;
			if (person) {
				var personResource = util.getFullID(person, "people");
				vacations.listVacationsByPerson( personResource, function( err, result ) {
					if( err ) {
						res.json( 500, err );
					} else {
						res.json( result );
					}
				} );
			}
			else {
				res.json( 500, "No required person id attribute");
			}
		}
	} );
} );

router.get('/bytypes/:type', auth.isAuthenticated, function(req, res){
	security.isAllowed(req.user, res, securityResources.vacations.resourceName, securityResources.vacations.permissions.viewVacations, function(allowed){
		if (allowed) 
		{
			var type = req.params.type;
			if (type && type == "getRequests") {
				
				var manager = req.query.manager;
				var statuses = req.query.status;
				var startDate = req.query.startDate;
				var endDate = req.query.endDate;
				
			    vacations.listRequests(manager, statuses, startDate, endDate, function(err, result){
			        if(err){
			            res.json(500, err);
			        } else {
			            res.json(result);
			        }            
			    });
			}
			else {
	            res.json(500, "No required type attribute");
			}
		}
	});
}); 


router.post( '/', auth.isAuthenticated, function( req, res ) {
	security.isAllowed( req.user, res, securityResources.vacations.resourceName, securityResources.vacations.permissions.editVacations, function( allowed ) {
		if( allowed ) {
			vacations.insertVacation( req.body, function( err, result ) {
				if( err ) {
					res.json( 500, err );
				} else {
					res.json( result );
				}
			} );
		}
	} );
} );

router.delete ( '/:id', auth.isAuthenticated, function( req, res ) {
	security.isAllowed( req.user, res, securityResources.vacations.resourceName, securityResources.vacations.permissions.editMyVacations, function( allowed ) {
		if( allowed ) {
			req.body._id = req.params.id;
			vacations.deleteVacation( req.body, function( err, result ) {
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
	security.isAllowed( req.user, res, securityResources.vacations.resourceName, securityResources.vacations.permissions.viewVacations, function( allowed ) {
		if( allowed ) {
			var id = req.params.id;
			vacations.getVacation( id, function( err, result ) {
				if( err ) {
					res.json( 500, err );
				} else {
					res.json( result );
				}
			} );
		}
	} );
} );

router.put( '/:id', auth.isAuthenticated, function( req, res ) {
	security.isAllowed( req.user, res, securityResources.vacations.resourceName, securityResources.vacations.permissions.editMyVacations, function( allowed ) {
		if( allowed ) {
			var id = req.params.id;
			req.body._id = id;
			vacations.insertVacation( req.body, function( err, result ) {
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
